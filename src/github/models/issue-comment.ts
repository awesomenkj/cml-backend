/*
 * IssueComment
 * Represents a comment on an IssueComment.
 * https://developer.github.com/v4/object/issuecomment/
 */
import { Actor, CommentAuthorAssociation } from '.';

export class IssueComment {
    public author!: Actor;
    public authorAssociation!: CommentAuthorAssociation;
    public body!: string;
    public createdAt!: Date;
    public createdViaEmail!: boolean;
    public databaseId!: number;
    public editor!: Actor;
    public id!: string;
    public includesCreatedEdit!: false;
    public issueId!: string;
    public lastEditedAt!: Date;
    public publishedAt!: Date;
    public repositoryId!: string;
    public resourcePath!: string;
    public updatedAt!: Date;
    public url!: string;

    public constructor() {

    }
}