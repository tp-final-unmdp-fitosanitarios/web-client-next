import { Producto } from "./Producto";

export interface Proveedor {
  id: string;
  name: string;
  description: string;
  company_id: string;
  products?: Producto[]; 
}
