/*
 * ReleaseAsset
 * Represents a comment on an ReleaseAsset.
 * https://developer.github.com/v4/object/releaseasset/
 */
import { User } from '.';

export class ReleaseAsset {
    public contentType: string;
    public createdAt: Date;
    public downloadCount: number;
    public downloadUrl: string;
    public id: string;
    public name: string;
    public releaseId: string;
    public size: number;
    public updatedAt: Date;
    public uploadedBy: User;
    public url: string;
}