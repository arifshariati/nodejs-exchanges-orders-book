import { Controller, Get } from '@nestjs/common';
import { PricesService } from './prices.service';
import { IGetGlobalPriceIndexResponse } from './interfaces';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('price-index')
  async getGlobalPriceIndex(): Promise<IGetGlobalPriceIndexResponse> {
    return await this.pricesService.getGlobalPriceIndex();
  }
}
