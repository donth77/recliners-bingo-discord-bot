import { getFirestore } from "firebase-admin/firestore";
import { Client, TextChannel } from "discord.js";
import { configJson } from "./configJson";
import GoogleSheetsAuth from "./GoogleSheetsAuth";
import { setsAreEqual, sleep } from "./utils";
import { LeaderboardDocData, LeaderboardResult } from "./types";

export async function checkLeaderboard(
  client: Client,
  ranInteraction: boolean = false
): Promise<LeaderboardResult | null> {
  const { leaderboardSheetName, teamsRange, pointsRange, announcementDelay } =
    configJson;

  const channelId = process.env.ANNOUNCEMENT_CHANNEL_ID;
  const spreadsheetId = process.env.SPREADSHEET_ID;

  try {
    const googleSheets = await GoogleSheetsAuth.getInstance().getSheetsAPI();

    if (channelId && spreadsheetId && googleSheets) {
      const collection = await getFirestore().collection("leaderboard");

      // Read Firestore
      const query = collection.orderBy("points", "desc");
      const result = await query.get();

      let messageStr = "";
      let recentWinningTeams: Array<string> = [];

      // Find most recent teams with the most points
      if (result.docs.length) {
        recentWinningTeams.push(result.docs[0].id);
      }

      for (let i = 1; i < result.docs.length; i++) {
        const doc = result.docs[i];
        if (doc.exists) {
          const teamName = doc.id;
          const { points } = doc.data() as LeaderboardDocData;

          const prevDoc = result.docs[i - 1];
          if (prevDoc.exists) {
            const { points: prevPoints } = prevDoc.data() as LeaderboardDocData;

            if (points !== prevPoints) {
              break;
            }
            if (i < result.docs.length) {
              recentWinningTeams.push(teamName);
            }
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

      let currWinningTeams: Array<string> = [];
      let currWinningTeamPts = 0;

      let currTeams: Array<string> = [];
      let currPts: Array<number> = [];

      if (teamResult?.data?.values) {
        currTeams = teamResult.data.values.flat().map((name) => name.trim());
      }

      if (pointsResult?.data?.values) {
        currPts = pointsResult.data.values
          .flat()
          .map((valueStr) => Number(valueStr.trim()));
        if (currPts.length) {
          currWinningTeamPts = currPts[0];
        }
      }

      // Find current teams with the most points
      if (currTeams.length) {
        currWinningTeams.push(currTeams[0]);
      }

      for (let i = 1; i < currPts.length; i++) {
        if (currPts[i] !== currPts[i - 1]) {
          break;
        }
        if (i < currTeams.length) {
          currWinningTeams.push(currTeams[i]);
        }
      }

      const winningTeamsEqual = setsAreEqual(
        new Set(currWinningTeams),
        new Set(recentWinningTeams)
      );

      // Send Message
      if (
        currWinningTeams.length > 0 &&
        !winningTeamsEqual &&
        currWinningTeamPts > 0
      ) {
        let msg = "";
        if (currWinningTeams.length == 1) {
          msg = `${currWinningTeams[0]} took the lead`;
        } else if (currWinningTeams.length == 2) {
          msg = `${currWinningTeams[0]} and ${currWinningTeams[1]} are both tied for the lead`;
        } else {
          for (let i = 0; i < currWinningTeams.length - 1; i++) {
            msg += `${currWinningTeams[i]}, `;
          }
          msg += `and ${
            currWinningTeams[currWinningTeams.length - 1]
          } are all tied for the lead`;
        }

        msg += ` with ${currWinningTeamPts} points!`;
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
      if (!winningTeamsEqual) {
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
  } catch (err) {
    console.error(err);
  }

  return null;
}
