/*
 * Release
 * Represents a comment on an Release.
 * https://developer.github.com/v4/object/release/
 */
import { ReleaseAsset, User } from '.';

export class Release {
    public author: User;
    public createdAt: Date;
    public description: string;
    public id: string;
    public isDraft: boolean;
    public isPrerelease: boolean;
    public name: string;
    public publishedAt: Date;
    public resourcePath: string;
    public updatedAt: Date;
    public url: string;

    public releaseAssets: ReleaseAsset[];

    public constructor() {
        this.releaseAssets = [];
    }
}