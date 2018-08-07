/*
 * Deployment
 * Represents triggered deployment instance.
 * https://developer.github.com/v4/object/deployment/
 */
import { Actor, DeploymentStatus } from '.';

export class Deployment {
    public commitId: string;
    public createdAt: Date;
    public creator: Actor;
    public databaseId: number;
    public environment: string;
    public id: string;
    public latestStatus: DeploymentStatus;
    public payload: string;
    public repositoryId: string;
    public state: DeploymentState;

    public statuses: DeploymentStatus[];

    public constructor() {
        this.statuses = [];
    }
}

export enum DeploymentState {
    ABANDONED,
    ACTIVE,
    DESTROYED,
    ERROR,
    FAILURE,
    INACTIVE,
    PENDING
}