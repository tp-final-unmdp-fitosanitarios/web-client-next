import { Locacion } from "./Locacion";
import { Producto } from "./Producto";

export interface Aplicacion {
    id: number,
    campo: Locacion,
    producto: Producto,
    estado: string,
    fecha: Date

}