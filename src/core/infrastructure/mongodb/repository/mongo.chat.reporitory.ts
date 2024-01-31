import { Chat } from '#/core/domain/entities/chat';
import { ChatInterface } from '#/core/domain/interface/chat.interface';
import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/core/infrastructure/mongodb';
import * as memoryCache from 'memory-cache';
import { ChatStatus } from '#/core/domain/entities/enums/chat-status';
import { _todayNow } from '#/core/domain/utils';

export class MongoChatRepository implements ChatInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  colelction = null;

  async setDatabase(database: string) {
    this.colelction = this.client.db(database).collection('chats');
  }

  async save(chat: Chat): Promise<void> {
    const document = await this.colelction.findOne({ chat_id: chat.chat_id });
    if (document) {
      await this.colelction.updateOne(
        { chat_id: chat.chat_id },
        {
          $set: {
            status: chat.status,
            updated_at: _todayNow(),
            deleted_at: null,
          },
        },
      );
      return;
    }
    await this.colelction.insertOne(chat);
    await this.updateCache();
  }

  async remove(chat_id: number): Promise<void> {
    await this.colelction.updateOne(
      { chat_id },
      {
        $set: {
          status: ChatStatus.INACTIVE,
          updated_at: _todayNow(),
          deleted_at: _todayNow(),
        },
      },
    );
    await this.updateCache();
  }

  async chats(): Promise<Chat[]> {
    let chats = memoryCache.get('chats');
    if (chats) {
      return chats;
    }
    return await this.updateCache();
  }

  async exists(chat_id: number): Promise<boolean> {
    const chats = await this.colelction.find().toArray();
    return chats.some((chat: Chat) => chat.chat_id === chat_id && chat.status === ChatStatus.ACTIVE);
  }

  async updateCache() {
    let chats = await this.colelction.find().toArray();
    chats = chats
      .map((chat: unknown) => chat as unknown as Chat)
      .filter((chat: { status: ChatStatus }) => chat.status === ChatStatus.ACTIVE);
    memoryCache.put('chats', chats, 60000);
    return chats;
  }
}
