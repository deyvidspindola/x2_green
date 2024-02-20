import { MessageFilter } from '#/domain/entities/filters';
import { Message } from '#/domain/entities/message';
import { MessageInterface } from '#/domain/interface/message.interface';

export abstract class MessageRepository implements MessageInterface {
  abstract setDatabase(database: string): Promise<void>;
  abstract save(message: Message): Promise<void>;
  abstract update(id: string): Promise<void>;
  abstract messages(filter: MessageFilter): Promise<Message[]>;
  abstract getByMessageId(messageId: string);
}
