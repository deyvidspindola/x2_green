import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { Factory, ObjectFactory, Singleton } from 'typescript-ioc';
import { load } from 'js-yaml';

config();

const configProivder: ObjectFactory = () => {
  const configFileName = `config/server-config.yml`;
  const config = load(readFileSync(configFileName, 'utf8'));
  return new Configurations(config);
};

@Singleton
@Factory(configProivder)
export class Configurations {
  public config: any;
  constructor(config: any) {
    this.config = config;
  }

  /**
   * ENVIRONMENT
   */
  public get environment(): string {
    return this.getEnvVariable(this.config.environment);
  }

  /**
   * MONDODB
   */
  public get mongoDbDriver(): string {
    return this.getEnvVariable(this.config.mongodb.driver);
  }

  public get mongoDbUri(): string {
    return this.getEnvVariable(this.config.mongodb.uri);
  }

  public get mongoDbUsename(): string {
    return this.getEnvVariable(this.config.mongodb.username);
  }

  public get mongoDbPassword(): string {
    return this.getEnvVariable(this.config.mongodb.password);
  }

  /**
   * TELEGRAM
   */

  public get telegramSuportChat(): string {
    return this.getEnvVariable(this.config.telegram.suport.chatId);
  }

  public get telegramSuportToken(): string {
    return this.getEnvVariable(this.config.telegram.suport.token);
  }

  /**
   * BET
   */

  public get betUrl(): string {
    return this.getEnvVariable(this.config.bet.url);
  }

  public get betApiUrl(): string {
    return this.getEnvVariable(this.config.bet.apiUrl);
  }

  /**
   * BOTS
   */

  public get botDiffGolsName(): string {
    return this.getEnvVariable(this.config.bots.diffGols);
  }

  private getEnvVariable(value: any) {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const envVariable = value.substring(2, value.length - 1);
      return process.env[envVariable];
    }
    return value;
  }
}
