import { MessageFilter } from '#/domain/entities/filters';
import { Message } from '#/domain/entities/message';

export interface MessageInterface {
  setDatabase(database: string): Promise<void>;
  save(message: Message): Promise<void>;
  update(id: string): Promise<void>;
  messages(filter: MessageFilter);
}
