import * as WebSocket from 'ws';
import axios from 'axios';
import { get, round } from 'lodash';
import { Injectable } from '@nestjs/common';
import { IExchange, IFetchOrderBook, IGetGlobalPriceIndexResponse, IRefineOrderBooks } from './interfaces';
import { decompressData, isValidData } from '../../utils/ws-data';

@Injectable()
export class PricesService {
  /* in-memory storage for exchange list config is not advisable 
  solution is usage of mixed storage with db persistence and in-memory */
  private exchanges: IExchange[] = [
    {
      name: 'Binance',
      url: 'https://api.binance.com/api/v3/depth',
      params: { symbol: 'BTCUSDT', limit: 5 },
      dataPath: 'data',
      type: 'REST',
    },
    {
      name: 'Kraken',
      url: 'https://api.kraken.com/0/public/Depth',
      params: { pair: 'BTCUSDT', count: 5 },
      dataPath: 'data.result.XBTUSDT',
      type: 'REST',
    },
    {
      name: 'Huobi',
      url: 'wss://api.huobi.pro/ws',
      params: { sub: 'market.btcusdt.depth.step0' },
      type: 'WEBSOCKET',
    },
  ];

  async getGlobalPriceIndex(): Promise<IGetGlobalPriceIndexResponse> {
    const orderBooks = await this.fetchOrdersBook();
    const { validPrices, errors } = this.refineOrdersBookResponse(orderBooks);
    const priceIndex = this.calculateGlobalPriceIndex(validPrices);
    return { priceIndex: priceIndex && round(priceIndex, 2), errors };
  }

  private async fetchOrdersBook(): Promise<PromiseSettledResult<IFetchOrderBook>[]> {
    return await Promise.allSettled(
      this.exchanges.map(async (exchange) => {
        if (exchange.type === 'REST') {
          return this.fetchOrderBookRest(exchange);
        }

        return await this.fetchOrderBookWS(exchange);
      }),
    );
  }

  private async fetchOrderBookRest({ name, url, params, dataPath }: IExchange): Promise<IFetchOrderBook> {
    try {
      const response = await axios.get(url, {
        params: params,
      });

      const orderBook = this.validaOrderBookData(dataPath ? get(response, dataPath) : response.data);

      const midPrice = (parseFloat(orderBook.bids[0][0]) + parseFloat(orderBook.asks[0][0])) / 2;

      return { exchange: name, midPrice };
    } catch (error) {
      return {
        exchange: name,
        error: `${error instanceof Error ? error.message : 'Unknown Error'}`,
      };
    }
  }

  private async fetchOrderBookWS({ name, url, params }: IExchange): Promise<IFetchOrderBook> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      ws.on('open', () => {
        ws.send(JSON.stringify({ sub: params.sub }));
      });

      ws.on('message', async (data) => {
        try {
          const decompressedData = await this.validateWebSocketMessageData(data);

          if (!isValidData(decompressedData)) {
            throw new Error('Invlaid data received');
          }

          const parsedData = JSON.parse(decompressedData);
          if (parsedData.tick && Array.isArray(parsedData.tick.bids) && Array.isArray(parsedData.tick.asks)) {
            const midPrice = (parseFloat(parsedData.tick.bids[0][0]) + parseFloat(parsedData.tick.asks[0][0])) / 2;

            resolve({ exchange: name, midPrice });
            ws.close();
          }
        } catch (error) {
          reject({
            exchange: name,
            error: `${error instanceof Error ? error.message : 'Unknown Error'}`,
          });
          ws.close();
        }
      });

      ws.on('error', (error) => {
        reject({
          exchange: name,
          error: `${error instanceof Error ? error.message : 'Unknown Error'}`,
        });
        ws.close();
      });
    });
  }

  private refineOrdersBookResponse(orderBooks: PromiseSettledResult<IFetchOrderBook>[]): IRefineOrderBooks {
    const validPrices: number[] = [];
    const errors: { exchange: string; error: string }[] = [];

    orderBooks.forEach((orderBook) => {
      if (orderBook.status === 'rejected') {
        const { error } = orderBook.reason as { error: string };
        errors.push({
          exchange: (orderBook.reason as any).exchange || 'Unknown',
          error,
        });
        return;
      }

      if (orderBook.status === 'fulfilled' && !orderBook.value.midPrice) {
        errors.push({
          exchange: orderBook.value.exchange,
          error: orderBook.value.error,
        });
        return;
      }

      validPrices.push(orderBook.value.midPrice);
    });

    return { validPrices, errors };
  }

  private calculateGlobalPriceIndex(prices: number[]): number | null {
    if (!prices.length) return null;
    return prices.reduce((acc, price) => acc + price, 0) / prices.length;
  }

  private validateWebSocketMessageData = async (data: WebSocket.RawData): Promise<string> => {
    if (typeof data === 'string') {
      return data;
    }

    if (Buffer.isBuffer(data)) {
      return await decompressData(data);
    }

    throw new Error('Unexpected data type');
  };

  private validaOrderBookData = (orderBook: any): { bids: number[]; asks: number[] } => {
    if (!orderBook || !Array.isArray(orderBook.bids) || !Array.isArray(orderBook.asks)) {
      throw new Error('Invalid order book data');
    }

    return { bids: orderBook.bids, asks: orderBook.asks };
  };
}
