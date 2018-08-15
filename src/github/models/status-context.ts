/*
 * StatusContext
 * Represents a comment on an StatusContext.
 * https://developer.github.com/v4/object/statuscontext/
 */
import { Actor } from '.';

export class StatusContext {
    public commitId!: string;
    public context!: string;
    public createdAt!: Date;
    public creator!: Actor;
    public description!: string;
    public id!: string;
    public state!: StatusState;
    public targetUrl!: string;
}

export enum StatusState {
    ERROR,
    EXPECTED,
    FAILURE,
    PENDING,
    SUCCESS
}