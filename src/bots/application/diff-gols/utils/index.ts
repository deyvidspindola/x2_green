import { ConfigRepository } from '#/core/domain/repository/config.repository';
import { Container } from 'typescript-ioc';
import * as memoryCache from 'memory-cache';

export const _formatTeam = (team: string) => {
  const formattedName = team.replace(/\(([^)]+)\)/, (_, name) => `(<b>${name}</b>)`);
  const newTeam = formattedName.replace(' Esports', '');
  return newTeam;
};

export const _calcDiff = async (ss: string, league: string) => {
  const diffGols = await Container.get(ConfigRepository).getDiffGols(league);
  const result = ss.split('-');
  const diff = Math.abs(parseInt(result[0]) - parseInt(result[1]));
  return {
    diff,
    result: diff >= diffGols,
  };
};

export const _hasSend = (game_id: string) => {
  const game = memoryCache.get('hasSend');
  if (!game) return true;
  memoryCache.put('hasSend', game_id, 60000);
  return !game.includes(game_id);
};

export const _saveSend = (game_id: string) => {
  const game = memoryCache.get('hasSend');
  if (!game) {
    memoryCache.put('hasSend', [game_id], 60000);
  } else {
    game.push(game_id);
    memoryCache.put('hasSend', game, 60000);
  }
};
