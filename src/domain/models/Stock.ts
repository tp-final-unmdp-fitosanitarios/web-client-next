import { Locacion } from "./Locacion";
import { Producto } from "./Producto";

export interface Stock {
    id: number,
    ultima_modificacion: Date,
    campo: Locacion,
    producto: Producto,
    cantidad: number 
    
}