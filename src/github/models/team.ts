/*
 * Team
 * Represents a comment on an Team.
 * https://developer.github.com/v4/object/team/
 */
import { Repository, User } from '.';

export class Team {
    public avatarUrl: string;
    public combinedSlug: boolean;
    public createdAt: Date;
    public description: string;
    public id: string;
    public membersResourcePath: string;
    public membersUrl: string;
    public name: string;
    public organizationId: string;
    public parentTeam: Team;
    public privacy;
    public repositoriesResourcePath: string;
    public repositoriesUrl: string;
    public resourcePath: string;
    public slug: string;
    public teamsResourcePath: string;
    public teamsUrl: string;
    public updatedAt: Date;
    public url: string;

    public members: User[];
    public repositories: Repository[];

    public constructor() {
        this.members = [];
        this.repositories = [];
    }
}