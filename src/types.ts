export type ConfigJson = {
  leaderboardSheetName: string;
  teamsRange: string;
  pointsRange: string;
  announcementCronExpression: string;
  announcementDelay: number;
};

export type LeaderboardResult = {
  teamNames: Array<string>;
  teamPts: Array<number>;
};

export type LeaderboardDocData = {
  points: number | null;
};
