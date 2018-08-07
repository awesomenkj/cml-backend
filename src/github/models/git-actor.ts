/*
 * GitActor
 * Represents an actor in a Git commit (ie. an author or committer).
 * https://developer.github.com/v4/object/gitactor/
 */
export class GitActor {
    public avatarUrl: string;
    public date: Date;
    public email: string;
    public name: string;
    public userId: string;

    public constructor() {

    }
}