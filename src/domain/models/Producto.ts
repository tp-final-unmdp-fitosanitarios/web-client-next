import { Unidad } from "../enum/Unidad";

export interface Producto {
    id: number,
    name: string,
    unit: Unidad | string,
    amount: number,
    brand: string,
    description: string;
}