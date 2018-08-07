/*
 * TreeEntry
 * Represents a comment on an TreeEntry.
 * https://developer.github.com/v4/object/treeentry/
 */
import { GitObject } from '.';

export class TreeEntry {
    public node: number;
    public name: string;
    public object: GitObject;
    public oif: string;
    public repositoryId: string;
    public type: string;
}