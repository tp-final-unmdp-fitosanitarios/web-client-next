import { Roles } from "../enum/Roles"

export interface User {
    id: string,
    nombre: string,
    apellido: string,
    rol: Roles[] | string[],
    companyId: string,
    email: string
}

//Esto es un primer aproach