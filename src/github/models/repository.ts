/*
 * Repository
 * Represents a comment on an Repository.
 * https://developer.github.com/v4/object/repository/
 */
// tslint:disable-next-line
import {
  CodeOfConduct,
  DeployKey,
  Deployment,
  Issue,
  Language,
  License,
  Milestone,
  Project,
  PullRequest,
  Ref,
  Release,
  RepositoryOwner,
  RepositoryTopic,
  User,
} from '.';

export class Repository {
  public codeOfConduct: CodeOfConduct;
  public createdAt: Date;
  public databaseId: number;
  public defaultBranchRef: Ref;
  public description: string;
  public diskUsage: number;
  public forkCount: number;
  public hasIssuesEnabled: boolean;
  public hasWikiEnabled: boolean;
  public homepageUrl: string;
  public id: string;
  public isArchived: boolean;
  public isFork: boolean;
  public isLocked: boolean;
  public isMirror: boolean;
  public isPrivate: boolean;
  public licenseInfo: License;
  public lockReason: RepositoryLockReason;
  public mergeCommitAllowed: boolean;
  public mirrorUrl: string;
  public name: string;
  public nameWithOwner: string;
  public owner: RepositoryOwner;
  public parentId: string;
  public primaryLanguage: Language;
  public projectsResourcePath: string;
  public projectsUrl: string;
  public pushedAt: Date;
  public rebaseMergeAllowed: boolean;
  public resourcePath: string;
  public squashMergeAllowed: boolean;
  public updatedAt: Date;
  public url: string;

  public assignableUsersCount: number;
  public deployKeysCount: number;
  public deploymentsCount: number;
  public issuesCount: number;
  public languagesCount: number;
  public milestonesCount: number;
  public projectsCount: number;
  public pullRequestsCount: number;
  public releasesCount: number;
  public repositoryTopicsCount: number;
  public stargazersCount: number;
  public watchersCount: number;

  public assignableUsers: User[];
  public deployKeys: DeployKey[];
  public deployments: Deployment[];
  public forks: Repository[];
  public issues: Issue[];
  public languages: Language[];
  public milestones: Milestone[];
  public projects: Project[];
  public pullRequests: PullRequest[];
  public releases: Release[];
  public repositoryTopics: RepositoryTopic[];
  public stargazers: User[];
  public watchers: User[];

  public constructor() {
    this.assignableUsers = [];
    this.deployKeys = [];
    this.deployments = [];
    this.forks = [];
    this.issues = [];
    this.languages = [];
    this.milestones = [];
    this.projects = [];
    this.pullRequests = [];
    this.releases = [];
    this.repositoryTopics = [];
    this.stargazers = [];
    this.watchers = [];
  }
}

export enum RepositoryLockReason {
  BILLING,
  MIGRATING,
  MOVING,
  RENAME
}