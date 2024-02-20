import { GameFilter } from '#/domain/entities/filters';
import { Game } from '#/domain/entities/game';
import { GameInterface } from '#/domain/interface/game.interface';

export abstract class GameRepository implements GameInterface {
  abstract setDatabase(database: string): Promise<void>;
  abstract save(game: Game): Promise<void>;
  abstract games(filter: GameFilter): Promise<Game[]>;
}
