import { Bot } from 'grammy';
import { Container, Factory, Inject, ObjectFactory } from 'typescript-ioc';
import { Configurations } from '#/core/infrastructure/configuration/configurations';

export const telegramStoryFactory: ObjectFactory = () => {
  const config = Container.get(Configurations);
  const bot = new Bot(config.telegramSuportToken);
  return new Telegram(bot, config);
};

@Factory(telegramStoryFactory)
export class Telegram {
  constructor(
    @Inject
    private readonly bot: Bot,
    @Inject
    private readonly config: Configurations,
  ) {}

  async sendSuportMessage(message: string): Promise<void> {
    await this.bot.api.sendMessage(this.config.telegramSuportChat, message, {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
