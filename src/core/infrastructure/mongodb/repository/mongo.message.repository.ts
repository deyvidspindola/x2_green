import { MessageInterface } from '#/core/domain/interface/message.interface';
import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/core/infrastructure/mongodb';
import * as memoryCache from 'memory-cache';
import { _todayNow } from '#/core/domain/utils';
import { Message } from '#/core/domain/entities/message';
import { MessageFilter } from '#/core/domain/entities/filters';

export class MongoMessageRepository implements MessageInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  colelction = null;

  async setDatabase(database: string) {
    this.colelction = this.client.db(database).collection('messages');
  }

  async save(message: Message): Promise<void> {
    await this.colelction.insertOne(message);
  }

  async update(id: string): Promise<void> {
    await this.colelction.updateOne(
      { _id: id },
      {
        $set: {
          edited: true,
          updated_at: _todayNow(),
        },
      },
    );
  }

  async messages(filter: MessageFilter): Promise<Message[]> {
    let messages = memoryCache.get('messages');
    if (messages) {
      return messages;
    }
    let query = {};
    if (filter !== null) {
      query = {
        createdAt: {
          $gte: filter.date_start,
          $lte: filter.date_end,
        },
      };
      if (filter.edited !== undefined) {
        if ('edited' in query) {
          query.edited = filter.edited;
        } else {
          query = {
            ...query,
            edited: filter.edited,
          };
        }
      }
    }
    messages = await this.colelction.find(query).toArray();
    messages = messages.map((message: unknown) => message as unknown as Message);
    memoryCache.put('messages', messages, 60000);
    return messages;
  }
}
