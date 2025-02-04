import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Unidad } from "../enum/Unidad";

export interface Aplicacion {
    id: number,
    campo: Locacion,
    producto: Producto,
    unidad: Unidad | string,
    cantidad: number,
    estado: EstadoAplicacion,
    fecha: Date
}