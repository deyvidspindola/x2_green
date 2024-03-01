import { ChatRepository } from '#/domain/repository/chat.repository';
import { GameRepository } from '#/domain/repository/game.repository';
import { MessageRepository } from '#/domain/repository/message.repository';
import { BetApi } from '#/infrastructure/api';
import { DiffGolsBot } from '#/infrastructure/telegram/diff-gols';
import { _sendSuport, _sendSuportError, _todayNow } from '#/domain/utils';
import { Inject } from 'typescript-ioc';
import { schedule } from 'node-cron';
import { Inplay } from '#/domain/entities/inplay';
import { _calcDiff, _formatTeam, _hasSend, _lastGoal, _saveSend } from './utils';
import { Chat } from '#/domain/entities/chat';
import { Configurations } from '#/infrastructure/configuration/configurations';
import { Message } from '#/domain/entities/message';
import { Logger } from '@vizir/simple-json-logger';

export class DiffGolsUseCase {
  constructor(
    @Inject
    private readonly looger: Logger,
    @Inject
    private readonly bot: DiffGolsBot,
    @Inject
    private readonly api: BetApi,
    @Inject
    private readonly chat: ChatRepository,
    @Inject
    private readonly message: MessageRepository,
    @Inject
    private readonly game: GameRepository,
    @Inject
    private readonly configuration: Configurations,
  ) {}

  async execute() {
    await this.initialize();
    await this.startBot();
    _sendSuport('🤖 Bot Diff Gols iniciado');
  }

  private async initialize() {
    this.looger.info('Bot Diff Gols iniciado');
    await this.bot.start();
    this.chat.setDatabase(this.configuration.botDiffGolsName);
    this.message.setDatabase(this.configuration.botDiffGolsName);
    this.game.setDatabase(this.configuration.botDiffGolsName);
  }

  private async startBot() {
    schedule('*/2 * * * * *', async () => {
      await this.process();
    });
  }

  private async process() {
    try {
      const chats = await this.chat.chats();
      if (!chats.length) return;
      const games = await this.api.inplay({ league: 'Esoccer' });
      if (!games.length) return;
      this.sendToBot(chats, games);
      this.saveGames(games);
    } catch (error) {
      this.looger.error(`Erro ao processar o bot Diff Gols: ${JSON.stringify(error)}`);
      _sendSuportError('Erro ao processar o bot Diff Gols');
    }
  }

  private async sendToBot(chats: Chat[], games: Inplay[]) {
    this.looger.info('Enviando dados para o bot');
    await Promise.all(
      games.map(async (game: Inplay) => {
        if (!(await this.shouldSend(game))) return;
        await this.sendToChat(chats, game);
        _saveSend(game.id);
      }),
    );
  }

  private async sendToChat(chats: Chat[], game: Inplay) {
    this.looger.info('Enviando mensagem para o chat');
    const message = await this.createMessage(game);
    const MessageIds = await Promise.all(
      chats.map(async (chat: Chat) => {
        try {
          const msg = this.bot.sendMessage({
            chat_id: chat.chat_id.toString(),
            message,
          });
          return (await msg).message_id;
        } catch (error) {
          _sendSuportError(`Erro ao enviar mensagem para o chat ${chat.chat_id}`);
          return null;
        }
      }),
    );
    await this.saveMessage(MessageIds, chats, game, message);
  }

  private async createMessage(game: Inplay) {
    const league = `<b>${game.league.name}</b>`;
    const home = _formatTeam(game.home.name);
    const away = _formatTeam(game.away.name);
    const title = `${home} <b>${game.ss.replace('-', ' x ')}</b> ${away}`;
    const gol = await this.getLastGoal(game.id);
    const url = `${this.configuration.betUrl}${game.ev_id}`;
    const message = `${league}\n${title}\n${gol}\n${url}`;
    return message;
  }

  private async shouldSend(game: Inplay) {
    if (!game || !game.ss) return false;
    const { result } = await _calcDiff(game.ss, game.league.name);
    return !_hasSend(game.id) && result;
  }

  private async saveMessage(messageIds: (number | null)[], chats: Chat[], game: Inplay, message: string) {
    this.looger.info('Salvando mensagem no banco de dados');
    const message_ids = messageIds.filter((id) => id !== null) as number[];
    const chat_ids = chats.map((chat) => chat.chat_id);
    await this.message.save({
      message_id: JSON.stringify(message_ids),
      chat_id: JSON.stringify(chat_ids),
      bet_id: Number(game.id),
      event_id: game.ev_id,
      league_id: Number(game.league.id),
      league: game.league.name,
      message: message,
      created_at: _todayNow(),
      edited: false,
    } as Message);
  }

  private async saveGames(games: Inplay[]) {
    this.looger.info('Salvando jogos no banco de dados');
    games.map(async (game) => {
      this.game.save({
        bet_id: Number(game.id),
        league_id: Number(game.league.id),
        event_id: Number(game.ev_id),
        league: game.league.name,
        home: game.home.name,
        away: game.away.name,
        home_id: Number(game.home.id),
        away_id: Number(game.away.id),
        result: game.ss,
        created_at: _todayNow(),
        updated_at: _todayNow(),
      });
    });
  }

  private async getLastGoal(game_id: string): Promise<string | undefined> {
    try {
      const events = await this.api.events({ event_id: game_id, stast: 'goal' });
      return _lastGoal(events.LA);
    } catch (error) {
      return undefined;
    }
  }
}
