import { Unidad } from "../enum/Unidad";

export interface Producto {
    id: number,
    name: string,
    unit: Unidad | string,
    quantity: number,
    brand: string,
    description: string;
}