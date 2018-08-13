import { GitPoolRequestDataEntry } from '.';

/*
 * GitPoolRequest
 * Represents a Pool request for a git ressource.
 */
export class GitPoolRequest {

    public resource!: GitResource;
    public type!: GitRequestType;
    public status!: GitResponseStatus;
    public createdAt;
    public updatedAt;
    public data: GitPoolRequestDataEntry[] = [];
    public trial: number = 0;
    public parent: string = 'none';
    public priority;
}

export enum GitResource {
    ORGANIZATION,
    ORGANIZATION_REPOSITORIES,
    ORGANIZATION_MEMBERS,
    REPOSITORY,
    REPOSITORY_USERS,
    REPOSITORY_DEPLOY_KEYS,
    REPOSITORY_DEPLOYMENTS,
    REPOSITORY_FORKS,
    REPOSITORY_ISSUES,
    REPOSITORY_PROJECTS,
    REPOSITORY_MILESTONES,
    REPOSITORY_PULL_REQUESTS,
    REPOSITORY_RELEASES,
    USER
}

export enum GitRequestType {
    INIT,
    UPDATE,
    OFFSET
}

export enum GitResponseStatus {
    NEW,
    PENDING,
    REQUESTED,
    FAILED,
    SUCCESS
}
