/*
 * License
 * Represents a comment on an License.
 * https://developer.github.com/v4/object/license/
 */
import { LicenseRule } from '.';

export class License {
    public body!: string;
    public description!: string;
    public featured!: boolean;
    public hidden!: boolean;
    public id!: string;
    public implementation!: string;
    public key!: string;
    public name!: string;
    public nickname!: string;
    public spdxId!: string;
    public uri!: string;

    public conditions: LicenseRule[];
    public limitations: LicenseRule[];
    public permissions: LicenseRule[];

    public constructor() {
        this.conditions = [];
        this.limitations = [];
        this.permissions = [];
    }
}