import axios from 'axios';
import { Inject } from 'typescript-ioc';
import { ConfigRepository } from '#/core/domain/repository/config.repository';
import { _sendSuportError, _todayNow } from '#/core/domain/utils';
import { InplayFilter } from '#/bots/domain/entities/inplay';

export class BetApi {
  constructor(
    @Inject
    private readonly config: ConfigRepository,
  ) {}

  private async api(params: any) {
    try {
      const { api_url, api_token } = await this.config.getApiConfigs();
      const url = `${api_url}${params.url}`;
      return await axios.request({
        url: url,
        method: 'get',
        params: {
          params: params.params,
        },
        headers: {
          'X-RapidAPI-Key': api_token,
          'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com',
        },
      });
    } catch (error) {
      _sendSuportError(`Endpoint: ${params.url} \nStatus Code:\n ${error.code}`);
    }
  }

  public async inplay(filter: InplayFilter) {
    const response = await this.api({
      url: '/inplay_filter',
      params: {
        league_id: 1,
      },
    });
    return response.data.results.filter((game: any) => game.league.name.includes(filter.league));
  }
}
