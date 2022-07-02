import { BaseCommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Reclined: Command = {
  name: "reclined",
  description: "Reclined",
  type: "CHAT_INPUT",
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const content = `${process.env.RECLINED_EMOTE}`;

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
