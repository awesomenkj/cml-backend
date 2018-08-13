/*
 * PullRequestReview
 * Represents a comment on an PullRequestReview.
 * https://developer.github.com/v4/object/pullrequestreview/
 */
import { Actor, CommentAuthorAssociation } from '.';

export class PullRequestReview {
    public author!: Actor;
    public authorAssociation!: CommentAuthorAssociation;
    public body!: string;
    public commitId!: string;
    public createdAt!: Date;
    public createdViaEmail!: boolean;
    public databaseId!: number;
    public editor!: Actor;
    public id!: string;
    public includesCreatedEdit!: boolean;
    public lastEditedAt!: Date;
    public publishedAt!: Date;
    public pullRequestId!: string;
    public repositoryId!: string;
    public resourcePath!: string;
    public state;
    public submittedAt!: Date;
    public updatedAt!: Date;
    public url!: string;

    public constructor() {

    }

}

export enum PullRequestReviewState {
    APPROVED,
    CHANGES_REQUESTED,
    COMMENTED,
    DISMISSED,
    PENDING
}