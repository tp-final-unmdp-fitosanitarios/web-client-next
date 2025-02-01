import { Unidad } from "../enum/Unidad";

export interface Producto {
    id: number,
    nombre: string,
    unidad: Unidad | string,
    cantidad: number,
    marca: string,
    descripcion: string;
}