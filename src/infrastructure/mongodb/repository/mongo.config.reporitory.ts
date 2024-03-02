import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/infrastructure/mongodb';
import { _getCache, _setCache, _todayNow } from '#/domain/utils';
import { ConfigRepository } from '#/domain/repository/config.repository';

export class MongoConfigRepository implements ConfigRepository {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  collection = this.client.db('portal').collection('config');

  async getDiffGols(league: string) {
    const document = await this.collection.findOne({ name: 'diff-gols' });
    return document.diff.find((item: { league: string }) => item.league === league).gols;
  }

  async getLeaguesConfigs() {
    const document = await this.collection.findOne({ name: 'diff-gols' });
    return document.diff;
  }
}
