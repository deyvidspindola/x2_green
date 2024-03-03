import axios from 'axios';
import { _sendSuportError, _todayNow } from '#/domain/utils';
import { EventsFilter, InplayFilter } from '#/domain/entities/inplay';
import { EventSTTypes } from '#/domain/enums/events-st-types';
import { Inject } from 'typescript-ioc';
import { Configurations } from '#/infrastructure/configuration/configurations';
import { Logger } from '@vizir/simple-json-logger';

export class BetApi {
  @Inject
  private readonly configuration: Configurations;
  @Inject
  private readonly logger: Logger;

  private async api(params: any) {
    try {
      const api_url = this.configuration.betApiUrl;
      const api_token = this.configuration.betApiToken;
      const url = `${api_url}${params.url}`;
      const options = {
        url: url,
        method: 'GET',
        params: params.params,
        headers: {
          'X-RapidAPI-Key': api_token,
          'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com',
        },
      };
      return await axios.request(options);
    } catch (error) {
      this.logger.error(`Erro na requisição para a API: ${JSON.stringify(error)}`);
      _sendSuportError(`Endpoint: ${params.url} \nStatus Code:\n ${error.code}`);
    }
  }

  async inplay(filter: InplayFilter) {
    const response = await this.api({
      url: '/inplay_filter',
      params: {
        sport_id: '1',
      },
    });
    return response.data.results.filter((game: any) => game.league.name.includes(filter.league));
  }

  async events(filter: EventsFilter) {
    const response = await this.api({
      url: '/event',
      params: {
        FI: Number(filter.event_id),
      },
    });
    if (response.data.error == 'PARAM_INVALID') {
      this.logger.error(`Erro na requisição para a API: ${JSON.stringify(response.data)}`);
      _sendSuportError(`Endpoint: /event\nError: ${response.data.error}\nError Detail: ${response.data.error_detail}`);
    }
    if (filter.stast == 'goal') {
      const data = response.data.results[0].filter(
        (event: any) => event.type === 'ST' && event.IC === EventSTTypes.GOLS,
      );
      return data[0];
    }

    return response.data.results[0];
  }
}
