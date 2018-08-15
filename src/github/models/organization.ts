/*
 * Organization
 * Represents a comment on an Organization.
 * https://developer.github.com/v4/object/organization/
 */
import { Team, User } from '.';
import { Repository } from './repository';
import { Project } from './project';

export class Organization {
    public avatarUrl!: string;
    public databaseId!: number;
    public description!: string;
    public id!: string;
    public location!: string;
    public login!: string;
    public name!: string;
    public projectsResourcePath!: string;
    public projectsUrl!: string;
    public resourcePath!: string;
    public teamsResourcePath!: string;
    public teamsUrl!: string;
    public url!: string;
    public websiteUrl!: string;

    public membersCount!: number;
    public repositoriesCount!: number;
    public pinnedReposCount!: number;
    public projectsCount!: number;
    public teamsCount!: number;

    public members: User[];
    public repositories: Repository[];
    public pinnedRepos: Repository[];
    public projects: Project[];
    public teams: Team[];

    public constructor() {
        this.members = [];
        this.repositories = [];
        this.pinnedRepos = [];
        this.projects = [];
        this.teams = [];
    }
}