import { GameFilter } from '#/core/domain/entities/filters';
import { Game } from '#/core/domain/entities/game';

export interface GameInterface {
  setDatabase(database: string): Promise<void>;
  games(filter: GameFilter): Promise<Game[]>;
  save(game: Game): Promise<void>;
}
