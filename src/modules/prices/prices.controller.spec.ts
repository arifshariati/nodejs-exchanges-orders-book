import { Test, TestingModule } from '@nestjs/testing';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { IExchangeError, IGetGlobalPriceIndexResponse } from './interfaces';

const mockErrors: IExchangeError[] = [
  { exchange: 'ExchangeA', error: 'Timeout error' },
  { exchange: 'ExchangeB', error: 'Invalid API key' },
];

const mockGetGlobalPriceIndexResponse: IGetGlobalPriceIndexResponse = {
  priceIndex: 12345.67,
  errors: mockErrors,
};

describe('PricesController', () => {
  let pricesController: PricesController;
  let pricesService: PricesService;

  beforeEach(async () => {
    const mockPricesService = {
      getGlobalPriceIndex: jest.fn().mockResolvedValue(mockGetGlobalPriceIndexResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricesController],
      providers: [{ provide: PricesService, useValue: mockPricesService }],
    }).compile();

    pricesController = module.get<PricesController>(PricesController);
    pricesService = module.get<PricesService>(PricesService);
  });

  it('should be defined', () => {
    expect(pricesController).toBeDefined();
  });

  describe('getGlobalPriceIndex', () => {
    it('should call PricesService.getGlobalPriceIndex', async () => {
      await pricesController.getGlobalPriceIndex();
      expect(pricesService.getGlobalPriceIndex).toHaveBeenCalled();
    });

    it('should return correct price index and errors', async () => {
      const result = await pricesController.getGlobalPriceIndex();
      expect(result).toEqual(mockGetGlobalPriceIndexResponse);
      expect(result.priceIndex).toBe(12345.67);
      expect(result.errors).toEqual(mockErrors);
    });

    it('should handle errors properly', async () => {
      jest.spyOn(pricesService, 'getGlobalPriceIndex').mockRejectedValueOnce(new Error('Service Error'));
      await expect(pricesController.getGlobalPriceIndex()).rejects.toThrow('Service Error');
    });
  });
});
