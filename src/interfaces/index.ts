import { Container } from 'typescript-ioc';
import { DiffGolsReportUseCase } from '#/application/diff-gols/report.usecase';
import { DiffGolsEditMessageUseCase } from '#/application/diff-gols/edit.usecase';
import { DiffGolsUseCase } from '#/application/diff-gols/send.usecase';

export class Bots {
  public async run() {
    await this.DiffGols();
  }

  private async DiffGols() {
    await Container.get(DiffGolsUseCase).execute();
    await Container.get(DiffGolsReportUseCase).execute();
    await Container.get(DiffGolsEditMessageUseCase).execute();
  }
}
