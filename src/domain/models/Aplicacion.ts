import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Unidad } from "../enum/Unidad";

export interface Aplicacion {
    id: string;
    estado: EstadoAplicacion;
    cultivo: Locacion;
    fecha: Date;
    producto: Producto;
    unidad: Unidad;
    cantidad: number;
    superficie: number;
    aplicadorId: string;
    ingenieroId: string;
}