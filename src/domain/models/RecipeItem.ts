import { Unidad } from "../enum/Unidad";

export interface RecipeItem {
    productId: string;
    amount: number;
    unit: Unidad;
    doseType: string;
} 