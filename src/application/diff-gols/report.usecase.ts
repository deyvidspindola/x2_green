import { _yesterday } from '#/domain/utils';
import { schedule } from 'node-cron';
import { Inject } from 'typescript-ioc';
import { ReportSendGames } from '#/application/diff-gols/reports/report-send-games';

export class DiffGolsReportUseCase {
  @Inject
  private readonly report: ReportSendGames;

  async execute() {
    schedule('0 3 * * *', async () => {
      await this.report.sendDailyReportSendGames(_yesterday());
      await this.report.sendMonthlyReportSendGames();
    });
  }

  async sendPartailDailyReportSendGames(chat_id: string) {
    await this.report.sendPartailDailyReportSendGames(chat_id);
  }

  async sendCurrentMonthlyReportSendGames(chat_id: string, month?: string) {
    await this.report.sendCurrentMonthlyReportSendGames(chat_id, month);
  }
}
