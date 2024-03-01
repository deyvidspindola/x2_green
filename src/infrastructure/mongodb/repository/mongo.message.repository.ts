import { MessageInterface } from '#/domain/interface/message.interface';
import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/infrastructure/mongodb';
import { _getCache, _setCache, _todayNow } from '#/domain/utils';
import { Message } from '#/domain/entities/message';
import { MessageFilter } from '#/domain/entities/filters';

export class MongoMessageRepository implements MessageInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  collection = null;

  async setDatabase(database: string) {
    this.collection = this.client.db(database).collection('messages');
  }

  async save(message: Message): Promise<void> {
    await this.collection.insertOne(message);
  }

  async update(id: string): Promise<void> {
    await this.collection.updateOne(
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
    let query = {};
    if (filter !== null) {
      query = {
        created_at: {
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

    let messages = await this.collection.find(query).toArray();
    messages = messages.map((message: unknown) => message as unknown as Message);
    return messages;
  }

  async getByMessageId(messageId: string) {
    const regex = new RegExp(messageId, 'i');
    const message = await this.collection.findOne({
      message_id: { $regex: regex },
    });
    return message;
  }
}
