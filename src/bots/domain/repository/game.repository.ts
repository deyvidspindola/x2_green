import { GameFilter } from '#/core/domain/entities/filters';
import { Game } from '#/core/domain/entities/game';
import { GameInterface } from '#/core/domain/interface/game.interface';

export abstract class GameRepository implements GameInterface {
  abstract setDatabase(database: string): Promise<void>;
  abstract save(game: Game): Promise<void>;
  abstract games(filter: GameFilter): Promise<Game[]>;
}
