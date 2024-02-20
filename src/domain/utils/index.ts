import { Telegram } from '#/infrastructure/telegram';
import moment from 'moment-timezone';
import { Container } from 'typescript-ioc';
import * as memoryCache from 'memory-cache';
moment.tz.setDefault('America/Sao_Paulo');

export const _getChatData = (ctx: any) => {
  return {
    chat_id: ctx.chat?.id.toString(),
    first_name: ctx.chat?.first_name,
    last_name: ctx.chat?.last_name,
    username: ctx.chat?.username,
    name: `<b>${ctx.chat?.first_name} ${ctx.chat?.last_name}</b>`,
  };
};

export const _today = (type?: string) => {
  if (type && type == 'br') {
    return moment().format('DD/MM/YYYY');
  }
  return moment().format('YYYY-MM-DD');
};

export const _todayNow = () => {
  const time = moment().format('HH:mm:ss:SSS').toString();
  return new Date(_today() + `T${time.slice(0, 2)}:${time.slice(3, 5)}:${time.slice(6, 8)}.${time.slice(9, 12)}Z`);
};

export const _yesterday = (type?: string) => {
  if (type && type == 'br') {
    return moment().subtract(1, 'days').format('DD/MM/YYYY');
  }
  return moment().subtract(1, 'days').format('YYYY-MM-DD');
};

export const _startDate = (data: string) => {
  return new Date(data + 'T00:00:00.000Z');
};

export const _endDate = (data: string) => {
  return new Date(data + 'T23:59:59.999Z');
};

export const _sendSuport = (message: string) => {
  Container.get(Telegram).sendSuportMessage(message);
};

export const _sendSuportError = (message: string) => {
  const today = moment().format('DD/MM/YYYY HH:mm:ss');
  message = `⚠️ <b>Erro:</b>\nData: ${today}\n${message}`;
  Container.get(Telegram).sendSuportMessage(message);
};

export const _setCache = (key: string, value: any, time?: number) => {
  if (time !== undefined) {
    memoryCache.put(key, value);
  }
  memoryCache.put(key, value, time);
};

export const _clearCache = (key: string) => {
  memoryCache.del(key);
};

export const _getCache = (key: string) => {
  return memoryCache.get(key);
};

export const _updateCache = (key: string, value: any) => {
  const cache = memoryCache.get(key);
  if (cache) {
    cache.push(value);
    memoryCache.put(key, cache);
  }
};
