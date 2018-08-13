/*
 * Milestone
 * Represents a comment on an Milestone.
 * https://developer.github.com/v4/object/milestone/
 */
import { Actor } from '.';

export class Milestone {
    public closed!: boolean;
    public closedAt!: Date;
    public createdAt!: Date;
    public creator!: Actor;
    public description!: string;
    public id!: string;
    public number!: number;
    public repositoryId!: string;
    public state!: MilestoneState;
    public title!: string;
    public updatedAt!: Date;
    public url!: string;

    public constructor() {

    }
}

export enum MilestoneState {
    CLOSED,
    OPEN
}