/*
 * Commit
 * Represents a Git commit.
 * https://developer.github.com/v4/object/commit/
 */
import { CommitComment, GitActor, Status } from '.';

export class Commit {

    public abbreviatedOid: string;
    public additions: string;
    public author: GitActor;
    public authoredByCommitter: boolean;
    public authoredDate: Date;
    public changerFiles: number;
    public commitResourcePath: string;
    public commitUrl: string;
    public committedDate: Date;
    public committedViaWeb: boolean;
    public committer: GitActor;
    public deletion: number;
    public id: string;
    public message: string;
    public messageBody: string;
    public messageBodyHTML: string;
    public messageHeadline: string;
    public messageHeadlineHTML: string;
    public oid: string;
    public pushedDate: Date;
    public repositoryId: string;
    public resourcePath: string;
    public signature: string;
    public status: Status;
    public treeUrl: string;
    public url: string;

    public comments: CommitComment[];

    public constructor() {
        this.comments = [];
    }
}