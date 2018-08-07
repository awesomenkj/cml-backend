import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';
import { parse } from 'node-html-parser';

const request = require('request');


@Injectable()
export class ParserService {

  public constructor(
    private fbService: FirebaseService,
  ) {
    this.fbService.db.collection('cml-git-organizations')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            // Query the website if any
            if (!change.doc.data().website && change.doc.data().websiteUrl) {
              this.requestUrl(change.doc.data().websiteUrl.indexOf('http') !== -1
                ? change.doc.data().websiteUrl
                : 'https://' + change.doc.data().websiteUrl)
                .then((res) => {
                  if (res) {
                    this.parseResponse(res.toString(), change.doc.data().login.toLowerCase());
                  }
                });
            }
          }
        });
      });
  }

  public requestUrl = (url: string) => {
    return new Promise((resolve, reject) => {
      request(url, {
          method: 'GET',
        },
        (err, res) => {
          if (err || !res || res === undefined) {
            reject('null');
          } else {
            resolve(res.body);
          }

        });
    }).catch((_e) => {
      // TODO should add loger
    });
  };

  public parseResponse = (response: string, orgLogin: string) => {
    const doc = parse(response);
    const data = {
      title: doc.querySelector('title') ? doc.querySelector('title').text : '',
      images: [],
    };

    doc.querySelectorAll('meta').forEach((meta: any) => {
      if (meta.rawAttrs.indexOf('"og:title"') !== -1) {
        data.title = meta.rawAttrs.split('content="')[1].split('"')[0];
      }

      // description
      if (meta.rawAttrs.indexOf('"og:description"') !== -1 ||
        meta.rawAttrs.indexOf('name="description"') !== -1) {
        data['description'] = meta.rawAttrs.split('content="')[1].split('"')[0];
      }
      // og:image
      if (
        meta.rawAttrs.indexOf('"og:image"') !== -1
        && data.images.indexOf(meta.rawAttrs.split('content="')[1].split('"')[0]) === -1
        && meta.rawAttrs.split('content="')[1].split(' ')[0].indexOf('http') !== -1
      ) {
        data.images.push(meta.rawAttrs.split('content="')[1].split('"')[0]);
      }
    });
    return this.fbService.db.collection('cml-git-organizations').doc(orgLogin).set({
      website: data,
    }, { merge: true });
  };

  public updateOrganizationWebsite = (orgLogin: string) => {
    return this.fbService.db.collection('cml-git-organizations').doc(orgLogin).get()
      .then((doc) => {
        if (doc.exists && doc.data().websiteUrl) {
          return this.requestUrl(doc.data().websiteUrl)
            .then((res) => {
              if (res) {
                this.parseResponse(res.toString(), orgLogin);
              }
            });
        } else {
          return false;
        }
      });
  };
}