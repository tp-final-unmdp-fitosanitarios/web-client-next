
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";

interface Productos {
    producto: Producto,cantidad: number
}

export interface Remito {
    id: number,
    campo: Locacion,
    productos: Productos [],
    archivo: string,
    fecha: Date

}