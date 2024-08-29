import { Test, TestingModule } from '@nestjs/testing';
import { PricesService } from './prices.service';
import { IGetGlobalPriceIndexResponse } from './interfaces';

describe('PricesService', () => {
  let service: PricesService;
  let spyFetchOrdersBook: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricesService],
    }).compile();

    service = module.get<PricesService>(PricesService);
    spyFetchOrdersBook = jest.spyOn(service as any, 'fetchOrdersBook');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGlobalPriceIndex', () => {
    it('should return global price index and errors', async () => {
      const mockOrdersBook = [
        { status: 'fulfilled', value: { exchange: 'ExchangeA', midPrice: 59710.876666 } },
        { status: 'fulfilled', value: { exchange: 'ExchangeB', midPrice: 59720.876666 } },
        { status: 'rejected', reason: { exchange: 'ExchangeC', error: 'Network error' } },
        { status: 'fulfilled', value: { exchange: 'ExchangeD', error: 'Invalid data type' } },
      ];
      spyFetchOrdersBook.mockResolvedValueOnce(mockOrdersBook);

      const response: IGetGlobalPriceIndexResponse = await service.getGlobalPriceIndex();

      expect(response).toEqual({
        priceIndex: 59715.88,
        errors: [
          { exchange: 'ExchangeC', error: 'Network error' },
          { exchange: 'ExchangeD', error: 'Invalid data type' },
        ],
      });
    });

    it('should return null price index if no valid prices', async () => {
      spyFetchOrdersBook.mockResolvedValueOnce([
        { status: 'fulfilled', value: { exchange: 'ExchangeA', error: 'Invalid data type' } },
        { status: 'fulfilled', value: { exchange: 'ExchangeB', error: 'Unknown Error' } },
      ]);

      const response = await service.getGlobalPriceIndex();

      expect(response).toEqual({
        priceIndex: null,
        errors: [
          { exchange: 'ExchangeA', error: 'Invalid data type' },
          { exchange: 'ExchangeB', error: 'Unknown Error' },
        ],
      });
    });
  });
});
