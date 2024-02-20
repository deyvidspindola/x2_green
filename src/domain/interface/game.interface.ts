import { GameFilter } from '#/domain/entities/filters';
import { Game } from '#/domain/entities/game';

export interface GameInterface {
  setDatabase(database: string): Promise<void>;
  games(filter: GameFilter): Promise<Game[]>;
  save(game: Game): Promise<void>;
}
