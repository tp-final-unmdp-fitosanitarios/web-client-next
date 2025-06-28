import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Locacion } from "./Locacion";
import { Producto } from "./Producto";
import { Unidad } from "../enum/Unidad";
import { Recipe } from "./Recipe";

export interface Aplicacion {
    id: string;
    status: EstadoAplicacion;
    location_id: string;
    stock_location_id: string;
    created_at: Date;
    unidad: Unidad;
    cantidad: number;
    surface: number;
    applicator_id: string;
    engineer_id: string;
    recipe: Recipe;
    actual_application: Aplicacion;
    type: string;
    location: Locacion;
    application_date: Date;
    applicator_name: string;
    engineer_name: string;
}