export interface Inplay {
  id: string;
  sport_id: string;
  time: string;
  time_status: string;
  league: League;
  home: Player;
  away: Player;
  ss: string;
  our_event_id: string;
  r_id: string;
  ev_id: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface League {
  id: string;
  name: string;
}

export interface InplayFilter {
  league: string;
}

export interface EventsFilter {
  event_id: string;
  stast?: string;
  lineup?: string;
}
