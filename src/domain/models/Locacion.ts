import { TipoLocacion } from "../enum/TipoLocacion";

export interface Locacion {
    id: number,
    direccion: string,
    superficie: string,
    tipo: TipoLocacion  
}