export interface ScorePrediction {
  home: string;
  away: string;
}

// What a player predicts for a knockout match
export interface KnockoutPrediction {
  homeTeam: string;
  awayTeam: string;
  homeScore: string;   // normal time score
  awayScore: string;
  goesToET: boolean;   // do they predict ET?
  etHomeScore: string; // score after ET (cumulative)
  etAwayScore: string;
  goesToPens: boolean; // do they predict pens?
  penWinner: string;   // team name they think wins on pens
}

// What actually happened in a knockout match (admin enters)
export interface KnockoutResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: string;   // normal time
  awayScore: string;
  wentToET: boolean;
  etHomeScore: string; // cumulative score after ET
  etAwayScore: string;
  wentToPens: boolean;
  penWinner: string;   // team that won on pens
}

export interface Player {
  id: string;
  name: string;
  email: string;
  teamName: string;
  topScorer: string;
  topAssist: string;
  avatarUrl: string;
  status: string;
  leagueIds: string[];
  currentLeagueId: string;
  tournamentWinner: string;
  playerOfTournament: string;
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
  matchId?: string;       // e.g. "A-0-1"
  matchLabel?: string;    // e.g. "Mexico vs South Africa"
}

export interface AdminState {
  isAdmin: boolean;
  results: {
    group: Record<string, ScorePrediction>;
    knockout: Record<string, KnockoutResult>;
  };
  topScorer: string;
  topAssist: string;
  tournamentWinner: string;
  playerOfTournament: string;
  predictionsLocked: boolean;
  lockTime: string | null;
  fantasyLocked: boolean;
}

// ── Scoring constants ─────────────────────────────────────
export const POINTS = {
  // Group stage
  GROUP_CORRECT_RESULT: 4,
  GROUP_CORRECT_SCORE: 8,
  GROUP_CORRECT_WINNER: 10,
  GROUP_CORRECT_RUNNER_UP: 7,
  GROUP_CORRECT_THIRD: 5,

  // R32 and R16
  EARLY_KO_CORRECT_RESULT: 6,
  EARLY_KO_CORRECT_SCORE: 12,
  EARLY_KO_CORRECT_QUALIFIER: 5,

  // QF, SF, Final
  LATE_KO_CORRECT_RESULT: 10,
  LATE_KO_CORRECT_SCORE: 18,
  CORRECT_QUARTER_FINALIST: 8,
  CORRECT_SEMI_FINALIST: 15,
  CORRECT_FINALIST: 20,
  CORRECT_WINNER: 40,

  // ET & Pens (any knockout)
  PREDICTS_ET: 8,
  CORRECT_ET_SCORE: 15,
  PREDICTS_PENS: 10,
  CORRECT_PEN_WINNER: 15,

  // Awards
  GOLDEN_BOOT: 20,
  TOP_ASSIST: 15,
  PLAYER_OF_TOURNAMENT: 20,
  TOURNAMENT_WINNER: 40,
};

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
  SAVE_SET: 1,
  PLAYED_60: 2,
  PLAYED_SUB_60: 1,
};
