/*
 * PullRequest
 * Represents a comment on an PullRequest.
 * https://developer.github.com/v4/object/pullrequest/
 */
// tslint:disable-next-line
import { Actor, CommentAuthorAssociation, IssueComment, LockReason, Milestone, PullRequestCommit, PullRequestReview, RepositoryOwner, User } from '.';

export class PullRequest {
  public activeLockReason!: LockReason;
  public additions!: number;
  public author!: Actor;
  public authorAssociation!: CommentAuthorAssociation;
  public baseRefName!: string;
  public body!: string;
  public changedFiles!: number;
  public closed!: boolean;
  public closedAt!: Date;
  public createdAt!: Date;
  public createdViaEmail!: boolean;
  public databaseId!: number;
  public deletions!: number;
  public editor!: Actor;
  public headRefName!: string;
  public headRepositoryId!: string;
  public headRepositoryOwner!: RepositoryOwner;
  public id!: string;
  public includesCreatedEdit!: boolean;
  public isCrossRepository!: boolean;
  public lastEditedAt!: Date;
  public locked!: boolean;
  public maintainerCanModify!: boolean;
  public merged!: boolean;
  public mergedAt!: Date;
  public mergedBy!: Actor;
  public milestone!: Milestone;
  public number!: number;
  public publishedAt!: Date;
  public repositoryId!: string;
  public resourcePath!: string;
  public revertResourcePath!: string;
  public revertUrl!: string;
  public state!: pullrequeststate;
  public title!: string;
  public updatedAt!: Date;
  public url!: string;

  public assignees: User[];
  public comments: IssueComment[];
  public commits: PullRequestCommit[];
  public participants: User[];
  public reviews: PullRequestReview[];

  public constructor() {
    this.assignees = [];
    this.comments = [];
    this.commits = [];
    this.participants = [];
    this.reviews = [];
  }
}

export enum pullrequeststate {
  CLOSED,
  MERGED,
  OPEN
}