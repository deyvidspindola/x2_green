import { ChatRepository } from '#/domain/repository/chat.repository';
import { GameRepository } from '#/domain/repository/game.repository';
import { MessageRepository } from '#/domain/repository/message.repository';
import { _endDate, _startDate, _today, _yesterday } from '#/domain/utils';
import { Configurations } from '#/infrastructure/configuration/configurations';
import { DiffGolsBot } from '#/infrastructure/telegram/diff-gols';
import { Inject } from 'typescript-ioc';
import moment from 'moment';
// import { LeagueDiff, LeagueId } from '#/domain/enums/leagues';
import { _calcDiff } from '#/application/diff-gols/utils';
import { ConfigRepository } from '#/domain/repository/config.repository';

export class ReportSendGames {
  constructor(
    @Inject
    private readonly configuration: Configurations,
    @Inject
    private readonly game: GameRepository,
    @Inject
    private readonly message: MessageRepository,
    @Inject
    private readonly chat: ChatRepository,
    @Inject
    private readonly bot: DiffGolsBot,
    @Inject
    private readonly botConfig: ConfigRepository,
  ) {
    this.game.setDatabase(this.configuration.botDiffGolsName);
    this.message.setDatabase(this.configuration.botDiffGolsName);
    this.chat.setDatabase(this.configuration.botDiffGolsName);
  }

  /**
   * RELATÓRIO DIÁRIO
   */
  async sendDailyReportSendGames(date: string): Promise<any> {
    const process = await this.processReportSendGames({
      date_start: _startDate(date),
      date_end: _endDate(date),
    });
    const chats = await this.chat.chats();
    const report = await this.messageDailyReportSendGames(date, process, false);

    for (const chat of chats) {
      this.bot.sendMessage({ chat_id: chat.chat_id.toString(), message: report });
    }
  }

  /**
   * RELATÓRIO PARCIAL DO DIA
   * @param chat_id
   */
  async sendPartailDailyReportSendGames(chat_id: string) {
    try {
      const process = await this.processReportSendGames({
        date_start: _startDate(_today()),
        date_end: _endDate(_today()),
      });
      const report = await this.messageDailyReportSendGames(_today(), process, true);
      this.bot.sendMessage({ chat_id, message: report });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * RELATÓRIO MENSAL
   */
  async sendMonthlyReportSendGames(): Promise<any> {
    const start_date = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
    const end_date = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    const process = await this.processReportSendGames({
      date_start: _startDate(start_date),
      date_end: _endDate(end_date),
    });
    const chats = await this.chat.chats();
    const report = await this.messageMonthlyReportSendGames(process);

    for (const chat of chats) {
      this.bot.sendMessage({ chat_id: chat.chat_id.toString(), message: report });
    }
  }

  /**
   * RELATÓRIO MENSAL ATUAL OU PASSADO
   * @param chat_id
   * @param month
   */
  async sendCurrentMonthlyReportSendGames(chat_id: string, month?: string): Promise<any> {
    let start_date = moment().startOf('month').format('YYYY-MM-DD');
    let end_date = moment().endOf('month').format('YYYY-MM-DD');

    if (month) {
      start_date = moment().month(month).startOf('month').format('YYYY-MM-DD');
      end_date = moment().month(month).endOf('month').format('YYYY-MM-DD');
    }

    const process = await this.processReportSendGames({
      date_start: _startDate(start_date),
      date_end: _endDate(end_date),
    });
    const report = await this.messageMonthlyReportSendGames(process, month);
    this.bot.sendMessage({ chat_id, message: report });
  }

  /**
   * PROCESSAR RELATÓRIO
   * @param filter
   * @returns process
   */
  async processReportSendGames(filter: any): Promise<any> {
    const games = await this.game.games(filter);
    const messages = await this.message.messages(filter);
    const sendGames = [];
    const lessGames = [];

    const diffGols = await this.botConfig.getLeaguesConfigs();
    for (const league of diffGols) {
      sendGames.push({
        league_id: league.league_id,
        count: 0,
      });
      lessGames.push({
        league_id: league.league_id,
        count: 0,
      });
    }

    for (const message of messages) {
      const game = games.find((game) => game.bet_id === message.bet_id);
      if (!game) continue;

      const { diff } = await _calcDiff(game.result, game.league);

      if (game.league_id === message.league_id) {
        if (diff <= diffGols.find((item: any) => item.league_id === game.league_id).gols) {
          const sendGame = sendGames.find((item) => item.league_id === game.league_id);
          sendGame.count++;
        }
        if (diff < diffGols.find((item: any) => item.league_id === game.league_id).gols) {
          const lessGame = lessGames.find((item) => item.league_id === game.league_id);
          lessGame.count++;
        }
      }
    }

    return {
      games,
      messages,
      sendGames,
      lessGames,
    };
  }

  /**
   * MENSAEM RELATÓRIO DIÁRIO
   * @param date
   * @param process
   * @param partail
   * @returns message
   */
  async messageDailyReportSendGames(date: string, process: any, partail: boolean) {
    let message = '';

    const reportDate = moment(date).format('DD/MM/YYYY');

    if (partail) {
      message += `<i>Esse é um relatório parcial do dia: <b>${reportDate}</b>.
      Lembrando que o relatório é enviado todos os dias às 00:00. Com todos os jogos do dia anterior.</i>\n`;
      message += `.\n`;
      message += `.\n`;
    }

    message += `Relatório do dia <b>${reportDate}</b>\n`;
    message += `.\n`;

    message += await this.messageContent(process);

    return message;
  }

  /**
   * MENSAEM RELATÓRIO MENSAL
   * @param process
   * @param month
   * @returns message
   */
  async messageMonthlyReportSendGames(process: any, month?: string) {
    let message = '';

    let reportDate = moment().subtract(1, 'month').format('MMMM/YYYY');

    if (month) {
      reportDate = moment().month(month).format('MMMM/YYYY');
    }

    message += `Relatório do mês de <b>${reportDate}</b>\n`;
    message += `.\n`;

    message += await this.messageContent(process);

    return message;
  }

  /**
   * CONTEÚDO DA MENSAGEM
   * @param process
   * @returns message
   */
  async messageContent(process: any) {
    let message = '';

    const leagues = [];

    const diffGols = await this.botConfig.getLeaguesConfigs();
    for (const league of diffGols) {
      leagues.push({
        id: league.league_id,
        name: league.label,
        gols: league.gols,
      });
    }

    // contabilizar total de jogos por liga
    message += `<b>TOTAL DE JOGOS</b>\n`;
    for (const league of leagues) {
      message += `${league.name}: <b>${process.games.filter((item: any) => item.league_id === league.id).length}</b>\n`;
    }
    message += `Total: <b>${process.games.length}</b>\n`;
    message += `.\n`;

    // contabilizar total de jogos enviados por liga
    message += `<b>JOGOS ENVIADOS POR LIGA</b>\n`;
    for (const league of leagues) {
      message += `${league.name}: <b>${
        process.messages.filter((item: any) => item.league_id === league.id).length
      }</b>\n`;
    }
    message += `Total: <b>${process.messages.length}</b>\n`;
    message += `.\n`;

    // contabilizar total de jogos enviados possivel green por liga
    message += `<b>JOGOS</b>\n`;
    for (const league of leagues) {
      message += `${league.name} menor ou igual a ${league.gols}: <b>${
        process.sendGames.find((item: any) => item.league_id === league.id).count
      }</b>\n`;
    }
    message += `Total: <b>${process.sendGames.reduce((acc: any, item: any) => acc + item.count, 0)}</b>\n`;
    message += `------------------------\n`;
    for (const league of leagues) {
      message += `${league.name} menor que ${league.gols}: <b>${
        process.lessGames.find((item: any) => item.league_id === league.id).count
      }</b>\n`;
    }
    message += `Total: <b>${process.lessGames.reduce((acc: any, item: any) => acc + item.count, 0)}</b>`;

    return message.replace(/^\s+/gm, '');
  }
}
