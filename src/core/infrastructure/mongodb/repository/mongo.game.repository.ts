import { Game } from '#/core/domain/entities/game';
import { GameInterface } from '#/core/domain/interface/game.interface';
import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/core/infrastructure/mongodb';
import { _todayNow } from '#/core/domain/utils';
import { GameFilter } from '#/core/domain/entities/filters';

export class MongoGameRepository implements GameInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
  ) {}

  client = this.mongoDb.client();
  colelction = null;

  async setDatabase(database: string) {
    this.colelction = this.client.db(database).collection('games');
  }

  async games(filter: GameFilter): Promise<Game[]> {
    let query = {};
    if (filter !== null) {
      query = {
        createdAt: {
          $gte: filter.date_start,
          $lte: filter.date_end,
        },
        ...(filter.bet_id ? { bet_id: filter.bet_id } : {}),
      };
    }
    return await this.colelction.find(query).toArray();
  }

  async save(game: Game): Promise<void> {
    const document = await this.colelction.findOne({ bet_id: game.bet_id });
    if (document) {
      await this.colelction.updateOne(
        { bet_id: game.bet_id },
        {
          $set: {
            result: game.result,
            updated_at: _todayNow(),
          },
        },
      );
    }
    await this.colelction.insertOne(game);
  }
}
