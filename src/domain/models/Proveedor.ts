export interface Proveedor {
  id: string;
  name: string;
  description: string;
  company_id: string;
  products?: string[]; 
}
