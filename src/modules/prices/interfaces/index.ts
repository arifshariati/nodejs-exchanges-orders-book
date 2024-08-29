export interface IExchange {
  name: string;
  url: string;
  params: { [key: string]: any };
  type: 'REST' | 'WEBSOCKET';
  dataPath?: string;
}

export interface IExchangeError {
  exchange: string;
  error: string;
}
export interface IGetGlobalPriceIndexResponse {
  priceIndex: number | null;
  errors: IExchangeError[];
}

export interface IFetchOrderBook {
  exchange: string;
  midPrice?: number;
  error?: string;
}

export interface IRefineOrderBooks {
  validPrices: number[];
  errors: { exchange: string; error: string }[];
}
