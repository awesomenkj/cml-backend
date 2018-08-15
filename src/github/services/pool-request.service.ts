import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';

import { GitPoolRequest, GitPoolRequestDataEntry } from '../models';
import { GitRequestType, GitResource, GitResponseStatus } from '../models/git-pool-request';

@Injectable()
export class PoolRequestService {

  public requestsCol;

  public constructor(
    private fbService: FirebaseService,
  ) {
    this.requestsCol = this.fbService.db.collection('cml-pool-requests');
  }

  public createRequest = (resource: GitResource, type: GitRequestType) => {
    const request = new GitPoolRequest();
    request.resource = resource;
    request.type = type;
    request.status = GitResponseStatus.NEW;
    request.createdAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();
    return request;
  };

  public addRequestData = (request: GitPoolRequest, key: string, value: string) => {
    const entry = new GitPoolRequestDataEntry();
    entry.key = key;
    entry.value = value;
    request.data.push(entry);
  };

  public addRequestToPool = (request: GitPoolRequest) => {
    return this.requestsCol.add(this.getData(request)).then((data) => {
      return { 'requestId': data.id };
    })
    .catch((_e) => {

    });
  };

  public getData(obj: any) {
    const result = {};
    Object.keys(obj).map(key => {
      if (typeof obj[key] === 'object') {
        result[key] = this.getData(obj[key]);
      } else {
        result[key] = obj[key];
      }
    });
    return result;
  }

}