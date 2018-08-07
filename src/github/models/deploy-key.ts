/*
 * DeployKey
 * A repository deploy key.
 * https://developer.github.com/v4/object/deploykey/
 */
export class DeployKey {
    public createdAt: Date;
    public id: string;
    public key: string;
    public readOnly: boolean;
    public title: string;
    public verified: boolean;

    public constructor() {

    }
}