import { Message } from '#/core/domain/entities/message';
import { MessageInterface } from '#/core/domain/interface/message.interface';

export abstract class MessageRepository implements MessageInterface {
  abstract setDatabase(database: string): Promise<void>;
  abstract save(message: Message): Promise<void>;
  abstract update(id: string): Promise<void>;
  abstract messages(): Promise<Message[]>;
}
