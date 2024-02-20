import { ConfigRepository } from '#/domain/repository/config.repository';
import { Container } from 'typescript-ioc';
import { _getCache, _setCache, _updateCache } from '#/domain/utils';

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
  const game = _getCache('hasSend');
  if (game) {
    return game.includes(game_id);
  }
  return false;
};

export const _saveSend = (game_id: string) => {
  const game = _getCache('hasSend');
  const time = 20 * 60 * 1000;
  if (game) {
    game.push(game_id);
    _updateCache('hasSend', game);
    return;
  }
  _setCache('hasSend', [game_id], time);
};

export const _lastGoal = (la: string) => {
  const [minute, goalInfo, team] = la.split('-').map((item) => item.trim());
  const goalRegex = /(\d+)(?:st|nd|rd|th)?/;
  const goalNumberMatch = goalInfo.match(goalRegex);
  if (!goalNumberMatch) {
    return undefined;
  }
  const goalNumber = goalNumberMatch[1];
  const formatTeam = _formatTeam(team.replace(/^\((.*)\)$/, '$1'));
  const formattedGoal = `⚽️  <b>${minute}</b> - ${goalNumber}º Gol - ${formatTeam}`;
  return formattedGoal;
};
