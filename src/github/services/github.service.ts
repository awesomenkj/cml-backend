import { Injectable } from '@nestjs/common';
import { PoolRequestService } from './pool-request.service';
import { GitRequestType, GitResource } from '../models/git-pool-request';

@Injectable()
export class GithubService {

  public constructor(
    private poolRequestService: PoolRequestService,
  ) {}

  /**
   * Create Organization Syncing Request
   * @param id string : organization id
   * @param login string : organization login
   * @param orgSlug string : organization slug
   * @returns string : request id
   */
  public requestOrganization = (
    id: string,
    login: string,
    orgSlug: string
  ) => {
    const request = this.poolRequestService.createRequest(
      GitResource.ORGANIZATION,
      GitRequestType.INIT
    );
    this.poolRequestService.addRequestData(request, 'login', login);
    this.poolRequestService.addRequestData(request, 'orgId', id);
    this.poolRequestService.addRequestData(request, 'slug', orgSlug);
    request.priority = 1;
    return this.poolRequestService.addRequestToPool(request);
  };
  /**
   * Create A New Request To cml-pool-requests collection To Get Repositories Of Organization
   * @param login string : organization login
   * @param start string : pagination cursor
   * @param parentRequest string : parent request id
   * @param orgSlug string : organization slug
   * @returns string : request id
   */
  public requestOrganizationRepositoriesOffset = (
    login: string,
    start: string,
    parentRequest: string,
    orgSlug: string
  ) => {
      const request = this.poolRequestService.createRequest(
        GitResource.ORGANIZATION_REPOSITORIES,
        GitRequestType.OFFSET
      );
      request.parent = parentRequest;
      this.poolRequestService.addRequestData(request, 'login', login);
      this.poolRequestService.addRequestData(request, 'start', start);
      this.poolRequestService.addRequestData(request, 'slug', orgSlug);
      request.priority = 2;
      return this.poolRequestService.addRequestToPool(request);
    };
  /**
   * Create A New Request To cml-pool-requests To Get Members Of Organization
   * @param login string : organization login
   * @param start string : pagination cursor
   * @param parentRequest string : parent request id
   * @param orgSlug string : organization slug
   * @returns string : request id
   */
  public requestOrganizationMembersOffset = (
    login: string,
    start: string,
    parentRequest: string,
    orgSlug: string
  ) => {
    const request = this.poolRequestService.createRequest(
      GitResource.ORGANIZATION_MEMBERS,
      GitRequestType.OFFSET
    );
    request.parent = parentRequest;
    this.poolRequestService.addRequestData(request, 'login', login);
    this.poolRequestService.addRequestData(request, 'start', start);
    this.poolRequestService.addRequestData(request, 'slug', orgSlug);
    request.priority = 2;
    return this.poolRequestService.addRequestToPool(request);
  };
  /**
   * Create A New Request To cml-pool-requests collection To Get Repository Data
   * @param orgLogin string : organization login
   * @param repoName string : Repository Name
   * @returns string : request id
   */
  public requestRepositoriesData = (
    orgLogin: string,
    repoName: string
  ) => {
    const request = this.poolRequestService.createRequest(
      GitResource.REPOSITORY,
      GitRequestType.INIT
    );
    this.poolRequestService.addRequestData(request, 'owner', orgLogin);
    this.poolRequestService.addRequestData(request, 'name', repoName);
    request.priority = 3;
    return this.poolRequestService.addRequestToPool(request);
  };
  /**
   * Create A New Request To cml-pool-requests collection to Get Repository Data By Offset
   * @param resource number : GitResource
   * @param orgLogin string : Organization Login
   * @param repoName string : Repository Name
   * @param start string : Pagination Cursor
   * @param index number : Pagination Offset
   * @returns string : request id
   */
  public requestRepositoriesDataOffset = (
    resource: GitResource,
    orgLogin: string,
    repoName: string,
    start: string,
    index: number
  ) => {
      const request = this.poolRequestService.createRequest(
        resource,
        GitRequestType.OFFSET
      );
      this.poolRequestService.addRequestData(request, 'owner', orgLogin);
      this.poolRequestService.addRequestData(request, 'name', repoName);
      this.poolRequestService.addRequestData(request, 'start', start);
      this.poolRequestService.addRequestData(request, 'index', index.toString());
      request.priority = 4;
      return this.poolRequestService.addRequestToPool(request);
    };
}
