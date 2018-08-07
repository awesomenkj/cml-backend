import { Injectable } from '@nestjs/common';
import { PoolRequestService } from './pool-request.service';
import { ResponseProcessorService } from './response-processor.service';

@Injectable()
export class CmcService {

  public BATCH_COUNT = 100;

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
  public requestListings = () => {
    return this.requestService.requestListings().then((response: any) => {
      this.responseService.processListings(response);
      return response;
    }).catch((_e) => {
      return null;
    });
  };

  /*
   * This endpoint displays the global data found at the top of coinmarketcap.com
   */
  public requestGlobalData = () => {
    return this.requestService.requestGlobalData().then((response: any) => {
      this.responseService.processGlobalData(response);
      return response;
    }).catch((_e) => {
      return null;
    });
  };

  /**
   * This endpoint displays cryptocurrency ticker data in order of rank. .
   * Pagination is possible by using the start and limit parameters.
   */
  public requestTickers = (start: number, limit: number) => {
    return this.requestService.requestTickers(start, limit).then((response: any) => {
      this.responseService.processTickers(response);
    }).catch((_e) => {

      return null;
    });
  };

  /*
   * This function should update all tickers
   */
  public updateTickers = () => {
    return this.requestGlobalData().then((global) => {
      const totalCoins = global.active_cryptocurrencies;
      const maxBatch = Math.round(totalCoins / this.BATCH_COUNT);
      for (let i = 0; i < maxBatch; i++) {
        this.updateTickersOffset(i);
      }
      return true;
    }).catch((_e) => {
      return null;
    });
  };

  public updateTickersOffset = (idx: number) => {
    setTimeout(() => {
      this.requestTickers(this.BATCH_COUNT * idx, this.BATCH_COUNT);
    }, 1000 * idx);
  };


}