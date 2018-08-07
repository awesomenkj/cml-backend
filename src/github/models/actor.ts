/*
 * Actor
 * Represents an object which can take actions on GitHub. Typically a User or Bot.
 * https://developer.github.com/v4/interface/actor/
 */
export class Actor {
    public avatarUrl: string;
    public login: string;
    public resourcePath: string;
    public url: string;

    public constructor() {

    }
}

export enum CommentAuthorAssociation {
    COLLABORATOR,
    CONTRIBUTOR,
    FIRST_TIMER,
    FIRST_TIME_CONTRIBUTOR,
    MEMBER,
    NONE,
    OWNER
}