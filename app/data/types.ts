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
  groupPredictions: Record<string, ScorePrediction>; // matchId -> scores
  knockoutPredictions: Record<string, KnockoutPrediction>; // matchId -> prediction
  createdAt: string;
}

export interface AdminState {
  isAdmin: boolean;
  results: {
    group: Record<string, ScorePrediction>;
    knockout: Record<string, KnockoutPrediction>;
  };
  topScorer: string;
  topAssist: string;
}
