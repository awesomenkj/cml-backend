import { Injectable } from '@nestjs/common';

@Injectable()
export class GraphqlService {

  public getOrganizationFields = (login: string) => {
    const query = this.getBaseOrganizationFields(login);
    return query + `avatarUrl,databaseId,description,email,location,name,
    projectsResourcePath,projectsUrl,resourcePath,teamsResourcePath,
    teamsUrl,url,websiteUrl,`;
  };

  public getBaseOrganizationFields = (login: string) => {
    return 'organization(login:"' + login + '"){ id,login,';
  };

  public getOrganizationMembers = (first: number, after: string) => {
    let query = this.initQuery('members', first, after);
    query += `
            totalCount
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges {
                node {
                    avatarUrl,bio,company,
                    createdAt,databaseId,email,id,
                    isBountyHunter,isCampusExpert,
                    isDeveloperProgramMember,isEmployee,
                    isHireable,isSiteAdmin,location,login,name,resourcePath,updatedAt,url,websiteUrl,
                    commitComments{
                        totalCount
                    }
                    followers{
                        totalCount
                    }
                    organizations{
                        totalCount
                    }
                    pullRequests{
                        totalCount
                    }
                    repositories{
                        totalCount
                    }
                    starredRepositories{
                        totalCount
                    }
                    watching{
                        totalCount
                    }
                }
            }
        }`;
    return query;

  };

  public getOrganizationRepositories = (first: number, after: string) => {
    let query = this.initQuery('repositories', first, after);
    query += `
            totalCount
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges {
                node{
                    createdAt,databaseId,description,
                    diskUsage,forkCount,hasIssuesEnabled,
                    hasWikiEnabled,homepageUrl,id,isArchived,
                    isFork,isLocked,isMirror,isPrivate,
                    lockReason,mergeCommitAllowed,mirrorUrl,name,
                    nameWithOwner,projectsResourcePath,projectsUrl,
                    pushedAt,rebaseMergeAllowed,resourcePath,squashMergeAllowed,updatedAt,url,
                    codeOfConduct {
                        key
                    }
                    defaultBranchRef {
                        id,name,prefix
                        target {
                            commitUrl,commitResourcePath,id,oid,__typename
                            ... on Commit {
                                history{
                                    totalCount
                                }
                            }
                        }
                    }
                    licenseInfo {
                        id
                    }
                    owner {
                        id
                    }
                    parent {
                        id
                    }
                    primaryLanguage {
                        id
                        color
                        name
                    }
                    assignableUsers{
                        totalCount
                    }
                    deployKeys{
                        totalCount
                    }
                    deployments{
                        totalCount
                    }
                    forks{
                        totalCount
                    }
                    issues{
                        totalCount
                    }
                    languages{
                        totalCount
                    }
                    milestones {
                        totalCount
                    }
                    projects {
                        totalCount
                    }
                    pullRequests {
                        totalCount
                    }
                    releases {
                        totalCount
                    }
                    stargazers {
                        totalCount
                    }
                    watchers {
                        totalCount
                    }
                }
            }
        }`;
    return query;
  };

  public getOrganizationProjects = (first: number, after: string) => {
    let query = this.initQuery('projects', first, after);
    query += `
            totalCount
            edges {
                node {
                    id,body,closed,closedAt,databaseId,id,name,number,resourcePath
                    owner{
                        id
                    }
                }
            }
        }`;
    return query;
  };

  public getOrganizationTeams = (first: number, after: string) => {
    let query = this.initQuery('teams', first, after);
    query += `
            totalCount
            edges {
                node {
                    avatarUrl,createdAt,description,id,name,updatedAt,url,
                    members{
                        totalCount
                      }
                }
            }
        }`;
    return query;
  };

  public getBaseRepository = (owner: string, repo: string) => {
    return 'repository(owner:"' + owner + '",name:"' + repo + '"){id,';
  };

  public getRepositoryAssignableUsers = (first: number, after: string) => {
    let query = this.initQuery('assignableUsers', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    id
                }
            }
        }`;
    return query;
  };

  public getRepositoryDeployKeys = (first: number, after: string) => {
    let query = this.initQuery('deployKeys', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    id
                    key
                    readOnly
                    title
                    verified
                }
            }
        }`;
    return query;
  };

  public getRepositoryDeployments = (first: number, after: string) => {
    let query = this.initQuery('deployments', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    commit{
                        id
                    }
                    createdAt
                    creator{
                        login
                    }
                    databaseId
                    environment
                    latestStatus{
                        createdAt
                        id
                        state
                        updatedAt
                    }
                    payload
                    state
                }
            }
        }`;
    return query;
  };

  public getRepositoryForks = (first: number, after: string) => {
    let query = this.initQuery('forks', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    id
                    owner{
                        id
                        login
                    }
                    nameWithOwner
                    url
                }
            }
        }`;
    return query;
  };

  public getRepositoryIssues = (first: number, after: string) => {
    let query = this.initQuery('issues', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    activeLockReason
                    assignees{
                        totalCount
                    }
                    author{
                        login
                    }
                    bodyText
                    closed
                    closedAt
                    comments{
                        totalCount
                    }
                    createdAt
                    createdViaEmail
                    databaseId
                    editor{
                        login
                    }
                    id
                    lastEditedAt
                    locked
                    participants{
                        totalCount
                    }
                    publishedAt
                    state
                    title
                    updatedAt
                    url
                }
            }
        }`;
    return query;
  };

  public getRepositoryMilestones = (first: number, after: string) => {
    let query = this.initQuery('milestones', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    id
                    closed
                    closedAt
                    createdAt
                    creator{
                        login
                        url
                    }
                    description
                    dueOn
                    issues{
                        totalCount
                    }
                    number
                    pullRequests{
                        totalCount
                    }
                    state
                    title
                    updatedAt
                }
            }
        }`;
    return query;
  };

  public getRepositoryProjects = (first: number, after: string) => {
    let query = this.initQuery('projects', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    bodyHTML
                    closed
                    closedAt
                    creator{
                        login
                        url
                    }
                    databaseId
                    id
                    name
                    number
                    state
                    updatedAt
                    owner{
                        id
                    }
                }
            }
        }`;
    return query;
  };

  public getRepositoryPullRequests = (first: number, after: string) => {
    let query = this.initQuery('pullRequests', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    activeLockReason
                    additions
                    assignees{
                        totalCount
                    }
                    author{
                        login
                        url
                    }
                    authorAssociation
                    baseRefName
                    baseRefOid
                    bodyHTML
                    changedFiles
                    closed
                    closedAt
                    comments{
                        totalCount
                    }
                    commits{
                        totalCount
                    }
                    createdAt
                    createdViaEmail
                    databaseId
                    deletions
                    editor{
                        login
                        url
                    }
                    headRefName
                    headRefOid
                    headRepository{
                        id
                    }
                    id
                    lastEditedAt
                    locked
                    merged
                    mergedBy{
                        login
                        url
                    }
                    mergedAt
                    mergeable
                    number
                    participants{
                        totalCount
                    }
                    publishedAt
                    reviews{
                        totalCount
                    }
                    state
                    title
                    updatedAt
                }
            }
        }`;
    return query;
  };

  public getRepositoryReleases = (first: number, after: string) => {
    let query = this.initQuery('releases', first, after);
    query += `
            pageInfo{
                startCursor,endCursor,hasNextPage,hasPreviousPage
            }
            edges{
                node{
                    author{
                        id
                    }
                    createdAt
                    description
                    id
                    isDraft
                    isPrerelease
                    name
                    publishedAt
                    releaseAssets{
                        totalCount
                    }
                    tag{
                        id
                        name
                    }
                    updatedAt
                }
            }
        }`;
    return query;
  };

  public getRepositoryOpenIssues = () => {
    const query = `issues(states:OPEN){
            totalCount
        }`;
    return query;
  };

  public getRepositoryClosedIssues = () => {
    const query = `issues(states:CLOSED){
            totalCount
        }`;
    return query;
  };

  public initQuery = (node: string, first: number, after: string) => {
    let query = node;
    if (after !== '') {
      query += '(first:' + first + ',after:"' + after + '"){';
    } else {
      query += '(first:' + first + '){';
    }
    return query;
  };

  public getRateLimit = () => {
    return `rateLimit {
            limit
            cost
            remaining
            resetAt
        }`;
  };

}