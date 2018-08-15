import { Injectable } from '@nestjs/common';
import { PoolRequestService } from './pool-request.service';
import { ResponseProcessorService } from './response-processor.service';

@Injectable()
export class CmcService {

  public readonly BATCH_COUNT = 100;

  public constructor(
    private requestService: PoolRequestService,
    private responseService: ResponseProcessorService,
  ) {
    setInterval(() => {
      this.updateTickers();
      this.requestGlobalData();
    }, 18000000);
  }

  /*
   * This endpoint displays all active cryptocurrency listings in one call.
   */
  public requestListings = async () => {
    try {
      const response = await  this.requestService.requestListings();
      this.responseService.processListings(response);
      return response;
    } catch (_e) {
      return null;
    }
  };

  /*
   * This endpoint displays the global data found at the top of coinmarketcap.com
   */
  public requestGlobalData = async () => {
    try {
      const response = await this.requestService.requestGlobalData();
      this.responseService.processGlobalData(response);
      return response;
    } catch (_e) {
      return null;
    }
  };

  /**
   * This endpoint displays cryptocurrency ticker data in order of rank. .
   * Pagination is possible by using the start and limit parameters.
   */
  public requestTickers = async (start: number, limit: number) => {
    try {
      const response = await this.requestService.requestTickers(start, limit);
      return this.responseService.processTickers(response);
    } catch (_e) {
      return null;
    }
  };

  /*
   * This function should update all tickers
   */
  public updateTickers = async () => {
    try {
      const global = await this.requestGlobalData();
      const totalCoins = global.active_cryptocurrencies;
      const maxBatch = Math.round(totalCoins / this.BATCH_COUNT);
      for (let i = 0; i < maxBatch; i++) {
        this.updateTickersOffset(i);
      }
      return true;
    } catch (_e) {
      return null;
    }
  };

  public updateTickersOffset = (idx: number) => {
    setTimeout(() => {
      this.requestTickers(this.BATCH_COUNT * idx, this.BATCH_COUNT);
    }, 1000 * idx);
  };


}