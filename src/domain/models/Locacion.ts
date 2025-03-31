import { TipoLocacion } from "../enum/TipoLocacion";

export interface Locacion {
    id: number,
    name: string
    addres: string,
    area: string,
    type: TipoLocacion,
    company_id: number  
}