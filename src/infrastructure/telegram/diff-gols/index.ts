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
import { Logger } from '@vizir/simple-json-logger';
import { Menu, MenuRange } from '@grammyjs/menu';
import moment from 'moment';
import { Configurations } from '#/infrastructure/configuration/configurations';

export const diffGolsStoryFactory: ObjectFactory = () => {
  const config = Container.get(Configurations);
  const bot = new Bot(config.botDiffGolsToken);
  return new DiffGolsBot(bot);
};

@Factory(diffGolsStoryFactory)
export class DiffGolsBot {
  private readonly chat: ChatRepository;
  @Inject
  private readonly logger: Logger;
  constructor(
    @Inject
    private readonly bot: Bot,
  ) {
    this.chat = Container.get(ChatRepository);
    this.chat.setDatabase('diff-gols');
  }

  async start() {
    this.logger.info('Bot Diff Gols telegram iniciado');
    this.bot.start();
    await this.subscribe();
    await this.unsubscribe();
    await this.reports();
  }

  async subscribe() {
    this.logger.info('Bot Diff Gols telegram subscribe');
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

  async reports() {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const reportsMenu = new Menu('reports')
      .text('Relatorio Parcial Diario', async (ctx) => {
        await Container.get(DiffGolsReportUseCase).sendPartailDailyReportSendGames(ctx.chat?.id.toString());
      })
      .row()
      .submenu('Relatorio Meses Anterior', 'report-months')
      .row()
      .text('Relatorio do Mês Atual', async (ctx) => {
        const month = moment().month();
        await Container.get(DiffGolsReportUseCase).sendCurrentMonthlyReportSendGames(
          ctx.chat?.id.toString(),
          month.toString(),
        );
      })
      .row();

    const reportMontsMenu = new Menu('report-months')
      .dynamic(() => {
        const range = new MenuRange();
        const currentMonth = moment().month();
        for (let i = 0; i < currentMonth; i++) {
          range.text(months[i], async (ctx) => {
            await Container.get(DiffGolsReportUseCase).sendCurrentMonthlyReportSendGames(
              ctx.chat?.id.toString(),
              i.toString(),
            );
          });
        }
        return range;
      })
      .row()
      .back('Voltar')
      .row();

    reportsMenu.register(reportMontsMenu);
    this.bot.use(reportsMenu);
    this.bot.use(reportMontsMenu);

    this.bot.command(BotCommands.REPORT, async (ctx) => {
      const { chat_id, name } = _getChatData(ctx);
      if (!(await this.chat.exists(chat_id))) {
        this.sendMessage({
          chat_id,
          message: `Olá ${name}, você não está cadastrado.\nPara receber mensagens, digite /${BotCommands.START}`,
        });
        return;
      }
      await ctx.reply('Relatórios Bot X2 Green', { reply_markup: reportsMenu });
    });
  }

  async sendMessage(message: SendMessage): Promise<TelegramMessage> {
    this.logger.info('Bot Diff Gols telegram sendMessage', { message });
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

  async editMessage(message: EditMessage): Promise<void> {
    this.logger.info('Bot Diff Gols telegram editMessage', { message });
    await this.bot.api.editMessageText(message.chat_id, Number(message.message_id), message.message, {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
