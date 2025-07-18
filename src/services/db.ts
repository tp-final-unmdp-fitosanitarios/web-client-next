// src/services/db.ts
import Dexie, { Table } from 'dexie';

export interface Aplicacion {
  id: string;
  status: string;
  location_id: string;
  stock_location_id: string;
  created_at: string;
  unidad: string;
  cantidad: number;
  surface: number;
  applicator_id: string;
  engineer_id: string;
  application_date: string;
  applicator_name: string;
  engineer_name: string;
  type: string;
  synced?: boolean;
  lastUpdated?: Date;
  localOnly?: boolean;
}

export interface Producto {
  id: string;
  name: string;
  unit: string;
  amount: number;
  brand: string;
  created_at: string;
  agrochemical_id: string;
  synced?: boolean;
  lastUpdated?: Date;
}

export interface RecipeItem {
  product_id: string;
  amount: number;
  unit: string;
  dose_type: string;
  lot_number: string;
  name?: string;
}

export interface Recipe {
  id?: string;
  type: string;
  recipe_items: RecipeItem[];
  aplicacionId: string;
  synced?: boolean;
}

export interface Locacion {
  id: string;
  name: string;
  address: string;
  area: string;
  parent_location_id: string;
  type: string;
  created_at: string;
  lastUpdated?: Date;
}

export interface PendingRequest {
  id?: number;
  method: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  timestamp: Date;
}

export class AppDB extends Dexie {
  aplicaciones!: Table<Aplicacion, string>;
  productos!: Table<Producto, string>;
  recetas!: Table<Recipe, string>;
  locaciones!: Table<Locacion, string>;
  pendingRequests!: Table<PendingRequest, number>;

  constructor() {
    super('TesisAppDB');
    this.version(1).stores({
      aplicaciones: 'id, location_id, application_date, applicator_id',
      productos: 'id, name, agrochemical_id, brand',
      recetas: '++id, aplicacionId, type',
      locaciones: 'id, name, parent_location_id',
      pendingRequests: '++id, timestamp',
    });
  }
}

export const db = new AppDB();
