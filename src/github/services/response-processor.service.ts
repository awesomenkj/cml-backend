import { Injectable } from '@nestjs/common';
import { GitRequestType, GitResource, GitResponseStatus } from '../models/git-pool-request';
import { FirebaseService } from '../../shared/services/firebase.service';
import { GithubService } from './github.service';

@Injectable()
export class ResponseProcessorService {

  public coinsCol;
  public organizationsCol;
  public repositoriesCol;
  public repositoriesAssetsCol;
  public membersCol;
  public requestsCol;

  public constructor(
    private fbService: FirebaseService,
    private githubService: GithubService,
  ) {
    this.coinsCol = this.fbService.db.collection('cml-coins');
    this.organizationsCol = this.fbService.db.collection('cml-git-organizations');
    this.repositoriesCol = this.fbService.db.collection('cml-git-repositories');
    this.repositoriesAssetsCol = this.fbService.db.collection('cml-git-repositories-assets');
    this.membersCol = this.fbService.db.collection('cml-git-members');
    this.requestsCol = this.fbService.db.collection('cml-pool-requests');
  }

  public processRequestResponse = (query) => {
    try {

      switch (query.request.resource) {
        case GitResource.ORGANIZATION:
          switch (query.request.type) {
            case GitRequestType.INIT:
              this.initOrgRequest(query);
              break;
            case GitRequestType.UPDATE:
              this.updateOrgRequest(query);
              break;
          }
          break;
        case GitResource.ORGANIZATION_MEMBERS:
          this.orgMemberRequest(query);
          break;
        case GitResource.ORGANIZATION_REPOSITORIES:
          this.orgRepoRequest(query);
          break;
        case GitResource.REPOSITORY:
          this.repoRequest(query);
          break;
        case GitResource.REPOSITORY_DEPLOY_KEYS:
          this.repoDeployKeysRequest(query);
          break;
        case GitResource.REPOSITORY_DEPLOYMENTS:
          this.repoDeploymentsRequest(query);
          break;
        case GitResource.REPOSITORY_FORKS:
          this.repoForksRequest(query);
          break;
        case GitResource.REPOSITORY_ISSUES:
          this.repoIssuesRequest(query);
          break;
        case GitResource.REPOSITORY_MILESTONES:
          this.repoMileStonesRequest(query);
          break;
        case GitResource.REPOSITORY_PROJECTS:
          this.repoProjectsRequest(query);
          break;
        case GitResource.REPOSITORY_PULL_REQUESTS:
          this.repoPullRequestsRequest(query);
          break;
        case GitResource.REPOSITORY_RELEASES:
          this.repoReleasesRequest(query);
          break;
        case GitResource.USER:
          break;
      }
    } catch (_e) {

    }
  };

  /**
   * initOrganization
   */
  public initOrgRequest(query) {
    const response = query.response;
    if (response && response.organization) {
      this.saveOrganization(response, query.id, query.request.data[1].value, query.request.data[2].value)
        .then(() => {
          this.requestsCol.doc(query.id)
            .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
        });
    } else {
      this.requestsCol.doc(query.id)
        .update({ status: GitResponseStatus.FAILED, updatedAt: new Date().toISOString() });
    }
  }
  /**
   * updateOrgRequest
   */
  public updateOrgRequest(query) {
    const response = query.response;
    if (response && response.organization) {
      this.updateOrganization(
        response,
        query.id,
        query.request.data[1].value,
        query.request.data[2].value
      )
      .then(() => {
        this.requestsCol.doc(query.id)
        .update({
          status: GitResponseStatus.SUCCESS,
          updatedAt: new Date().toISOString()
        });
      });
    }
  }
  public orgMemberRequest(query) {
    const response = query.response;
    if (response && response.organization) {
      this.saveOrganizationMembers(
        response.organization.members,
        response.organization.login,
        query.request.data[2].value)
        .then(() => {
          this.requestsCol.doc(query.id)
          .update({
            status: GitResponseStatus.SUCCESS,
            updatedAt: new Date().toISOString()
          });
          if (response.organization.members.pageInfo.hasNextPage) {
            this.githubService.requestOrganizationMembersOffset(
                response.organization.login,
                response.organization.members.pageInfo.endCursor,
                query.request.parent, query.request.data[2].value);
          } else {
            // process organization members summary
          }
        });
    } else {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * orgRepoRequest
   */
  public orgRepoRequest(query) {
    const response = query.response;
    if (response && response.organization) {
      this.saveOrganizationRepositories(
        response.organization.repositories,
        response.organization.id,
        query.request.data[2].value
      )
      .then(() => {
        this.requestsCol.doc(query.id)
        .update({
          status: GitResponseStatus.SUCCESS,
          updatedAt: new Date().toISOString()
        });
        if (response.organization.repositories.pageInfo.hasNextPage) {
          this.githubService.requestOrganizationRepositoriesOffset(
              response.organization.login,
              response.organization.repositories.pageInfo.endCursor,
              query.request.parent, query.request.data[2].value);
        } else {
          // process organization repositories summary
          this.updateRepositoriesSummary(response.organization.id, query.request.data[0].value);
        }
      });
    } else {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoRequest
   */
  public repoRequest(query) {
    const res = query.response;
    if (res && res.repository) {
      // save the repo data
      this.saveRepositoryAssets(res.repository)
        .then((response) => {
          this.requestsCol.doc(query.id)
            .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
          if (response) {
            // check for pagination on all repository assets
            if (res.repository.deployKeys.pageInfo.hasNextPage) {
              this.githubService
                .requestRepositoriesDataOffset(
                  GitResource.REPOSITORY_DEPLOY_KEYS,
                  query.request.data[0].value,
                  query.request.data[1].value,
                  res.repository.deployKeys.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(
                res.repository.id,
                GitResource.REPOSITORY_DEPLOY_KEYS);
            }

            if (res.repository.deployments.pageInfo.hasNextPage) {
              this.githubService
                .requestRepositoriesDataOffset(
                  GitResource.REPOSITORY_DEPLOYMENTS,
                  query.request.data[0].value,
                  query.request.data[1].value,
                  res.repository.deployments.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_DEPLOYMENTS);
            }

            if (res.repository.issues.pageInfo.hasNextPage) {
              this.githubService
                .requestRepositoriesDataOffset(
                  GitResource.REPOSITORY_ISSUES,
                  query.request.data[0].value,
                  query.request.data[1].value,
                  res.repository.issues.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_ISSUES);
            }

            if (res.repository.milestones.pageInfo.hasNextPage) {
              this.githubService.requestRepositoriesDataOffset(
                GitResource.REPOSITORY_MILESTONES,
                query.request.data[0].value,
                query.request.data[1].value,
                res.repository.milestones.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_MILESTONES);
            }

            if (res.repository.projects.pageInfo.hasNextPage) {
              this.githubService
                .requestRepositoriesDataOffset(
                  GitResource.REPOSITORY_PROJECTS,
                  query.request.data[0].value,
                  query.request.data[1].value,
                  res.repository.projects.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_PROJECTS);
            }

            if (res.repository.pullRequests.pageInfo.hasNextPage) {
              this.githubService.requestRepositoriesDataOffset(
                GitResource.REPOSITORY_PULL_REQUESTS,
                query.request.data[0].value,
                query.request.data[1].value,
                res.repository.pullRequests.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_PULL_REQUESTS);
            }

            if (res.repository.releases.pageInfo.hasNextPage) {
              this.githubService.requestRepositoriesDataOffset(
                GitResource.REPOSITORY_RELEASES,
                query.request.data[0].value,
                query.request.data[1].value,
                res.repository.releases.pageInfo.endCursor, 1);
            } else {
              this.updateRepositoryAssetSummary(res.repository.id, GitResource.REPOSITORY_RELEASES);
            }
          }
        });
    } else {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoDeployKeysRequest
   */
  public repoDeployKeysRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      const deployKeys = this.mapRepositoryDeployKeys(response.repository.deployKeys.edges, response.repository.id);
      this.saveRepositoryDeployKeys(deployKeys, response.repository.id)
        .then(() => {
          this.requestsCol.doc(query.id)
            .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
          if (response.repository.deployKeys.pageInfo.hasNextPage) {
            this.githubService.requestRepositoriesDataOffset(
              GitResource.REPOSITORY_DEPLOY_KEYS,
              query.request.data[0].value,
              query.request.data[1].value,
              response.repository.deployKeys.pageInfo.endCursor,
              parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_DEPLOY_KEYS);
          }
        });
    } else {
      this.requestsCol
      .doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoDeploymentsRequest
   */
  public repoDeploymentsRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      const deployments = this.mapRepositoryDeployments(response.repository.deployments.edges, response.repository.id);
      this.saveRepositoryDeployments(deployments, response.repository.id)
      .then(() => {
        this.requestsCol.doc(query.id)
        .update({
          status: GitResponseStatus.SUCCESS,
          updatedAt: new Date().toISOString(),
        });
        if (response.repository.deployments.pageInfo.hasNextPage) {
          this.githubService
            .requestRepositoriesDataOffset(GitResource.REPOSITORY_DEPLOYMENTS,
              query.request.data[0].value,
              query.request.data[1].value,
              response.repository.deployments.pageInfo.endCursor,
              parseInt(query.request.data[3].value) + 1);
        } else {
          this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_DEPLOYMENTS);
        }
      });
    } else {
      this.requestsCol
      .doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoForksRequest
   */
  public repoForksRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      const forks = this.mapRepositoryForks(response.repository.forks.edges, response.repository.id);
      this.saveRepositoryForks(forks, response.repository.id)
        .then(() => {
          this.requestsCol.doc(query.id)
            .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
          if (response.repository.forks.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_FORKS,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.forks.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_FORKS);
          }
        });
    } else {
      this.requestsCol.doc(query.id)
        .update({ status: GitResponseStatus.FAILED, updatedAt: new Date().toISOString() });
    }
  }
  /**
   * repoIssuesRequest
   */
  public repoIssuesRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      const issues = this.mapRepositoryIssues(response.repository.issues.edges, response.repository.id);
      this.saveRepositoryIssues(issues, response.repository.id)
        .then(() => {
          this.requestsCol.doc(query.id)
            .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
          if (response.repository.issues.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_ISSUES,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.issues.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_ISSUES);
          }
        });
    } else {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoMileStonesRequest
   */
  public repoMileStonesRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      const milestones = this.mapRepositoryMilestones(response.repository.milestones.edges, response.repository.id);
      this.saveRepositoryMilestones(milestones, response.repository.id)
        .then(() => {
          if (response.repository.milestones.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_MILESTONES,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.milestones.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_MILESTONES);
          }
        });
    } else {
      this.requestsCol
      .doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }

  public repoProjectsRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.SUCCESS,
        updatedAt: new Date().toISOString()
      });
      const projects = this.mapRepositoryProjects(response.repository.projects.edges, response.repository.id);
      this.saveRepositoryProjects(projects, response.repository.id)
        .then(() => {
          if (response.repository.projects.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_PROJECTS,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.projects.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_PROJECTS);
          }
        });
    } else {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoPullRequestsRequest
   */
  public repoPullRequestsRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      this.requestsCol.doc(query.id)
      .update({
        status: GitResponseStatus.SUCCESS,
        updatedAt: new Date().toISOString()
      });
      const pullRequests =
        this.mapRepositoryPullRequests(response.repository.pullRequests.edges, response.repository.id);
      this.saveRepositoryPullRequests(pullRequests, response.repository.id)
        .then(() => {
          if (response.repository.pullRequests.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_PULL_REQUESTS,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.pullRequests.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_PULL_REQUESTS);
          }
        });
    } else {
      this.requestsCol
      .doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  /**
   * repoReleasesRequest
   */
  public repoReleasesRequest(query) {
    const response = query.response;
    if (response && response.repository) {
      this.requestsCol.doc(query.id)
        .update({ status: GitResponseStatus.SUCCESS, updatedAt: new Date().toISOString() });
      const releases = this.mapRepositoryReleases(response.repository.releases.edges, response.repository.id);
      this.saveRepositoryReleases(releases, response.repository.id)
        .then(() => {
          if (response.repository.releases.pageInfo.hasNextPage) {
            this.githubService
              .requestRepositoriesDataOffset(
                GitResource.REPOSITORY_RELEASES,
                query.request.data[0].value,
                query.request.data[1].value,
                response.repository.releases.pageInfo.endCursor,
                parseInt(query.request.data[3].value) + 1);
          } else {
            this.updateRepositoryAssetSummary(response.repository.id, GitResource.REPOSITORY_RELEASES);
          }
        });
    } else {
      this.requestsCol
      .doc(query.id)
      .update({
        status: GitResponseStatus.FAILED,
        updatedAt: new Date().toISOString()
      });
    }
  }
  public saveOrganization = (data: any, parent: string, orgId: number, orgSlug) => {
    const org = this.mapOrganization(data, orgId, orgSlug);
    return this.organizationsCol.doc(org.login.toLowerCase()).set(org)
      .then(() => {
        // Save members
        this.saveOrganizationMembers(data.organization.members, data.organization.login, orgSlug).then(() => {
          if (data.organization.members.pageInfo.hasNextPage) {
            this.githubService
            .requestOrganizationMembersOffset(
              org.login,
              data.organization.members.pageInfo.endCursor,
              parent,
              orgSlug
            );
          }
        });

        // Save repositories
        this.saveOrganizationRepositories(data.organization.repositories, data.organization.id, orgSlug).then(() => {
          if (data.organization.repositories.pageInfo.hasNextPage) {
            this.githubService
              .requestOrganizationRepositoriesOffset(
                org.login,
                data.organization.repositories.pageInfo.endCursor,
                parent, orgSlug);
          } else {
            this.updateRepositoriesSummary(data.organization.id, org.login);

          }
        });
      })
      .catch((_e) => {
      });
  };

  public updateOrganization = (data: any, _parent: string, _orgId: number, _orgSlug) => {
    return this.organizationsCol.doc(data.organization.login.toLowerCase()).update({
      ['membersCount']: data.organization.members.totalCount,
      ['repositoriesCount']: data.organization.repositories.totalCount,
    })
      .then(() => {
        // update members and repositories
      });
  };

  public mapOrganization = (data: any, orgId: number, orgSlug: string) => {
    const org = {
      id: data.organization.id,
      login: data.organization.login,
      cmcId: parseInt(orgId.toString()),
      slug: orgSlug,
      isOnline: false,
    };

    this.addFieldDataIfValid(org, 'avatarUrl', data.organization.avatarUrl);
    this.addFieldDataIfValid(org, 'databaseId', data.organization.databaseId);
    this.addFieldDataIfValid(org, 'description', data.organization.description);
    this.addFieldDataIfValid(org, 'email', data.organization.email);
    this.addFieldDataIfValid(org, 'location', data.organization.location);
    this.addFieldDataIfValid(org, 'login', data.organization.login);
    this.addFieldDataIfValid(org, 'name', data.organization.name);
    this.addFieldDataIfValid(org, 'projectsResourcePath', data.organization.projectsResourcePath);
    this.addFieldDataIfValid(org, 'projectsUrl', data.organization.projectsUrl);
    this.addFieldDataIfValid(org, 'resourcePath', data.organization.resourcePath);
    this.addFieldDataIfValid(org, 'teamsResourcePath', data.organization.teamsResourcePath);
    this.addFieldDataIfValid(org, 'teamsUrl', data.organization.teamsUrl);
    this.addFieldDataIfValid(org, 'url', data.organization.url);
    this.addFieldDataIfValid(org, 'websiteUrl', data.organization.websiteUrl);

    org['membersCount'] = data.organization.members.totalCount;
    org['repositoriesCount'] = data.organization.repositories.totalCount;
    org['github'] = {
      repositories: 0,
      diskUsage: 0,
      forkCount: 0,
      forks: 0,
      issues: 0,
      commits: 0,
      milestones: 0,
      projects: 0,
      pullRequests: 0,
      releases: 0,
      stargazers: 0,
      watchers: 0,
    };
    return org;
  };

  public mapRepository = (data, organizationId) => {
    const repos = {
      id: data.id,
      organization: organizationId,
    };

    this.addFieldDataIfValid(repos, 'createdAt', data.createdAt);
    this.addFieldDataIfValid(repos, 'databaseId', data.databaseId);
    this.addFieldDataIfValid(repos, 'description', data.description);
    this.addFieldDataIfValid(repos, 'diskUsage', data.diskUsage);
    this.addFieldDataIfValid(repos, 'forkCount', data.forkCount);
    this.addFieldDataIfValid(repos, 'hasIssuesEnabled', data.hasIssuesEnabled);
    this.addFieldDataIfValid(repos, 'hasWikiEnabled', data.hasWikiEnabled);
    this.addFieldDataIfValid(repos, 'homepageUrl', data.homepageUrl);
    this.addFieldDataIfValid(repos, 'isArchived', data.isArchived);
    this.addFieldDataIfValid(repos, 'isFork', data.isFork);
    this.addFieldDataIfValid(repos, 'isLocked', data.isLocked);
    this.addFieldDataIfValid(repos, 'isMirror', data.isMirror);
    this.addFieldDataIfValid(repos, 'isPrivate', data.isPrivate);
    this.addFieldDataIfValid(repos, 'lockReason', data.lockReason);
    this.addFieldDataIfValid(repos, 'mergeCommitAllowed', data.mergeCommitAllowed);
    this.addFieldDataIfValid(repos, 'mirrorUrl', data.mirrorUrl);
    this.addFieldDataIfValid(repos, 'name', data.name);
    this.addFieldDataIfValid(repos, 'nameWithOwner', data.nameWithOwner);
    this.addFieldDataIfValid(repos, 'projectsResourcePath', data.projectsResourcePath);
    this.addFieldDataIfValid(repos, 'projectsUrl', data.projectsUrl);
    this.addFieldDataIfValid(repos, 'pushedAt', data.pushedAt);
    this.addFieldDataIfValid(repos, 'rebaseMergeAllowed', data.rebaseMergeAllowed);
    this.addFieldDataIfValid(repos, 'resourcePath', data.resourcePath);
    this.addFieldDataIfValid(repos, 'squashMergeAllowed', data.squashMergeAllowed);
    this.addFieldDataIfValid(repos, 'updatedAt', data.updatedAt);
    this.addFieldDataIfValid(repos, 'url', data.url);
    this.addFieldDataIfValid(repos, 'codeOfConduct', data.codeOfConduct);
    this.addFieldDataIfValid(repos, 'defaultBranchRef', data.defaultBranchRef);
    this.addFieldDataIfValid(repos, 'licenseInfo', data.licenseInfo);
    this.addFieldDataIfValid(repos, 'owner', data.owner);
    this.addFieldDataIfValid(repos, 'parent', data.parent);
    this.addFieldDataIfValid(repos, 'primaryLanguage', data.primaryLanguage);
    repos['assignableUsers'] = data.assignableUsers.totalCount;
    repos['deployKeys'] = data.deployKeys.totalCount;
    repos['deployments'] = data.deployments.totalCount;
    repos['forks'] = data.forks.totalCount;
    repos['issues'] = data.issues.totalCount;
    repos['languages'] = data.languages.totalCount;
    repos['milestones'] = data.milestones.totalCount;
    repos['projects'] = data.projects.totalCount;
    repos['pullRequests'] = data.pullRequests.totalCount;
    repos['releases'] = data.releases.totalCount;
    repos['watchers'] = data.watchers.totalCount;
    repos['stargazers'] = data.stargazers.totalCount;
    return repos;

  };

  public mapMember = (data, orgLogin) => {
    const member = {
      id: data.id,
      login: data.login,
      organization: orgLogin,
    };
    this.addFieldDataIfValid(member, 'avatarUrl', data.avatarUrl);
    this.addFieldDataIfValid(member, 'bio', data.bio);
    this.addFieldDataIfValid(member, 'company', data.company);
    this.addFieldDataIfValid(member, 'createdAt', data.createdAt);
    this.addFieldDataIfValid(member, 'databaseId', data.databaseId);
    this.addFieldDataIfValid(member, 'email', data.email);
    this.addFieldDataIfValid(member, 'isBountyHunter', data.isBountyHunter);
    this.addFieldDataIfValid(member, 'isCampusExpert', data.isCampusExpert);
    this.addFieldDataIfValid(member, 'isDeveloperProgramMember', data.isDeveloperProgramMember);
    this.addFieldDataIfValid(member, 'isEmployee', data.isEmployee);
    this.addFieldDataIfValid(member, 'isHireable', data.isHireable);
    this.addFieldDataIfValid(member, 'isSiteAdmin', data.isSiteAdmin);
    this.addFieldDataIfValid(member, 'location', data.location);
    this.addFieldDataIfValid(member, 'name', data.name);
    this.addFieldDataIfValid(member, 'resourcePath', data.resourcePath);
    this.addFieldDataIfValid(member, 'updatedAt', data.updatedAt);
    this.addFieldDataIfValid(member, 'url', data.url);
    this.addFieldDataIfValid(member, 'websiteUrl', data.websiteUrl);
    member['followers'] = data.followers.totalCount;
    member['organizations'] = data.organizations.totalCount;
    member['pullRequests'] = data.pullRequests.totalCount;
    member['repositories'] = data.repositories.totalCount;
    member['starredRepositories'] = data.starredRepositories.totalCount;
    member['watching'] = data.watching.totalCount;

    return member;

  };

  public saveOrganizationMembers = (members, orgLogin, _orgSlug) => {
    const batch = this.fbService.db.batch();
    const membersRef = [];
    members.edges.forEach((m) => {
      membersRef.push(m.node.id);
      const mObject = this.mapMember(m.node, orgLogin);
      const mRef = this.membersCol.doc(m.node.id);
      batch.set(mRef, mObject);
    });
    return batch.commit()
      .then(() => {
        membersRef.forEach((m) => {
          this.organizationsCol.doc(orgLogin.toLowerCase()).collection('members').doc(m).set({
            added: true,
          });
        });

      })
      .catch(() => {

      });

  };

  public saveOrganizationRepositories = (repositories, organizationId, _orgSlug) => {
    const batch = this.fbService.db.batch();
    repositories.edges.forEach((r) => {
      const rObject = this.mapRepository(r.node, organizationId);
      const rRef = this.repositoriesCol.doc(r.node.id);
      batch.set(rRef, rObject);
    });
    return batch.commit()
      .then(() => {

      })
      .catch(() => {

      });
  };

  public updateRepositoriesSummary = (orgId, orgLogin) => {
    return this.fbService.db.collection('cml-git-repositories')
      .where('organization', '==', orgId)
      .get()
      .then((docs) => {
        const summary = {
          diskUsage: docs.docs.map((r) => {
            return parseInt(r.data().diskUsage) || 0;
          }).reduce((ac, next) => ac + next, 0),
          forkCount: docs.docs.map((r) => {
            return parseInt(r.data().forkCount) || 0;
          }).reduce((ac, next) => ac + next, 0),
          forks: docs.docs.map((r) => {
            return parseInt(r.data().forks) || 0;
          }).reduce((ac, next) => ac + next, 0),
          issues: docs.docs.map((r) => {
            return parseInt(r.data().issues) || 0;
          }).reduce((ac, next) => ac + next, 0),
          commits: docs.docs.map((r) => {
            if (r.data().defaultBranchRef) {
              return parseInt(r.data().defaultBranchRef.target.history.totalCount) || 0;
            } else {
              return 0;
            }
          }).reduce((ac, next) => ac + next, 0),
          milestones: docs.docs.map((r) => {
            return parseInt(r.data().milestones) || 0;
          }).reduce((ac, next) => ac + next, 0),
          projects: docs.docs.map((r) => {
            return parseInt(r.data().projects) || 0;
          }).reduce((ac, next) => ac + next, 0),
          pullRequests: docs.docs.map((r) => {
            return parseInt(r.data().pullRequests) || 0;
          }).reduce((ac, next) => ac + next, 0),
          releases: docs.docs.map((r) => {
            return parseInt(r.data().releases) || 0;
          }).reduce((ac, next) => ac + next, 0),
          stargazers: docs.docs.map((r) => {
            return parseInt(r.data().stargazers) || 0;
          }).reduce((ac, next) => ac + next, 0),
          watchers: docs.docs.map((r) => {
            return parseInt(r.data().watchers) || 0;
          }).reduce((ac, next) => ac + next, 0),
        };
        // trigger update on all repos
        docs.docs.forEach((doc) => {
          this.updateRepositoryData(orgLogin, doc.data().name);
        });
        return this.organizationsCol.doc(orgLogin.toLowerCase()).update('github', summary);
      });
  };

  public updateRepositoryData = (orgLogin: string, repo: string) => {
    this.githubService.requestRepositoriesData(orgLogin, repo);
  };

  public mapRepositoryUsers = (data: any[], _id) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.id,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryUsers = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('users').doc(m.id);
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryDeployKeys = (data: any[], repoId) => {
    if (data.length > 0) {
      const result = [];
      data.forEach((entry) => {
        const obj = {
          id: entry.node.id,
          key: entry.node.key,
          readOnly: entry.node.readOnly,
          title: entry.node.title,
          verified: entry.node.verified,
          repoId,
        };
        result.push(obj);
      });
      return result;
    } else {
      return [];
    }
  };

  public saveRepositoryDeployKeys = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('deploy-keys').doc(m.id);
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryDeployments = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.commit.id,
        createdAt: entry.node.createdAt,
        creator: entry.node.creator.login,
        databaseId: entry.node.databaseId,
        environment: entry.node.environment,
        latestStatus: entry.node.latestStatus,
        payload: entry.node.payload,
        state: entry.node.state,
        repoId,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryDeployments = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('deployments').doc(m.id);
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryForks = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        commit: entry.node.commit ? entry.node.commit : null,
        owner: entry.node.owner,
        nameWithOwner: entry.node.nameWithOwner,
        repoId,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryForks = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('forks').doc(m.nameWithOwner.split('/').join('-'));
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryIssues = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        activeLockReason: entry.node.activeLockReason,
        assignees: entry.node.assignees.totalCount,
        author: entry.node.author,
        bodyText: entry.node.bodyText,
        closed: entry.node.closed,
        closedAt: entry.node.closedAt,
        comments: entry.node.comments.totalCount,
        createdAt: entry.node.createdAt,
        createdViaEmail: entry.node.createdViaEmail,
        databaseId: entry.node.databaseId,
        editor: entry.node.editor,
        id: entry.node.id,
        lastEditedAt: entry.node.lastEditedAt,
        locked: entry.node.locked,
        participants: entry.node.participants.totalCount,
        publishedAt: entry.node.publishedAt,
        state: entry.node.state,
        title: entry.node.title,
        updatedAt: entry.node.updatedAt,
        url: entry.node.url,
        repoId,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryIssues = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('issues').doc(m.id);
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryMilestones = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.id,
        repoId,
        closed: entry.node.closed,
        closedAt: entry.node.closedAt,
        creator: entry.node.creator,
        description: entry.node.description,
        dueOn: entry.node.dueOn,
        issues: entry.node.issues.totalCount,
        number: entry.node.number,
        pullRequests: entry.node.pullRequests,
        state: entry.node.state,
        title: entry.node.title,
        updatedAt: entry.node.updatedAt,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryMilestones = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('milestones').doc(m.id);
      batch.set(mRef, m);
    });

    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryProjects = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.id,
        repoId,
        body: entry.node.bodyHTML,
        closed: entry.node.closed,
        closedAt: entry.node.closedAt,
        creator: entry.node.creator,
        databaseId: entry.node.databaseId,
        name: entry.node.name,
        number: entry.node.number,
        state: entry.node.state,
        updatedAt: entry.node.updatedAt,
        owner: entry.node.owner,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryProjects = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('projects').doc(m.id);
      batch.set(mRef, m);
    });
    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryPullRequests = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.id,
        repoId,
        activeLockReason: entry.node.activeLockReason,
        additions: entry.node.additions,
        assignees: entry.node.assignees.totalCount,
        author: entry.node.author,
        authorAssociation: entry.node.authorAssociation,
        baseRefName: entry.node.baseRefName,
        baseRefOid: entry.node.baseRefOid,
        body: entry.node.bodyHTML,
        changedFiles: entry.node.changedFiles,
        closed: entry.node.closed,
        closedAt: entry.node.closedAt,
        comments: entry.node.comments.totalCount,
        commits: entry.node.commits.totalCount,
        createdAt: entry.node.createdAt,
        createdViaEmail: entry.node.createdViaEmail,
        databaseId: entry.node.databaseId,
        deletions: entry.node.deletions,
        editor: entry.node.editor,
        headRefName: entry.node.headRefName,
        headRefOid: entry.node.headRefOid,
        headRepository: entry.node.headRepository,
        lastEditedAt: entry.node.lastEditedAt,
        locked: entry.node.locked,
        merged: entry.node.merged,
        mergedBy: entry.node.mergedBy,
        mergedAt: entry.node.mergedAt,
        mergeable: entry.node.mergeable,
        number: entry.node.number,
        participants: entry.node.participants,
        publishedAt: entry.node.publishedAt,
        reviews: entry.node.reviews,
        state: entry.node.state,
        title: entry.node.title,
        updatedAt: entry.node.updatedAt,
      };
      result.push(obj);
    });
    return result;
  };

  public saveRepositoryPullRequests = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('pull-requests').doc(m.id);
      batch.set(mRef, m);
    });
    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public mapRepositoryReleases = (data: any[], repoId) => {
    const result = [];
    data.forEach((entry) => {
      const obj = {
        id: entry.node.id,
        repoId,
        author: entry.node.author,
        createdAt: entry.node.createdAt,
        description: entry.node.description,
        isDraft: entry.node.isDraft,
        isPrerelease: entry.node.isPrerelease,
        name: entry.node.name,
        publishedAt: entry.node.publishedAt,
        tag: entry.node.tag,
        updatedAt: entry.node.updatedAt,
        assets: entry.node.releaseAssets.totalCount ? entry.node.releaseAssets.totalCount : 0,
      };

      result.push(obj);
    });
    return result;
  };

  public saveRepositoryReleases = (data: any[], repoId) => {
    const batch = this.fbService.db.batch();
    const queryRefs = [];
    data.forEach((m) => {
      queryRefs.push(m);
      const mRef = this.repositoriesAssetsCol.doc(repoId).collection('releases').doc(m.id);
      batch.set(mRef, m);
    });
    return batch.commit()
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  };

  public saveRepositoryAssets = (repository: any) => {
    const assignableUsers = this.mapRepositoryUsers(repository.assignableUsers.edges, repository.id);
    const deployKeys = this.mapRepositoryDeployKeys(repository.deployKeys.edges, repository.id);
    const deployments = this.mapRepositoryDeployments(repository.deployments.edges, repository.id);
    const forks = this.mapRepositoryForks(repository.forks.edges, repository.id);
    const issues = this.mapRepositoryIssues(repository.issues.edges, repository.id);
    const milestones = this.mapRepositoryMilestones(repository.milestones.edges, repository.id);
    const projects = this.mapRepositoryProjects(repository.projects.edges, repository.id);
    const pullRequests = this.mapRepositoryPullRequests(repository.pullRequests.edges, repository.id);
    const releases = this.mapRepositoryReleases(repository.releases.edges, repository.id);

    return Promise.all([
      this.saveRepositoryUsers(assignableUsers, repository.id),
      this.saveRepositoryDeployKeys(deployKeys, repository.id),
      this.saveRepositoryDeployments(deployments, repository.id),
      this.saveRepositoryForks(forks, repository.id),
      this.saveRepositoryIssues(issues, repository.id),
      this.saveRepositoryMilestones(milestones, repository.id),
      this.saveRepositoryProjects(projects, repository.id),
      this.saveRepositoryPullRequests(pullRequests, repository.id),
      this.saveRepositoryReleases(releases, repository.id),
    ]).then((response) => {
      return response;
    }).catch(() => {
      return false;
    });
  };

  public updateRepositoryAssetSummary = (repositoryId: string, assetType: GitResource) => {
    let asset;
    switch (assetType) {
      case GitResource.REPOSITORY_DEPLOY_KEYS:
        asset = 'deploy-keys';
        break;
      case GitResource.REPOSITORY_DEPLOYMENTS:
        asset = 'deployments';
        break;
      case GitResource.REPOSITORY_FORKS:
        asset = 'forks';
        break;
      case GitResource.REPOSITORY_ISSUES:
        asset = 'issues';
        break;
      case GitResource.REPOSITORY_MILESTONES:
        asset = 'milestones';
        break;
      case GitResource.REPOSITORY_PROJECTS:
        asset = 'projects';
        break;
      case GitResource.REPOSITORY_PULL_REQUESTS:
        asset = 'pull-requests';
        break;
      case GitResource.REPOSITORY_RELEASES:
        asset = 'releases';
        break;
    }


    return this.fbService.db.collection('cml-git-repositories-assets')
      .doc(repositoryId)
      .collection(asset)
      .get()
      .then((docs) => {
        const status = [];
        status[asset] = docs.docs.length;
        return this.fbService.db.collection('cml-git-repositories-assets')
          .doc(repositoryId)
          .set({
            status,
          }, { merge: true });

      });
  };

  /*
  * @dev: Helper function that make sure a value is not null and not empty before adding it to the object
  * @parmas:
  * - obj: Object
  * - key: String
  * - value: string
  */
  public addFieldDataIfValid = (obj, key, value) => {
    if ((value || value === 0) && value !== '' && key) {
      obj[key] = value;
    }
  };

}
