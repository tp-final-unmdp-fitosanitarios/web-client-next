export interface Agroquimico{
id: string;
active_principle: string;
description: string;
company_id: string;
  category: "HERBICIDE" | "INSECTICIDE" | "FUNGICIDE"; 
  created_at: string;
  updated_at: string;
}