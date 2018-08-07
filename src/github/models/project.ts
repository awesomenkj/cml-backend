/*
 * Project
 * Represents a comment on an Project.
 * https://developer.github.com/v4/object/project/
 */
export class Project {
    public body: string;
    public closed: boolean;
    public closedAt: Date;
    public createdAt: Date;
    public databaseId: number;
    public id: string;
    public name: string;
    public number: number;
    public owner: string;
    public resourcePath: string;
    public state: ProjectState;
    public updatedAt: Date;
    public url: string;

    public constructor() {

    }
}

export enum ProjectState {
    CLOSED,
    OPEN
}