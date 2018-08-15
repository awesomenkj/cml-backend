import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';
import { parse } from 'node-html-parser';

const request = require('request-promise-native');


@Injectable()
export class ParserService {

  public constructor(
    private fbService: FirebaseService,
  ) {
    this.fbService.db.collection('cml-git-organizations')
      .onSnapshot((snap) => {
        snap.docChanges().forEach(async (change) => {
          if (change.type !== 'added' || !(!change.doc.data().website && change.doc.data().websiteUrl)) {
            return;
          }
          try {
            const res = this.requestUrl(change.doc.data().websiteUrl.indexOf('http') !== -1
              ? change.doc.data().websiteUrl
              : `https://${change.doc.data().websiteUrl}`);
            if (!res) {
              return;
            }
            this.parseResponse(res.toString(), change.doc.data().login.toLowerCase());
          } catch (_e) {
          }
        });
      });
  }

  public requestUrl = async (url: string) => {
    try {
      const res = await request(url, {
        method: 'GET',
      });
      return res.body;
    } catch (_e) {
      // TODO should add loger
    }
  };

  public parseResponse = (response: string, orgLogin: string) => {
    const doc = parse(response);
    const data = {
      title: doc.querySelector('title')
        ? doc.querySelector('title').text
        : '',
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
      const image = meta.rawAttrs.split('content="')[1].split('"')[0];
      if (
        meta.rawAttrs.indexOf('"og:image"') !== -1
        && data.images.indexOf(image) === -1
        && meta.rawAttrs.split('content="')[1].split(' ')[0].indexOf('http') !== -1
      ) {
        data.images.push(image);
      }
    });
    return this.fbService.db.collection('cml-git-organizations').doc(orgLogin).set({
      website: data,
    }, { merge: true });
  };

  public updateOrganizationWebsite = async (orgLogin: string) => {
    try {
      const doc = await this.fbService.db.collection('cml-git-organizations').doc(orgLogin).get();
      if (!doc.exists || !doc.data().websiteUrl) {
        return false;
      }
      const res = await  this.requestUrl(doc.data().websiteUrl);
      if (!res) {
        return false;
      }
      return this.parseResponse(res.toString(), orgLogin);
    } catch (_e) {
      return;
    }
  };
}