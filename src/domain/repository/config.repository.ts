export abstract class ConfigRepository {
  abstract getDiffGols(league: string): Promise<any>;
  abstract getLeaguesConfigs(): Promise<any>;
}
