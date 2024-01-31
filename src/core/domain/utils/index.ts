import { Telegram } from '#/core/infrastructure/telegram';
import moment from 'moment-timezone';
import { Container } from 'typescript-ioc';
moment.tz.setDefault('America/Sao_Paulo');

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
