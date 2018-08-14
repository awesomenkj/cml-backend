import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/services/firebase.service';
import { GraphqlService } from './graphql.service';
import { ResponseProcessorService } from './response-processor.service';
import { GitResource, GitResponseStatus } from '../models/git-pool-request';

// import axios from 'axios';
const request = require('request-promise-native');

@Injectable()
export class PoolProcessorService {

  public url = 'https://api.github.com/graphql';
  public token = '0b8ea2a68a9c50319decb65a42bcec996444f56d';
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

  public globalCounter = 0;
  public globalResponse = 0;
  public globalErrors = 0;

  public constructor(
    private fbService: FirebaseService,
    private graphService: GraphqlService,
    private responseService: ResponseProcessorService,
  ) {
    this.requestsCol = this.fbService.db.collection('cml-pool-requests');
    this.initialize();
  }

  /**
   * initialize
   */
  public initialize() {
    // Get New Requests and Pending Requests from DB
    this.getUnProcessedRequests(GitResponseStatus.NEW);
    this.getUnProcessedRequests(GitResponseStatus.PENDING);
    // Start Pool
    this.startPool();
    // Initialize DB Listener For Getting New Requests
    this.initWatcher();
  }

  /**
   * startPool : Create Interval To Proceed The Requests Continuously
   */
  public startPool() {
    setInterval(() => {
      // Proceed New Requests
      if (this.newRequests.length > 0) {
        this.proceedNewRequests();
      }

      // Proceed Pending Requests
      if (this.pendingRequests.filter(req => !req.proceed).length > 0) {
        this.proceedPendingRequests();
      }
    }, 1000);
  }

  /**
   * initWatcher : Init Firebase SnapShot Listener
   */
  public initWatcher() {
    this.requestsCol.where('status', '==', GitResponseStatus.NEW).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // New Change From DB
        const req = {
          id: change.doc.id,
          ...change.doc.data(),
        };
        // if change is new request
        if (change.type === 'added') {
          this.newRequests = this.insertArrayElement(this.newRequests, req);
          console.log('New request', req.data[0].value);
          console.log('New Request Resource Type: ', req.resource);
          console.log('New Requests Length Line 91: ', this.newRequests.length);
        }
        // if request is modified
        if (change.type === 'modified') {
          this.newRequests = this.updateArrayElement(this.newRequests, req);
        }
        // if request is removed
        if (change.type === 'removed') {
          this.newRequests = this.removeArrayElement(this.newRequests, req);
        }
      });
    }, (error) => {
      console.log('Error Listening Changes', error);
    });
  }
  /**
 * getUnProcessedRequests : Get UnprocessedRequests from Database
 * @param status number : GitResponseStatus
 * @returns
 */
  public getUnProcessedRequests(status: GitResponseStatus) {
    this.requestsCol.where('status', '==', status).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const req = {
          id: doc.id,
          ...doc.data()
        };
        if (status === GitResponseStatus.NEW) {
          this.newRequests = this.insertArrayElement(this.newRequests, req);
        } else {
          this.pendingRequests = this.insertArrayElement(this.pendingRequests, req);
        }
      });
    })
    .catch(err => {
      console.log('Error Getting documents', err);
    });
  }


  /**
   * proceedNewRequests : Proceed New Requests.
   */
  public proceedNewRequests = async () => {
    const requests = this.newRequests;
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      this.requestsCol.doc(req.id)
      .update({ status: GitResponseStatus.PENDING, updatedAt: new Date().toISOString() });

      this.newRequests = this.removeArrayElement(this.newRequests, req);
      console.log('New Requests Length Line 143: ', this.newRequests.length);
      req.status = GitResponseStatus.PENDING;

      try {
        const res = await this.handleRequest(req);
        const pendingRequest = {
          id: req.id,
          request: req,
          response: res,
          processed: false,
        };

        this.pendingRequests = this.insertArrayElement(this.pendingRequests, pendingRequest);
      } catch (error) {
        console.log('Error Handling New Request', error);
      }
    }
  }

  /**
   * proceedPendingRequests : Proceed Pending Requests
   */
  public proceedPendingRequests() {
    const pendingRequests = this.pendingRequests;
    for (let i = 0; i < pendingRequests.length; i++) {
      const pendingRequest = pendingRequests[i];
      if (pendingRequest.response && !pendingRequest.proceed) {
        this.pendingRequests[i].proceed = true;

        if (pendingRequest.response && pendingRequest.response !== 'null' && pendingRequest !== undefined) {
          this.responseService.processRequestResponse(pendingRequest);
        } else {
          if (pendingRequest.request.trial < this.GIT_RETRIAL) {
            const currentTry = this.pendingRequests[i].request.trial + 1;
            this.requestsCol.doc(pendingRequest.id)
              .update({
                status: GitResponseStatus.NEW,
                updatedAt: new Date().toISOString(),
                trial: currentTry
              });
          } else {
            this.pendingRequests[i].processed = true;
            this.requestsCol.doc(pendingRequest.id)
            .update({
              status: GitResponseStatus.FAILED,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    }
  }

// tslint:disable-next-line
  public handleRequest = async (request) => {
    let response;
    switch (request.resource) {
      case GitResource.ORGANIZATION:
        response = await this.fetchOrganization(request.data[0].value);
        break;
      case GitResource.ORGANIZATION_MEMBERS:
        response = await this.fetchOrganizationMembers(
          request.data[0].value,
          request.data[1].value
        );
        break;
      case GitResource.ORGANIZATION_REPOSITORIES:
        response = await this.fetchOrganizationRepositories(
          request.data[0].value,
          request.data[1].value
        );
        break;
      case GitResource.REPOSITORY:
        response = await this.fetchRepository(
          request.data[0].value,
          request.data[1].value
        );
        break;
      case GitResource.REPOSITORY_DEPLOY_KEYS:
        response = await this.fetchRepositoryDeployKeysOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_DEPLOYMENTS:
        response = await this.fetchRepositoryDeploymentsOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_FORKS:
        response = await this.fetchRepositoryForksOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_ISSUES:
        response = await this.fetchRepositoryIssuesOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_MILESTONES:
        response = await this.fetchRepositoryMilestonesOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_PROJECTS:
        response = await this.fetchRepositoryProjectsOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_PULL_REQUESTS:
        response = await this.fetchRepositoryPullRequestsOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.REPOSITORY_RELEASES:
        response = await this.fetchRepositoryReleasesOffset(
          request.data[0].value,
          request.data[1].value,
          request.data[2].value
        );
        break;
      case GitResource.USER:
        break;
    }

    // update request status to REQUESTED
    this.requestsCol.doc(request.id)
      .update({ status: GitResponseStatus.REQUESTED, updatedAt: new Date().toISOString() });
    return response;
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

  /**
   * Return Data From Github GraphQL API
   * @param query GraphQL Query String
   * @returns
   */
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

  /***************************************************************************
  ***************************** Helper Functions *****************************
  ***************************************************************************/
 /**
  * insertArrayElement : Insert New Request Object To Requests Array
  * @param array Requests Array
  * @param element Request Object
  * @returns
  */
 public insertArrayElement(array, element) {
  if (array.filter((ele) => ele.id === element.id).length === 0) {
    array.push(element);
  }
  return this.sortArray(array);
 }
  /**
   * updateArrayElement : Update A Element In Requests Array
   * @param array Requests Array
   * @param element Request Object
   * @returns
   */
  public updateArrayElement(array, element) {
    const index = array.findIndex((ele) => ele.id === element.id);
    if (index >= 0) {
      array[index] = element;
    }
    return this.sortArray(array);
  }

  /**
   * removeArrayElement : Remove A Element In Requests Array
   * @param array Requests Array
   * @param element Requests Object
   * @returns
   */
  public removeArrayElement(array, element) {
    const index = array.findIndex((ele) => ele.id === element.id);
    if (index >= 0) {
      array.splice(index, 1);
    }
    return this.sortArray(array);
  }

  /**
   * sortArray : Sort Requests By Priority
   * @param array Requests Array
   * @returns
   */
  public sortArray(array) {
    return array.sort((a, b) => a.priority - b.priority);
  }
}