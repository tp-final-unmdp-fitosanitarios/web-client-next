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
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.put(data, key);
  await tx.done; // Garantiza que la transacción se haya comprometido
};
  
export const getItem = async <T>(key: string): Promise<T | undefined> => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const value = await tx.store.get(key);
  await tx.done;
  return value as T | undefined;
};
// Borra una clave
export const removeItem = async (key: string) => {
  console.log("removing: "+key);
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.delete(key);
  await tx.done;
};

// Limpia todo
export const clearAll = async () => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
};

// Lista todas las claves
export const listKeys = async () => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const keys = await tx.store.getAllKeys();
  await tx.done;
  return keys;
};