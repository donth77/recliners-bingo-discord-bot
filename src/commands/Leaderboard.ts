import { BaseCommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import { checkLeaderboard } from "../checkLeaderboard";
import { LeaderboardResult } from "../types";

export const Leaderboard: Command = {
  name: "leaderboard",
  description: "Shows the leaderboard",
  type: "CHAT_INPUT",
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    let responseStr = "";

    const leaderboardResult: LeaderboardResult | null = await checkLeaderboard(
      client,
      true
    );

    if (leaderboardResult) {
      const { teamNames, teamPts } = leaderboardResult;
      for (let i = 0; i < teamNames.length; i++) {
        responseStr += `**${i + 1}.** ${teamNames[i]}`;
        if (i < teamPts.length) {
          responseStr += ` - ${teamPts[i]}`;
        }

        responseStr += "\n";
      }
    }

    await interaction.followUp({
      ephemeral: true,
      content: responseStr,
    });
  },
};
