/*
 * CommitComment
 * Represents a comment on a given Commit.
 * https://developer.github.com/v4/object/commitcomment/
 */
import { Actor, CommentAuthorAssociation } from '.';

export class CommitComment {
    public author!: Actor;
    public authorAssociation!: CommentAuthorAssociation;
    public body!: string;
    public commitId!: string;
    public createdAt!: Date;
    public createdViaEmail!: boolean;
    public databaseId!: number;
    public editor!: Actor;
    public id!: string;
    public includesCreatedEdit!: false;
    public lastEditAt!: Date;
    public path!: string;
    public position!: number;
    public publishedAt!: Date;
    public updatedAt!: Date;
    public url!: string;

    public constructor() {

    }

}

