import { openDB } from 'idb';

const DB_NAME = 'app-data';
const STORE_NAME = 'cache';
const DB_VERSION = 1;

// Abre o crea la base de datos
export const getDb = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const setItem = async <T>(key: string, data: T): Promise<void> => {
    const db = await getDb();
    await db.put(STORE_NAME, data, key);
  };
  
  export const getItem = async <T>(key: string): Promise<T | undefined> => {
    const db = await getDb();
    return db.get(STORE_NAME, key);
  };
// Borra una clave
export const removeItem = async (key: string) => {
  const db = await getDb();
  return db.delete(STORE_NAME, key);
};

// Limpia todo
export const clearAll = async () => {
  const db = await getDb();
  return db.clear(STORE_NAME);
};

// Lista todas las claves
export const listKeys = async () => {
  const db = await getDb();
  return db.getAllKeys(STORE_NAME);
};