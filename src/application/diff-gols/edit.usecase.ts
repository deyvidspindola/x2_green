import { EditMessage, Message } from '#/domain/entities/message';
import { ChatRepository } from '#/domain/repository/chat.repository';
import { GameRepository } from '#/domain/repository/game.repository';
import { MessageRepository } from '#/domain/repository/message.repository';
import { _endDate, _sendSuport, _sendSuportError, _startDate, _today } from '#/domain/utils';
import { Configurations } from '#/infrastructure/configuration/configurations';
import moment from 'moment';
import { schedule } from 'node-cron';
import { Inject } from 'typescript-ioc';
import { _calcDiff, _formatTeam } from './utils';
import { DiffGolsBot } from '#/infrastructure/telegram/diff-gols';
import { Logger } from '@vizir/simple-json-logger';
import { MessageFilter } from '#/domain/entities/filters';

export class DiffGolsEditMessageUseCase {
  constructor(
    @Inject
    private readonly logger: Logger,
    @Inject
    private readonly configuration: Configurations,
    @Inject
    private readonly chat: ChatRepository,
    @Inject
    private readonly message: MessageRepository,
    @Inject
    private readonly game: GameRepository,
    @Inject
    private readonly bot: DiffGolsBot,
  ) {}

  async execute() {
    await this.initialize();
    await this.startBot();
    _sendSuport('🤖 Bot Diff Gols edit message iniciado');
  }

  private async initialize() {
    this.logger.info('Bot Diff Gols edit message iniciado');
    this.chat.setDatabase(this.configuration.botDiffGolsName);
    this.message.setDatabase(this.configuration.botDiffGolsName);
    this.game.setDatabase(this.configuration.botDiffGolsName);
  }

  private async startBot() {
    schedule('*/5 * * * * *', async () => {
      await this.process();
    });
  }

  private async process() {
    this.logger.info('Bot Diff Gols edit message process');
    try {
      const filter: MessageFilter = {
        date_start: _startDate(_today()),
        date_end: _endDate(_today()),
        edited: false,
      };

      const messages = await this.message.messages(filter);
      if (!messages.length) return;
      this.editMessages(messages);
    } catch (error) {
      _sendSuportError('Erro ao processar o bot Diff Gols Edit Message');
    }
  }

  private async editMessages(messages: Message[]) {
    for (const message of messages) {
      try {
        const messageId = JSON.parse(message.message_id);
        const chatId = JSON.parse(message.chat_id);

        const game = await this.game.game(message.bet_id);
        if (!game) return;
        if (moment().diff(moment(game.updated_at), 'seconds') > 10810) {
          const { diff } = await _calcDiff(game.result, game.league);
          const home = _formatTeam(game.home);
          const away = _formatTeam(game.away);

          let text = message.message;

          text =
            text +
            `
            .\n\n
          🏆 <b>** FIM DE JOGO **</b>
          ${home} <b>${game.result.replace('-', ' x ')}</b> ${away}
          <b>Diferença de gols:</b> ${diff}
          `;

          for (let i = 0; i < messageId.length; i++) {
            await this.bot.editMessage({
              chat_id: chatId[i],
              message_id: messageId[i],
              message: text.replace(/^\s+/gm, ''),
            } as EditMessage);
          }
          await this.message.update(message._id);
        }
      } catch (error) {
        _sendSuportError(`Erro ao editar mensagem\n${error.message}`);
        continue;
      }
    }
  }
}
