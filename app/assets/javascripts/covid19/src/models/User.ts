import _ from "lodash";
import { D2Api, Id } from "../types/d2-api";

export interface UserData {
    id: Id;
    displayName: string;
    username: string;
    organisationUnits: OrganisationUnit[];
    userRoles: UserRole[];
}

interface UserRole {
    id: Id;
    name: string;
}

interface OrganisationUnit {
    id: string;
    path: string;
    level: number;
}

export class User {
    constructor(private data: UserData) {}

    getOrgUnits(): OrganisationUnit[] {
        return this.data.organisationUnits;
    }

    static async getCurrent(api: D2Api): Promise<User> {
        const currentUser = await api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: { id: true, path: true, level: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true },
                    },
                },
            })
            .getData();

        const data: UserData = {
            ..._.pick(currentUser, ["id", "displayName", "organisationUnits"]),
            ...currentUser.userCredentials,
        };

        return new User(data);
    }
}
