import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Unidad } from "../enum/Unidad";

export interface Aplicacion {
    id: string;
    status: EstadoAplicacion;
    location_id: string;
    created_at: Date;
    unidad: Unidad;
    cantidad: number;
    surface: number;
    aplicadorId: string;
    engineer_id: string;
    recipe: any;
    actual_application: any;
}