import * as cron from "node-cron";
import { Client } from "discord.js";
import { configJson } from "./configJson";
import { checkLeaderboard } from "./checkLeaderboard";
import { ConfigJson } from "./types";

export class Announcement {
  private static _instance: Announcement;
  private task: cron.ScheduledTask;
  private hasStarted: boolean;

  constructor(client: Client) {
    const { announcementCronExpression } = configJson;

    this.hasStarted = false;

    this.task = cron.schedule(
      announcementCronExpression,
      async () => {
        await checkLeaderboard(client);
      },
      {
        scheduled: false,
      }
    );
  }

  static getInstance(client: Client) {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Announcement(client);
    return this._instance;
  }

  public startTask() {
    this.hasStarted = true;
    this.task.start();
    console.debug("Announcement started.");
  }

  public stopTask() {
    this.hasStarted = false;
    this.task.stop();
    console.debug("Announcement stopped.");
  }

  public didStart() {
    return this.hasStarted;
  }
}

export default Announcement;
