/*
 * RepositoryOwner
 * Represents a comment on an RepositoryOwner.
 * https://developer.github.com/v4/interface/repositoryowner/
 */
export class RepositoryOwner {
    public avatarUrl!: string;
    public id!: string;
    public login!: string;
    public repositoryId!: string;
    public resourcePath!: string;
    public url!: string;

    public constructor() {

    }
}