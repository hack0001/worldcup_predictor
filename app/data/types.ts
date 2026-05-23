export interface ScorePrediction {
  home: string;
  away: string;
}

export interface KnockoutPrediction {
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  teamName: string;
  topScorer: string;
  topAssist: string;
  avatarUrl: string;
  groupPredictions: Record<string, ScorePrediction>;
  knockoutPredictions: Record<string, KnockoutPrediction>;
  createdAt: string;
}

export interface FantasyPlayer {
  name: string;
  country: string;
  position: "GK" | "DEF" | "MID" | "FWD";
}

export interface FantasySquad {
  id: string;
  playerId: string;
  squad: FantasyPlayer[];
  round: string;
  updatedAt: string;
}

export interface PlayerStat {
  id: string;
  playerName: string;
  country: string;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  minutesPlayed: number;
  round: string;
}

export interface AdminState {
  isAdmin: boolean;
  results: {
    group: Record<string, ScorePrediction>;
    knockout: Record<string, KnockoutPrediction>;
  };
  topScorer: string;
  topAssist: string;
  predictionsLocked: boolean;
  lockTime: string | null; // ISO string, null = no auto lock set
}

export const FANTASY_POINTS = {
  GOAL_FWD: 4,
  GOAL_MID: 5,
  GOAL_DEF: 6,
  GOAL_GK: 6,
  ASSIST: 3,
  CLEAN_SHEET_GK_DEF: 4,
  CLEAN_SHEET_MID: 1,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  SAVE_SET: 1, // per 3 saves
  PLAYED_60: 2,
  PLAYED_SUB_60: 1,
};
