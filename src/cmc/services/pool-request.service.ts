import { Injectable } from '@nestjs/common';

const request = require('request');

@Injectable()
export class PoolRequestService {

    public API_URL = 'https://api.coinmarketcap.com/v2/';

    public constructor() {

    }

    public requestListings = () => {
        return new Promise((resolve, reject) => {
            request(this.API_URL + 'listings', {
                method: 'GET'
            },
            (err, res) => {
                if (err) { reject('null'); }
                resolve(JSON.parse(res.body.toString()).data);
            });
        }).catch((_e) => {
            return this.requestListings();
        });
    }

    public requestGlobalData = () => {
        return new Promise((resolve, reject) => {
            request(this.API_URL + 'global', {
                method: 'GET'
            },
            (err, res) => {
                if (res && !err) {
                    resolve(JSON.parse(res.body.toString()).data);
                } else {
                    reject('null');
                }
            });
        }).catch((_e) => {
            return this.requestGlobalData();
        });
    }

    public requestTickers = (start: number, limit: number) => {
        return new Promise((resolve, reject) => {
            request(this.API_URL + 'ticker/?sort=id&start=' + start + '&limit=' + limit, {
                method: 'GET'
            },
            (err, res) => {
                if (res && !err) {
                    resolve(JSON.parse(res.body.toString()).data);
                } else {
                    reject('null');
                }
            });
        }).catch((_e) => {
            return this.requestTickers(start, limit);
        });
    }
}