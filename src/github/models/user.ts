/*
 * User
 * Represents a comment on an User.
 * https://developer.github.com/v4/object/user/
 */
import { CommitComment, Organization, PullRequest, Repository } from '.';

export class User {
  public avatarUrl!: string;
  public bio!: string;
  public company!: string;
  public createdAt!: Date;
  public databaseId!: number;
  public email!: string;
  public id!: string;
  public isBountyHunter!: boolean;
  public isCampusExpert!: boolean;
  public isDeveloperProgramMember!: boolean;
  public isEmployee!: boolean;
  public isHireable!: boolean;
  public isSiteAdmin!: boolean;
  public location!: string;
  public login!: string;
  public name!: string;
  public resourcePath!: string;
  public updatedAt!: Date;
  public url!: string;
  public websiteUrl!: string;

  public commentsCount!: number;
  public followersCount!: number;
  public followingCount!: number;
  public organizationsCount!: number;
  public pullRequestsCount!: number;
  public repositoriesCount!: number;
  public starredRepositoriesCount!: number;
  public watchingCount!: number;

  public commitComments: CommitComment[];
  public followers: User[];
  public following: User[];
  public organizations: Organization[];
  public pullRequests: PullRequest[];
  public repositories: Repository[];
  public starredRepositories: Repository[];
  public watching: Repository[];

  public constructor() {
    this.commitComments = [];
    this.followers = [];
    this.following = [];
    this.organizations = [];
    this.pullRequests = [];
    this.repositories = [];
    this.starredRepositories = [];
    this.watching = [];
  }
}