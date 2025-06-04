export interface Locacion {
    id: string;
    name: string;
    address: string;
    area: string;
    parent_location: Locacion;
    parent_location_id: string;
    type: string;
    created_at: Date; 
  }
  
