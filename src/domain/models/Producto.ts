import { Unidad } from "../enum/Unidad";

export interface Producto {
    id: number,
    nombre: string,
    unidad: Unidad,
    cantidad: number,
    marca: string;
}