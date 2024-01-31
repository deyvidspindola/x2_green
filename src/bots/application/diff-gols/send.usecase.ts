import { ChatRepository } from '#/bots/domain/repository/chat.repository';
import { GameRepository } from '#/bots/domain/repository/game.repository';
import { MessageRepository } from '#/bots/domain/repository/message.repository';
import { BetApi } from '#/bots/infrastructure/api';
import { DiffGolsBot } from '#/bots/infrastructure/telegram/diff-gols';
import { _sendSuport, _sendSuportError, _todayNow } from '#/core/domain/utils';
import { Container, Inject } from 'typescript-ioc';
import { schedule } from 'node-cron';
import { Inplay } from '#/bots/domain/entities/inplay';
import { _calcDiff, _formatTeam, _hasSend, _saveSend } from './utils';
import { Chat } from '#/core/domain/entities/chat';
import { Configurations } from '#/core/infrastructure/configuration/configurations';
import { Message } from '#/core/domain/entities/message';
import { ConfigRepository } from '#/core/domain/repository/config.repository';

export class DiffGolsUseCase {
  constructor(
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

  botName = this.configuration.botDiffGolsName;

  async execute() {
    await this.initialize();
    await this.startBot();
    _sendSuport('🤖 Bot Diff Gols iniciado');
  }

  private async initialize() {
    await this.bot.start();
    this.chat.setDatabase(this.botName);
    this.message.setDatabase(this.botName);
    this.game.setDatabase(this.botName);
  }

  private async startBot() {
    const runTime = await Container.get(ConfigRepository).getSchedule(this.botName);
    schedule(runTime, async () => {
      await this.process();
    });
  }

  private async process() {
    try {
      const chats = await this.chat.chats();
      console.log('chats', _todayNow());
      console.log('chats', chats);
      if (!chats.length) return;
      const games = await this.api.inplay({ league: 'Esoccer' });
      if (!games.length) return;
      this.sendToBot(chats, games);
      this.saveGames(games);
    } catch (error) {
      _sendSuportError('Erro ao processar o bot Diff Gols');
    }
  }

  private async sendToBot(chats: Chat[], games: Inplay[]) {
    await Promise.all(
      games.map(async (game: Inplay) => {
        const shouldSend = await this.shouldSend(game);
        if (!shouldSend) return;
        await this.sendToChat(chats, game);
        _saveSend(game.id);
      }),
    );
  }

  private async sendToChat(chats: Chat[], game: Inplay) {
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
    const { diff } = await _calcDiff(game.ss, game.league.name);
    const league = `<b>${game.league.name}</b>`;
    const home = _formatTeam(game.home.name);
    const away = _formatTeam(game.away.name);
    const title = `${home} <b>${game.ss}</b> ${away}`;
    const message = `⚽️ ${league}\n${title}\n<b>Gols de diferença</b>: ${diff}\n${this.configuration.betUrl}${game.ev_id}`;
    return message;
  }

  private async shouldSend(game: Inplay) {
    if (!game || !game.ss) return false;
    const { result } = await _calcDiff(game.ss, game.league.name);
    return !_hasSend(game.id) && result;
  }

  private async saveMessage(messageIds: (number | null)[], chats: Chat[], game: Inplay, message: string) {
    const message_ids = messageIds.filter((id) => id !== null) as number[];
    const chat_ids = chats.map((chat) => chat.chat_id);
    await this.message.save({
      message_id: JSON.stringify(message_ids),
      chat_id: JSON.stringify(chat_ids),
      bet_id: Number(game.id),
      event_id: Number(game.ev_id),
      league_id: Number(game.league.id),
      league: game.league.name,
      message: message,
      created_at: _todayNow(),
      edited: false,
    } as Message);
  }

  private async saveGames(games: Inplay[]) {
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
}
