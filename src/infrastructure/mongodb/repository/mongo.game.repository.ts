import { Game } from '#/domain/entities/game';
import { GameInterface } from '#/domain/interface/game.interface';
import { Inject } from 'typescript-ioc';
import { MongoDb } from '#/infrastructure/mongodb';
import { _todayNow } from '#/domain/utils';
import { GameFilter } from '#/domain/entities/filters';
import { Logger } from '@vizir/simple-json-logger';

export class MongoGameRepository implements GameInterface {
  constructor(
    @Inject
    private readonly mongoDb: MongoDb,
    @Inject
    private readonly logger: Logger,
  ) {}

  client = this.mongoDb.client();
  collection = null;

  async setDatabase(database: string) {
    this.collection = this.client.db(database).collection('games');
  }

  async game(bet_id: number): Promise<Game> {
    return await this.collection.findOne({ bet_id });
  }

  async games(filter: GameFilter): Promise<Game[]> {
    let query = {};
    if (filter !== null) {
      query = {
        created_at: {
          $gte: filter.date_start,
          $lte: filter.date_end,
        },
        ...(filter.bet_id ? { bet_id: filter.bet_id } : {}),
      };
    }
    return await this.collection.find(query).toArray();
  }

  async save(game: Game): Promise<void> {
    this.logger.info('Salvando game', game);
    const document = await this.collection.findOne({ bet_id: game.bet_id });
    this.logger.info('Document', document);
    if (document) {
      await this.collection.updateOne(
        { bet_id: game.bet_id },
        {
          $set: {
            result: game.result,
            updated_at: _todayNow(),
          },
        },
      );
      return;
    }
    await this.collection.insertOne(game);
  }
}
