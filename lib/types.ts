// Types alignés sur le backend FastAPI (api/serializers.py)
export type Team = { id: number | null; name: string; logo: string };
export type League = { id: number | null; name: string; flag: string; country: string };

export type MatchSummary = {
  fixture_id: string;
  league: League;
  date: string;
  venue: string;
  status: { code: string; elapsed: number | null };
  score: { home: number | null; away: number | null };
  home_team: Team;
  away_team: Team;
  probabilities: {
    over_25: number;
    over_25_raw?: number | null;
    over_25_display?: number | null;
    over_25_confidence_label?: string;
    over_15: number;
    btts: number;
    home_win: number;
    draw: number;
    away_win: number;
  };
  predicted_winner: string;
  winner_proba: number;
  result_selection?: {
    type: "single" | "double_chance" | null;
    pick: "1" | "N" | "2" | "1N" | "N2" | "12" | "";
    label: string;
    probability: number | null;
    confidence: "faible" | "moyenne" | "forte";
    is_result_selection: boolean;
  };
  l2m_selection?: {
    is_selection: boolean;
    pick: "L2M" | "";
    probability: number | null;
    confidence: "faible" | "moyenne" | "forte";
    label: string;
    reason: string;
  };
  is_smart_bet: boolean;
  label: string;
  odds: { over_25: number | null; over_15: number | null; btts: number | null };
};

export type MatchDetail = MatchSummary & {
  form: { home: string[]; away: string[] };
  h2h: Array<{
    date: string;
    home: Team;
    away: Team;
    score: { home: number; away: number };
    winner_id: number | null;
  }>;
  analysis: { commentary: string; model: { xgb: number; lgb: number } };
};
