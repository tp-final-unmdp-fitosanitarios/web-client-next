import Dexie, { Table } from 'dexie';
import { Aplicacion } from '@/domain/models/Aplicacion';
import { Producto } from '@/domain/models/Producto';
import { Recipe } from '@/domain/models/Recipe';
import { Locacion } from '@/domain/models/Locacion';

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
      recetas: 'aplicacionId, type',
      locaciones: 'id, name, parent_location_id',
      pendingRequests: '++id, timestamp',
    });
  }
}

export const db = new AppDB();
