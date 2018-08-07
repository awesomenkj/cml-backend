/*
 * Tree
 * Represents a comment on an Tree.
 * https://developer.github.com/v4/object/tree/
 */
import { TreeEntry } from '.';

export class Tree {
    public abbreviatedOid: string;
    public commitResourcePath: string;
    public commitUrl: string;
    public id: string;
    public oid: string;
    public repositoryId: string;

    public entries: TreeEntry[];

    public constructor() {
        this.entries = [];
    }
}