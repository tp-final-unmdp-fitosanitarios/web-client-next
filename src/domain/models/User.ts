import { Roles } from "../enum/Roles"

export interface User {
    id: string,
    firstName: string,
    lastName: string,
    roles: Roles[] | string[],
    companyId: string,
    email: string
}

