/*
 * RepositoryTopic
 * Represents a comment on an RepositoryTopic.
 * https://developer.github.com/v4/object/repositorytopic/
 */
export class RepositoryTopic {
    public id!: string;
    public resourcePath!: string;
    public topic!: string;
    public url!: string;

    public constructor() {

    }
}