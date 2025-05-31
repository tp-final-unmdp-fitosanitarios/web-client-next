import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Unidad } from "../enum/Unidad";

export interface Aplicacion {
    id: string;
    estado: EstadoAplicacion;
    locacionId: string;
    fecha: Date;
    productId: string;
    unidad: Unidad;
    cantidad: number;
    superficie: number;
    aplicadorId: string;
    ingenieroId: string;
}