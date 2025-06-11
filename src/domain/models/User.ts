import { Roles } from "../enum/Roles"

export interface User {
    id: string,
    first_name: string,
    last_name: string,
    roles: string[],
    company_id: string,
    email: string
}

