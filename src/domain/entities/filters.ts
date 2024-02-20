export interface PeriodFilter {
  date_start?: Date;
  date_end?: Date;
}

export interface MessageFilter extends PeriodFilter {
  edited?: boolean;
}

export interface GameFilter extends PeriodFilter {
  league_id?: number;
  event_id?: number;
  bet_id?: number;
}
