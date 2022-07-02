import { BaseCommandInteraction, Client, Permissions } from "discord.js";
import { Command } from "../Command";
import Announcement from "../Announcement";

export const AnnouncementStart: Command = {
  name: "announcementstart",
  description: "Starts the announcement cron task",
  type: "CHAT_INPUT",
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const announcement = Announcement.getInstance(client);
    let message = "The announcement has already started.";

    if (!announcement.didStart()) {
      if (interaction.memberPermissions) {
        const bitPermissions = new Permissions(interaction.memberPermissions);
        if (bitPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          Announcement.getInstance(client).startTask();
          message = "Announcement started.";
        } else {
          message = "You need administrator permissions to run this command.";
        }
      } else {
        message = "You don't have proper permissions to run this command.";
      }
    }

    await interaction.followUp({
      ephemeral: true,
      content: message,
    });
  },
};
