import { EstadoAplicacion } from "../enum/EstadoAplicacion";
import { Recipe } from "./Recipe";

export interface AplicacionResponse {
    id: string;
    companyId: string;
    locationId: string;
    status: EstadoAplicacion;
    createdAt: Date;
    updatedAt: Date;
    externalId: string;
    surface: number;
    type: string;
    applicatorId: string;
    engineerId: string;
    recipe: Recipe;
    actualApplication: Recipe;
} 