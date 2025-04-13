export interface Agroquimico{
id: string;
active_principle: string;
activePrinciple?:string;//se usa para enviar como parte del payload al backend
description: string;
companyId: string;
  category: "HERBICIDE" | "INSECTICIDE" | "FUNGICIDE"; 
  createdAt: string;
  updatedAt: string;
}