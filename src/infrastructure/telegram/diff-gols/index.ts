import { DiffGolsReportUseCase } from '#/application/diff-gols/report.usecase';
import { BotCommands } from '#/domain/enums/bot-commands';
import { ChatRepository } from '#/domain/repository/chat.repository';
import { _getChatData } from '#/domain/utils';
import { ChatStatus } from '#/domain/enums/chat-status';
import { EditMessage, SendMessage } from '#/domain/entities/message';
import { TelegramMessage } from '#/domain/entities/telegram-message';
import { _todayNow } from '#/domain/utils';
import { Bot, GrammyError } from 'grammy';
import { StatusCodes } from 'http-status-codes';
import { Container, Factory, Inject, ObjectFactory } from 'typescript-ioc';

export const diffGolsStoryFactory: ObjectFactory = () => {
  const bot = new Bot('6963027528:AAFHOPLulyuy7tE_HPrhc7o4ykwfTeAdyC8');
  return new DiffGolsBot(bot);
};

@Factory(diffGolsStoryFactory)
export class DiffGolsBot {
  private readonly chat: ChatRepository;
  constructor(
    @Inject
    private readonly bot: Bot,
  ) {
    this.chat = Container.get(ChatRepository);
    this.chat.setDatabase('diff-gols');
  }

  async start() {
    this.bot.start();
    await this.subscribe();
    await this.unsubscribe();
    await this.report();
  }

  async subscribe() {
    this.bot.command(BotCommands.START, async (ctx) => {
      const { chat_id, name, first_name, last_name } = _getChatData(ctx);
      if (await this.chat.exists(chat_id)) {
        this.sendMessage({
          chat_id,
          message: `Olá ${name}, você já está cadastrado.\nPara cancelar o recebimento de mensagens, digite /${BotCommands.OUT}`,
        });
        return;
      }
      await this.chat.save({
        chat_id,
        first_name,
        last_name,
        status: ChatStatus.ACTIVE,
        created_at: _todayNow(),
        updated_at: _todayNow(),
      });
      this.sendMessage({
        chat_id,
        message: `Olá ${name}, seja bem vindo(a)!.\nPara cancelar o recebimento de mensagens, digite /${BotCommands.OUT}`,
      });
    });
  }

  async unsubscribe() {
    this.bot.command(BotCommands.OUT, async (ctx) => {
      const { chat_id, name } = _getChatData(ctx);
      if (!(await this.chat.exists(chat_id))) {
        this.sendMessage({
          chat_id,
          message: `Olá ${name}, você não está cadastrado.\nPara receber mensagens, digite /${BotCommands.START}`,
        });
        return;
      }
      await this.chat.remove(chat_id);
      this.sendMessage({
        chat_id,
        message: `Olá ${name}, você não receberá mais mensagens.\nPara voltar a receber, digite /${BotCommands.START}`,
      });
    });
  }

  async report() {
    this.bot.command(BotCommands.REPORT, async (ctx) => {
      const { chat_id, name } = _getChatData(ctx);
      if (!(await this.chat.exists(chat_id))) {
        this.sendMessage({
          chat_id,
          message: `Olá ${name}, você não está cadastrado.\nPara receber mensagens, digite /${BotCommands.START}`,
        });
        return;
      }
      await Container.get(DiffGolsReportUseCase).sendPartailReport(chat_id);
    });
  }

  async sendMessage(message: SendMessage): Promise<TelegramMessage> {
    return await this.bot.api
      .sendMessage(message.chat_id, message.message, {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        protect_content: true,
      })
      .catch(async (error: GrammyError) => {
        if (error.error_code === StatusCodes.FORBIDDEN) {
          await this.chat.remove(Number(message.chat_id));
        }
        throw error;
      });
  }

  async editMessage(message: EditMessage) {
    await this.bot.api.editMessageText(message.chat_id, message.message_id, message.message, {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
