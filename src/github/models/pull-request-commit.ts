/*
 * PullRequestCommit
 * Represents a comment on an PullRequestCommit.
 * https://developer.github.com/v4/object/pullrequestcommit/
 */
export class PullRequestCommit {
    public commitId: string;
    public id: string;
    public pullRequestId: string;
    public resourcePath: string;
    public url: string;

    public constructor() {

    }
}