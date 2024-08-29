import * as request from 'supertest';
import { describe } from 'node:test';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PricesService } from '../src/modules/prices/prices.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let pricesService: PricesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    pricesService = moduleFixture.get<PricesService>(PricesService);
    jest.spyOn(pricesService, 'getGlobalPriceIndex');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET: /prices/price-index', () => {
    it('should return status 200 and vlaid response', async () => {
      (pricesService.getGlobalPriceIndex as jest.Mock).mockResolvedValue({
        priceIndex: 10005,
        errors: [],
      });

      const response = await request(app.getHttpServer()).get('/prices/price-index').expect(200);

      expect(response.body).toEqual({
        priceIndex: 10005,
        errors: [],
      });
    });

    it('should handle when no valid prices are available', async () => {
      (pricesService.getGlobalPriceIndex as jest.Mock).mockResolvedValue({
        priceIndex: null,
        errors: [],
      });

      const response = await request(app.getHttpServer()).get('/prices/price-index').expect(200);

      expect(response.body).toEqual({
        priceIndex: null,
        errors: [],
      });
    });

    it('should handle errors from the service', async () => {
      (pricesService.getGlobalPriceIndex as jest.Mock).mockResolvedValue({
        priceIndex: null,
        errors: [{ exchange: 'ExchangeA', error: 'Network error' }],
      });

      const response = await request(app.getHttpServer()).get('/prices/price-index').expect(200);

      expect(response.body).toEqual({
        priceIndex: null,
        errors: [{ exchange: 'ExchangeA', error: 'Network error' }],
      });
    });
  });
});
