import { getFirestore } from "firebase-admin/firestore";
import { Client, TextChannel } from "discord.js";
import { configJson } from "./configJson";
import GoogleSheetsAuth from "./GoogleSheetsAuth";
import { sleep } from "./utils";
import { LeaderboardResult } from "./types";

export async function checkLeaderboard(
  client: Client,
  ranInteraction: boolean = false
): Promise<LeaderboardResult | null> {
  const { leaderboardSheetName, teamsRange, pointsRange, announcementDelay } =
    configJson;

  const channelId = process.env.ANNOUNCEMENT_CHANNEL_ID;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const googleSheets = await GoogleSheetsAuth.getInstance().getSheetsAPI();

  if (channelId && spreadsheetId && googleSheets) {
    const collection = await getFirestore().collection("leaderboard");

    const query = collection.orderBy("points", "desc").limit(1);
    const result = await query.get();

    let messageStr = "";
    let recentWinningTeam = "";
    let recentWinningTeamPts = 0;

    // Read Firestore
    for (let i = 0; i < result.docs.length; i++) {
      const doc = result.docs[i];
      if (doc.exists) {
        const teamName = doc.id;
        const { points } = doc.data() as {
          points: number | null;
        };
        if (teamName) {
          recentWinningTeam = teamName;
        }
        if (points) {
          recentWinningTeamPts = points;
        }
      }
    }

    // Read Google Sheets
    const teamResult = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${leaderboardSheetName}!${teamsRange}`,
    });

    const pointsResult = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${leaderboardSheetName}!${pointsRange}`,
    });

    let currWinningTeam = "";
    let currWinningTeamPts = 0;

    let currTeams: Array<string> = [];
    let currPts: Array<number> = [];

    if (teamResult?.data?.values) {
      const teams: Array<string> = teamResult.data.values
        .flat()
        .map((name) => name.trim());

      if (teams.length) {
        currWinningTeam = teams[0];
      }
      currTeams = teams;
    }

    if (pointsResult?.data?.values) {
      const pts: Array<number> = pointsResult.data.values
        .flat()
        .map((valueStr) => Number(valueStr.trim()));
      if (pts.length) {
        currWinningTeamPts = pts[0];
      }
      currPts = pts;
    }

    // Send Message
    if (currWinningTeam != recentWinningTeam && currWinningTeamPts > 0) {
      const msg = `${currWinningTeam} took the lead with ${currWinningTeamPts} points!`;
      messageStr = `@here ${msg}`;
      console.debug(`${msg} ranInteraction: ${ranInteraction}`);
    } else {
      console.debug(
        `No new team took the lead. ranInteraction: ${ranInteraction}`
      );
    }

    if (messageStr) {
      if (ranInteraction) {
        await sleep(announcementDelay);
      }
      client.channels
        .fetch(channelId)
        .then((channel) => (channel as TextChannel).send(messageStr))
        .catch(console.error);
    }

    // Write to Firestore
    if (
      currWinningTeam != recentWinningTeam ||
      currWinningTeamPts != recentWinningTeamPts
    ) {
      for (let i = 0; i < currTeams.length; i++) {
        if (i < currPts.length) {
          await collection.doc(currTeams[i]).set({
            points: currPts[i],
          });
        }
      }
    }

    return {
      teamNames: currTeams,
      teamPts: currPts,
    };
  }

  return null;
}
