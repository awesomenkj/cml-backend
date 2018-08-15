/*
 * Ref
 * Represents a comment on an Ref.
 * https://developer.github.com/v4/object/ref/
 */
import { GitObject, PullRequest } from '.';

export class Ref {
    public id!: string;
    public name!: string;
    public prefix!: string;
    public repositoryId!: string;
    public target!: GitObject;

    public associatedPullRequests: PullRequest[];

    public constructor() {
        this.associatedPullRequests = [];
    }
}