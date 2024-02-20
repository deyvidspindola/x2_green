import { Chat } from '#/domain/entities/chat';
import { ChatInterface } from '#/domain/interface/chat.interface';

export abstract class ChatRepository implements ChatInterface {
  abstract setDatabase(database: string): Promise<void>;
  abstract save(chat: Chat): Promise<void>;
  abstract remove(chat_id: number): Promise<void>;
  abstract chats(): Promise<Chat[]>;
  abstract exists(chat_id: number): Promise<boolean>;
}
