import { Logger } from '@nestjs/common';
import axios from 'axios';
import { Utils } from '~/common/utils';
import { CoinPrice, ICoinMarket } from './coin-market.type';

export class CoinGecko implements ICoinMarket {
  private BASE_URL = 'https://api.coingecko.com/api/v3';
  private readonly logger = new Logger(CoinGecko.name);

  async getPriceUsd(coinIds: string[]): Promise<CoinPrice[]> {
    const url = `${this.BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd`;
    this.logger.log('url: ' + url);
    const response = await axios.get(url);
    if (response.status === 200) {
      const coinPrices: CoinPrice[] = [];
      for (const [key, value] of Object.entries(response.data)) {
        coinPrices.push({
          id: key,
          usd: Number(value['usd']),
        });
      }
      return coinPrices;
    } else {
      throw new Error(`Can't get price: ${response.statusText}`);
    }
  }

  async getPriceUsdByContract(tokenAddress: string): Promise<string> {
    const currency = 'usd';
    const url = `${this.BASE_URL}/coins/binance-smart-chain/contract/${tokenAddress}/market_chart/?vs_currency=${currency}&days=30`;
    this.logger.log('url: ' + url);
    const response = await axios
      .get(url, { timeout: 2000 })
      .then(function (response) {
        if (response.status === 200) {
          const { prices } = response.data;
          const price: number =
            prices.map((p) => p[1]).reduce((sum, val) => sum + val, 0) /
            prices.length;
          return Utils.convertNumberToNoExponents(price);
        } else {
          throw new Error(`Can't get price: ${response.statusText}`);
        }
      })
      .catch(function (error) {
        throw new Error(`Can't get price ${JSON.stringify(error)}`);
      });
    return response;
  }
}
