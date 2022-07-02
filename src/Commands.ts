import { Command } from "./Command";
import { Hello } from "./commands/Hello";
import { Reclined } from "./commands/Reclined";
import { Leaderboard } from "./commands/Leaderboard";
import { AnnouncementStart } from "./commands/AnnouncementStart";
import { AnnouncementStop } from "./commands/AnnouncementStop";

export const Commands: Command[] = [
  Hello,
  Reclined,
  Leaderboard,
  AnnouncementStart,
  AnnouncementStop,
];
