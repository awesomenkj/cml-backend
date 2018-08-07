/*
 * GitObject
 * Represents a Git object.
 * https://developer.github.com/v4/interface/gitobject/
 */
export class GitObject {
    public abbreviatedOid: string;
    public commitResourcePath: string;
    public commitUrl: string;
    public id: string;
    public oid: string;
    public repositoryId: string;

    public constructor() {

    }
}