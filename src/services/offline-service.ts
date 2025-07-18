import { db, Aplicacion, Producto, Locacion, PendingRequest } from './db';


export async function getOfflineAplicaciones(): Promise<Aplicacion[]> {
  return await db.aplicaciones.toArray();
}


export async function getOfflineProductos(): Promise<Producto[]> {
  return await db.productos.toArray();
}

export async function getOfflineLocaciones(): Promise<Locacion[]> {
  return await db.locaciones.toArray();
}


export async function downloadInitialData(token: string) {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const [aplicacionesRes, productosRes, locacionesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/aplicaciones`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/locaciones`, { headers }),
    ]);

    const aplicaciones: Aplicacion[] = await aplicacionesRes.json();
    const productos: Producto[] = await productosRes.json();
    const locaciones: Locacion[] = await locacionesRes.json();

    await db.transaction('rw', db.aplicaciones, db.productos, db.locaciones, async () => {
      await db.aplicaciones.clear();
      await db.productos.clear();
      await db.locaciones.clear();

      await db.aplicaciones.bulkAdd(
        aplicaciones.map((a) => ({
          ...a,
          synced: true,
          lastUpdated: new Date(),
          localOnly: false,
        }))
      );

      await db.productos.bulkAdd(
        productos.map((p) => ({
          ...p,
          lastUpdated: new Date(),
        }))
      );

      await db.locaciones.bulkAdd(
        locaciones.map((l) => ({
          ...l,
          lastUpdated: new Date(),
        }))
      );
    });
  } catch (err) {
    console.error("❌ Error al descargar o guardar data inicial offline:", err);
  }
}

export async function syncPendingRequests(token: string) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const pendings: PendingRequest[] = await db.pendingRequests.toArray();

    for (const request of pendings) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${request.url}`, {
          method: request.method,
          headers,
          body: JSON.stringify(request.body),
        });

        if (response.ok) {
          await db.pendingRequests.delete(request.id!);
        } else {
          console.warn(`⚠️ Error al sincronizar ${request.url}: ${response.status}`);
        }
      } catch (err) {
        console.error(`❌ Falló el fetch para ${request.url}`, err);
      }
    }
  } catch (err) {
    console.error("❌ Error al sincronizar requests pendientes:", err);
  }


  
}
