import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';

export  type Coin = {
  cmcId: string,
  symbol: string,
  name: string,
  slug: string,
};

@Injectable()
export class ResponseProcessorService {

  public coinsCol;
  public marketCol;
  public coinsStats;

  public constructor(
    private fbService: FirebaseService,
  ) {
    this.coinsCol = this.fbService.db.collection('cml-coins');
    this.marketCol = this.fbService.db.collection('cml-market');
    this.coinsStats = this.fbService.db.collection('cml-stats');
  }

  public processListings = (response: any[]) => {
    let coins: Coin[] = [];
    response.forEach((entry, idx) => {
      const coin: Coin = {
        cmcId: entry.id,
        symbol: entry.symbol,
        name: entry.name,
        slug: entry.website_slug,
      };
      coins.push(coin);
      if (idx % 500 === 499 || idx === response.length - 1) {
        const batch = this.fbService.db.batch();
        coins.forEach((c: Coin) => {
          const ref = this.coinsCol.doc(c.slug);
          batch.set(ref, c, { merge: true });
        });
        coins = [];
        batch.commit()
          .then(() => {
// tslint:disable-next-line
            console.log('commited batch set coins');
          })
          .catch(() => {
            // tslint:disable-next-line
            console.log('Exception commiting batch set coin');
          });
      }
    });
  };

  public processGlobalData = (response: any) => {
    if (response) {
      const tick = {
        timestamp: response.last_updated,
        marketCap: response.quotes['USD'].total_market_cap,
        volume: response.quotes['USD'].total_volume_24h,
        bitcoinShare: response.bitcoin_percentage_of_market_cap,
        activeCoins: response.active_cryptocurrencies,
      };

      this.marketCol.doc(response.last_updated.toString()).set(tick);
    }
  };

  public processTickers = (response: any) => {
    if (response) {
      const batch = this.fbService.db.batch();
      this.valuesToArray(response).forEach((r) => {
        const rRef = this.coinsCol.doc(r.website_slug);
        const rObject = {
          rank: r.rank,
          currentSupply: r.circulating_supply,
          totalSupply: r.total_supply,
          maxSupply: r.max_supply,
          updatedAt: r.last_updated,
          price: r.quotes['USD'].price,
          volume: r.quotes['USD'].volume_24h,
          marketCap: r.quotes['USD'].market_cap,
          changeHour: r.quotes['USD'].percent_change_1h,
          changeDay: r.quotes['USD'].percent_change_24h,
          changeWeek: r.quotes['USD'].percent_change_7d,
        };
        if (rObject) {
          batch.update(rRef, { finance: rObject });
        }
      });
      batch.commit().then(() => {
        // tslint:disable-next-line
        console.log('Commited ticks batch');
      }).catch((e) => {
        // tslint:disable-next-line
        console.log('Commit ticks batch exception', e);
      });
    }
  };

  public valuesToArray = (obj): any[any] => {
    return Object.keys(obj).map((key) => obj[key]);
  };
}