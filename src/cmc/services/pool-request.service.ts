import { Injectable } from '@nestjs/common';

const request = require('request-promise-native');

@Injectable()
export class PoolRequestService {

  public readonly API_URL = 'https://api.coinmarketcap.com/v2/';


  public requestListings = async () => {
    try {
      const res = await request(`${this.API_URL}listings`, {
        method: 'GET',
      });
      return JSON.parse(res).data;
    } catch (_e) {
      return this.requestListings();
    }
  };
  public requestGlobalData = async () => {
    try {
      const res = await request(`${this.API_URL}global`, {
        method: 'GET',
      });
      return JSON.parse(res).data;
    } catch (_e) {
      return this.requestGlobalData();
    }
  };
  public requestTickers = async (start: number, limit: number) => {
    try {
      const res = await request(`${this.API_URL}ticker/?sort=id&start=${start}&limit=${limit}`, {
        method: 'GET',
      });
      return JSON.parse(res).data;
    } catch (_e) {
      return this.requestGlobalData();
    }
  };
}