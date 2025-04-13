import { Unidad } from "../enum/Unidad";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Proveedor } from "./Proveedor";

export interface Stock {
    id: string,
    provider: Proveedor,
    location: Locacion, 
    product: Producto,
    amount: number,
    unit: Unidad,
    lot_number: string,
    expiration_date: Date 
}