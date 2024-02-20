export abstract class ConfigRepository {
  abstract getBotToken(bot_name: string);
  abstract getApiConfigs();
  abstract getDiffGols(league: string);
  abstract getSchedule(bot_name: string);
}
