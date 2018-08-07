/*
 * MilestoneEvent
 * Represents a comment on an MilestoneEvent.
 * https://developer.github.com/v4/object/milestonedevent/
 */
import { Actor } from '.';

export class MilestoneEvent {
    public actor: Actor;
    public createdAt: Date;
    public id: string;
    public milestoneTitle: string;

    public constructor() {

    }
}