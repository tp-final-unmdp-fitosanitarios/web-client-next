import { Unidad } from "../enum/Unidad";
import { Agorquimico } from "./Agroquimico";
import { Proveedor } from "./Proveedor";

export interface Producto {
    id: string;
    name: string;
    unit: Unidad;
    amount: number;
    brand: string;
    createdAt: Date;
    agrochemicalId: string;
    agrochemical: Agorquimico;
    providers: Proveedor[];
  }
