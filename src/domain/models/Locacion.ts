export interface Locacion {
    id: string;
    name: string;
    address: string;
    area: string;
    parent_location: string;
    parent_location_id: string;
    type: "ZONE";
    created_at: Date; 
  }
  
