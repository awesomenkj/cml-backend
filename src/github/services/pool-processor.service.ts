import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';
import { GraphqlService } from './graphql.service';
import { ResponseProcessorService } from './response-processor.service';
import { GitResource, GitResponseStatus } from '../models/git-pool-request';

const request = require('request-promise-native');

@Injectable()
export class PoolProcessorService {

  public url = 'https://api.github.com/graphql';
  public token = '0510d2a87143b240daea381d2f55a988693839b2';
  public header = {
    'User-Agent': 'cml-bot',
    'Content-Type': 'application/json',
    'Authorization': 'bearer ' + this.token,
  };

  public GIT_OFFSET = 50;
  public GIT_MAX_OFFSET = 50;
  public GIT_RETRIAL = 10;
  public GIT_MAX_REQUESTS = 10;

  public requestsCol;
  public newRequests = [];
  public pendingRequests = [];
  public pendingRequestsPromises = [];
  public poolInterval;

  public constructor(
    private fbService: FirebaseService,
    private graphService: GraphqlService,
    private responseService: ResponseProcessorService,
  ) {
    this.requestsCol = this.fbService.db.collection('cml-pool-requests');
    // Listen to pool requests
    this.getRequestByStatus(GitResponseStatus.NEW, this.newRequests);
    this.getRequestByStatus(GitResponseStatus.PENDING, this.pendingRequests);
    this.startPool();
  }

  public getRequestByStatus = (status: GitResponseStatus, response: any[]) => {
    this.requestsCol.where('status', '==', status)
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            if (response.filter((req) => {
              req.id === change.doc.id;
            }).length === 0) {
              const obj = {
                id: change.doc.id,
                ...change.doc.data(),
              };
              response.push(obj);
            }
          }

          if (change.type === 'modified') {
            const idx = response.findIndex((req) => req.id === change.doc.id);
            const obj = {
              id: change.doc.id,
              ...change.doc.data(),
            };
            response[idx] = obj;
          }

          if (change.type === 'removed') {
            response.splice(response.findIndex((req) => req.id === change.doc.id), 1);
          }

          response = response.sort((a, b) => a.priority - b.priority);
        });
      });
  };

  public startPool = () => {
    this.poolInterval = setInterval(() => {
      if (this.newRequests.length > 0 && this.pendingRequestsPromises.length < this.GIT_MAX_REQUESTS) {
        this.submitNextRequest();
      }

      if (this.pendingRequestsPromises.length > 0) {
        // tslint:disable-next-line
        this.pendingRequestsPromises.map((request) => {
          return !request.response.isPending()
          && request.response.isFulfilled() && !request.processed ? request : false;
          // tslint:disable-next-line
        }).filter(Boolean).map((request) => {
          request.response.then((data) => {
            request.processed = true;
            if (data && data !== 'null' && data !== undefined) {
              // update request state on the db
              this.responseService.processRequestResponse(request);
            } else {
              if (request.request.trial < this.GIT_RETRIAL) {
                const currentTry = request.request.trial + 1;
                this.requestsCol.doc(request.id)
                  .update({ status: GitResponseStatus.NEW, updatedAt: new Date().toISOString(), trial: currentTry });
              } else {
                request.processed = true;
                this.requestsCol.doc(request.id)
                  .update({ status: GitResponseStatus.FAILED, updatedAt: new Date().toISOString() });
              }
            }
          });
        });
// tslint:disable-next-line
        this.pendingRequestsPromises.map((request) => {
          return !request.response.isPending() && request.response.isRejected() && !request.processed ? request : false;
          // tslint:disable-next-line
        }).filter(Boolean).map((request) => {
          request.processed = true;
          if (request.request.trial < this.GIT_RETRIAL) {
            const currentTry = request.request.trial + 1;
            this.requestsCol.doc(request.id)
              .update({ status: GitResponseStatus.NEW, updatedAt: new Date().toISOString(), trial: currentTry });
          } else {
            this.requestsCol.doc(request.id)
              .update({ status: GitResponseStatus.FAILED, updatedAt: new Date().toISOString() });
          }
        });
// tslint:disable-next-line
        this.pendingRequestsPromises = this.pendingRequestsPromises.map((request) => {
          return request.processed ? false : request;
        }).filter(Boolean);
      }
    }, 1000);
  };

  public submitNextRequest = () => {
    const req = this.newRequests[0];
    // update the status of the next request
    this.requestsCol.doc(this.newRequests[0].id)
      .update({ status: GitResponseStatus.PENDING, updatedAt: new Date().toISOString() });
    this.pendingRequestsPromises.push({
      id: req.id,
      request: req,
      response: this.handleRequest(req.id, req),
      processed: false,
    });

  };
// tslint:disable-next-line
  public handleRequest = (requestId, request) => {
    let response;
    switch (request.resource) {
      case GitResource.ORGANIZATION:
        response = this.querablePromise(this.fetchOrganization(request.data[0].value));
        break;
      case GitResource.ORGANIZATION_MEMBERS:
        response = this.querablePromise(this.fetchOrganizationMembers(request.data[0].value, request.data[1].value));
        break;
      case GitResource.ORGANIZATION_REPOSITORIES:
        response = this.querablePromise(
          this.fetchOrganizationRepositories(request.data[0].value, request.data[1].value));
        break;
      case GitResource.REPOSITORY:
        response = this.querablePromise(
          this.fetchRepository(request.data[0].value, request.data[1].value));
        break;
      case GitResource.REPOSITORY_DEPLOY_KEYS:
        response = this.querablePromise(
          this.fetchRepositoryDeployKeysOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_DEPLOYMENTS:
        response = this.querablePromise(
          this.fetchRepositoryDeploymentsOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_FORKS:
        response = this.querablePromise(
          this.fetchRepositoryForksOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_ISSUES:
        response = this.querablePromise(
          this.fetchRepositoryIssuesOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_MILESTONES:
        response = this.querablePromise(
          this.fetchRepositoryMilestonesOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_PROJECTS:
        response = this.querablePromise(
          this.fetchRepositoryProjectsOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_PULL_REQUESTS:
        response = this.querablePromise(
          this.fetchRepositoryPullRequestsOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.REPOSITORY_RELEASES:
        response = this.querablePromise(
          this.fetchRepositoryReleasesOffset(request.data[0].value, request.data[1].value, request.data[2].value));
        break;
      case GitResource.USER:
        break;
    }

    // update request status to REQUESTED
    this.requestsCol.doc(requestId)
      .update({ status: GitResponseStatus.REQUESTED, updatedAt: new Date().toISOString() });
    return response;
  };

  public querablePromise = (promise) => {
    if (promise.isResolved) {
      return promise;
    }

    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;

    const result = promise.then(
      function(v) {
        isFulfilled = true;
        isPending = false;
        return v;
      },
      function(e) {
        isRejected = true;
        isPending = false;
        throw e;
      },
    );

    result.isFulfilled = () => isFulfilled;
    result.isRejected = () => isRejected;
    result.isPending = () => isPending;

    return result;

  };

  public fetchOrganization = (login: string) => {
    let query = '{' + this.graphService.getOrganizationFields(login);
    query += this.graphService.getOrganizationMembers(this.GIT_OFFSET, '');
    query += this.graphService.getOrganizationRepositories(this.GIT_OFFSET, '');
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchOrganizationRepositories = (login: string, start: string) => {
    let query = '{' + this.graphService.getBaseOrganizationFields(login);
    query += this.graphService.getOrganizationRepositories(this.GIT_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchOrganizationMembers = (login: string, start: string) => {
    let query = '{' + this.graphService.getOrganizationFields(login);
    query += this.graphService.getOrganizationMembers(this.GIT_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepository = (owner: string, repo: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryAssignableUsers(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryDeployKeys(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryDeployments(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryForks(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryIssues(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryProjects(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryMilestones(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryPullRequests(this.GIT_OFFSET, '');
    query += this.graphService.getRepositoryReleases(this.GIT_OFFSET, '');
    query += '}' + this.graphService.getRateLimit() + '}';

    return this.gitPromise(query);
  };

  public fetchRepositoryAssignableUsersOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryAssignableUsers(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryDeployKeysOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryDeployKeys(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryDeploymentsOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryDeployments(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryForksOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryForks(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryIssuesOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryIssues(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryProjectsOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryProjects(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryMilestonesOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryMilestones(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryPullRequestsOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryPullRequests(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public fetchRepositoryReleasesOffset = (owner: string, repo: string, start: string) => {
    let query = '{' + this.graphService.getBaseRepository(owner, repo);
    query += this.graphService.getRepositoryReleases(this.GIT_MAX_OFFSET, start);
    query += '}' + this.graphService.getRateLimit() + '}';
    return this.gitPromise(query);
  };

  public gitPromise = async (query) => {

    try {
      const res = await request(this.url, {
        method: 'POST',
        headers: this.header,
        body: JSON.stringify({
          query,
          'variables': '{}',
        }),
      });

      return JSON.parse(res).data;
    } catch (_e) {
      return null;
    }
  };
}