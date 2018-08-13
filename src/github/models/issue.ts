/*
 * Issue
 * Represents a comment on an Issue.
 * https://developer.github.com/v4/object/issue/
 */
import { Actor, CommentAuthorAssociation, IssueComment, Milestone, User } from '.';

export class Issue {
    public activeLockReason!: LockReason;
    public author!: Actor;
    public authorAssociation!: CommentAuthorAssociation;
    public body!: string;
    public closed!: boolean;
    public closedAt!: Date;
    public createdAt!: Date;
    public createdViaEmail!: boolean;
    public databaseId!: number;
    public editor!: Actor;
    public id!: string;
    public includesCreatedEdit!: boolean;
    public lastEditedAt!: Date;
    public locked!: boolean;
    public milestone!: Milestone;
    public number!: number;
    public publishedAt!: Date;
    public repositoryId!: string;
    public resourcePath!: string;
    public state!: IssueState;
    public title!: string;
    public updatedAt!: Date;
    public url!: string;

    public assignees: User[];
    public comments: IssueComment[];

    public constructor() {
        this.assignees = [];
        this.comments = [];
    }

}

export enum LockReason {
    OFF_TOPIC,
    RESOLVED,
    SPAM,
    TOO_HEATED
}

export enum IssueState {
    CLOSED,
    OPEN
}