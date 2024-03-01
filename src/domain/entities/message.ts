export interface Message {
  _id?: string;
  message_id: string;
  chat_id: string;
  bet_id: number;
  event_id: string;
  league_id: number;
  league: string;
  message: string;
  edited: boolean;
  created_at: Date;
}

export interface SendMessage {
  chat_id: string;
  message: string;
}

export interface EditMessage extends SendMessage {
  message_id: number;
}
