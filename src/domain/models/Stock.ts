import { Unidad } from "../enum/Unidad";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Proveedor } from "./Proveedor";

export interface Stock {
    id: string,
    provider: Proveedor,
    location: Locacion, 
    producto: Producto,
    amount: number,
    unit: Unidad,
    lotNumber: string,
    expirationDate: Date 
}