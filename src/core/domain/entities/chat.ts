import { ChatStatus } from './enums/chat-status';

export interface Chat {
  id?: string;
  first_name: string;
  last_name: string;
  chat_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  status: ChatStatus;
}
