import { Unidad } from "../enum/Unidad";
import { Agroquimico } from "./Agroquimico";
import { Proveedor } from "./Proveedor";

export interface ProductoAgrochemical {
  agrochemical_id: string;
  agrochemical: Agroquimico;
  percentage: number;
  created_at: string;
}

export interface Producto {
  id: string; 
  name: string;
  unit: Unidad; // Backend expects "KG", "L", etc.
  amount: number; // BigDecimal mapped to number
  brand: string;
  created_at: string; // ZonedDateTime serialized as ISO string
  agrochemicals: ProductoAgrochemical[];
  providers?: Proveedor[]; // Optional
  // Legacy fields for backward compatibility
  agrochemical_id?: string;
  agrochemical?: Agroquimico;
}
