import { Roles } from "../enum/Roles"

export interface User {
    id: number,
    nombre: string,
    rol: Roles | string
}

//Esto es un primer aproach