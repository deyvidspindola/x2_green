import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/infrastructure/mongodb';
import { ChatInterface } from '#/domain/interface/chat.interface';
import { Chat } from '#/domain/entities/chat';
import { ChatStatus } from '#/domain/enums/chat-status';
import { _clearCache, _getCache, _setCache, _todayNow } from '#/domain/utils';

export class MongoChatRepository implements ChatInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  collection = null;

  async setDatabase(database: string) {
    this.collection = this.client.db(database).collection('chats');
  }

  async save(chat: Chat): Promise<void> {
    const document = await this.collection.findOne({ chat_id: chat.chat_id });
    if (document) {
      await this.collection.updateOne(
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
    await this.collection.insertOne(chat);
    _clearCache('chats');
    await this.updateCache();
  }

  async remove(chat_id: number): Promise<void> {
    await this.collection.updateOne(
      { chat_id },
      {
        $set: {
          status: ChatStatus.INACTIVE,
          updated_at: _todayNow(),
          deleted_at: _todayNow(),
        },
      },
    );
    _clearCache('chats');
    await this.updateCache();
  }

  async chats(): Promise<Chat[]> {
    let chats = _getCache('chats');
    if (chats) {
      return chats;
    }
    return await this.updateCache();
  }

  async exists(chat_id: number): Promise<boolean> {
    const chats = await this.collection.find().toArray();
    return chats.some((chat: Chat) => chat.chat_id === chat_id && chat.status === ChatStatus.ACTIVE);
  }

  async updateCache() {
    let chats = await this.collection.find().toArray();
    chats = chats
      .map((chat: unknown) => chat as unknown as Chat)
      .filter((chat: { status: ChatStatus }) => chat.status === ChatStatus.ACTIVE);
    _setCache('chats', chats, 60000);
    return chats;
  }
}
