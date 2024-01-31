import { Chat } from '#/core/domain/entities/chat';

export interface ChatInterface {
  setDatabase(database: string): Promise<void>;
  save(chat: Chat): Promise<void>;
  remove(chat_id: number): Promise<void>;
  chats(): Promise<Chat[]>;
  exists(chat_id: number): Promise<boolean>;
}
