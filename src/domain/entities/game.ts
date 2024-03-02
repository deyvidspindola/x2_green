export interface Game {
  _id?: string;
  league_id: number;
  league: string;
  event_id: string;
  bet_id: number;
  home_id: number;
  home: string;
  away_id: number;
  away: string;
  result: string;
  created_at: Date;
  updated_at: Date;
}
