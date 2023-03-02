export interface ICoinMarket {
  getPriceUsd(coinIds: string[]): Promise<CoinPrice[]>;
  getPriceUsdByContract(tokenAddress: string): Promise<string>;
}

export enum CoinMarketType {
  COINGECKO = 'coingecko',
  COINMARKET = 'coinmarket',
}

export interface CoinPrice {
  id: string;
  usd: number;
}
