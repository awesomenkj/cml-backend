import { Injectable } from '@nestjs/common';
import { PoolRequestService } from './pool-request.service';
import { GitRequestType, GitResource } from '../models/git-pool-request';

@Injectable()
export class GithubService {

  public constructor(
    private poolRequestService: PoolRequestService,
  ) {

  }

  public requestOrganization = (id: string, login: string, orgSlug: string) => {
    const request = this.poolRequestService.createRequest(GitResource.ORGANIZATION, GitRequestType.INIT);
    this.poolRequestService.addRequestData(request, 'login', login);
    this.poolRequestService.addRequestData(request, 'orgId', id);
    this.poolRequestService.addRequestData(request, 'slug', orgSlug);
    request.priority = 1;
    return this.poolRequestService.addRequestToPool(request);
  };

  public requestOrganizationRepositoriesOffset =
    (login: string, start: string, parentRequest: string, orgSlug: string) => {
      const request = this.poolRequestService
        .createRequest(GitResource.ORGANIZATION_REPOSITORIES, GitRequestType.OFFSET);
      request.parent = parentRequest;
      this.poolRequestService.addRequestData(request, 'login', login);
      this.poolRequestService.addRequestData(request, 'start', start);
      this.poolRequestService.addRequestData(request, 'slug', orgSlug);
      request.priority = 2;
      return this.poolRequestService.addRequestToPool(request);
    };

  public requestOrganizationMembersOffset = (login: string, start: string, parentRequest: string, orgSlug: string) => {
    const request = this.poolRequestService.createRequest(GitResource.ORGANIZATION_MEMBERS, GitRequestType.OFFSET);
    request.parent = parentRequest;
    this.poolRequestService.addRequestData(request, 'login', login);
    this.poolRequestService.addRequestData(request, 'start', start);
    this.poolRequestService.addRequestData(request, 'slug', orgSlug);
    request.priority = 2;
    return this.poolRequestService.addRequestToPool(request);
  };

  public requestRepositoriesData = (orgLogin: string, repoName: string) => {
    const request = this.poolRequestService.createRequest(GitResource.REPOSITORY, GitRequestType.INIT);
    this.poolRequestService.addRequestData(request, 'owner', orgLogin);
    this.poolRequestService.addRequestData(request, 'name', repoName);
    request.priority = 3;
    return this.poolRequestService.addRequestToPool(request);
  };

  public requestRepositoriesDataOffset =
    (resource: GitResource, orgLogin: string, repoName: string, start: string, index: number) => {
      const request = this.poolRequestService.createRequest(resource, GitRequestType.OFFSET);
      this.poolRequestService.addRequestData(request, 'owner', orgLogin);
      this.poolRequestService.addRequestData(request, 'name', repoName);
      this.poolRequestService.addRequestData(request, 'start', start);
      this.poolRequestService.addRequestData(request, 'index', index.toString());
      request.priority = 4;
      return this.poolRequestService.addRequestToPool(request);
    };

}