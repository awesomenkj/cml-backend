/*
 * DeploymentStatus
 * Describes the status of a given deployment attempt.
 * https://developer.github.com/v4/object/deploymentstatus/
 */
import { Actor } from '.';

export class DeploymentStatus {
    public createdAt!: Date;
    public creatot!: Actor;
    public deploymentId!: string;
    public description!: string;
    public environmentUrl!: string;
    public id!: string;
    public logUrl!: string;
    public state!: DeploymentStatusState;
    public updatedAt!: Date;

    public constructor() {

    }
}

export enum DeploymentStatusState {
    ERROR,
    FAILURE,
    INACTIVE,
    PENDING,
    SUCCESS
}