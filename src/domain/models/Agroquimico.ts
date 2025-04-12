export interface Agroquimico{
id: string;
activePrinciple: string;
description: string;
companyId: string;
  category: "HERBICIDE" | "INSECTICIDE" | "FUNGICIDE"; 
  createdAt: string;
  updatedAt: string;
}