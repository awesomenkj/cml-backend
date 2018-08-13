/*
 * Status
 * Represents a comment on an Status.
 * https://developer.github.com/v4/object/status/
 */
import { StatusContext, StatusState } from '.';

export class Status {
    public commitId!: string;
    public id!: string;
    public state!: StatusState;
    public contexts!: StatusContext;
}