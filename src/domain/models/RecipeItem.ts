import { Unidad } from "../enum/Unidad";

export interface RecipeItem {
    product_id: string;
    amount: number;
    unit: Unidad;
    dose_type: string;
    lot_number: string;
} 