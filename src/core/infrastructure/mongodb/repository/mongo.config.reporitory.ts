import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/core/infrastructure/mongodb';
import { _todayNow } from '#/core/domain/utils';
import { ConfigRepository } from '#/core/domain/repository/config.repository';

export class MongoConfigRepository implements ConfigRepository {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  colelction = this.client.db('portal').collection('config');

  async getBotToken(bot_name: string) {
    const document = await this.colelction.findOne({ name: bot_name });
    return document.token;
  }

  async getApiConfigs() {
    const document = await this.colelction.findOne({ name: 'api' });
    return document;
  }

  async getDiffGols(league: string) {
    const document = await this.colelction.findOne({ name: 'diff-gols' });
    return document.diff.find((item: { league: string }) => item.league === league).gols;
  }

  async getSchedule(bot_name: string) {
    const document = await this.colelction.findOne({ name: bot_name });
    return document.schedule;
  }
}
