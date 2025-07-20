import { Aplicacion } from "@/domain/models/Aplicacion";
import { Locacion } from "@/domain/models/Locacion";
import { Producto } from "@/domain/models/Producto";
import { db, PendingRequest } from "./db";
import { Recipe } from "@/domain/models/Recipe";

// 🔹 Métodos de acceso offline
export async function getOfflineAplicaciones(): Promise<Aplicacion[]> {
  return await db.aplicaciones.toArray();
}

export async function getOfflineProductos(): Promise<Producto[]> {
  return await db.productos.toArray();
}

export async function getOfflineLocaciones(): Promise<Locacion[]> {
  return await db.locaciones.toArray();
}

export async function getOfflineRecipeByAplicacionId(aplicacionId: string): Promise<Recipe | undefined> {
  return await db.recetas.get({ aplicacionId });
}

// 🔹 Descarga inicial de datos y guardado en IndexedDB
export async function downloadInitialData(token: string) {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log("🔄 Iniciando descarga de data offline...");

    const [aplicacionesRes, productosRes, locacionesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`, { headers }),
    ]);

    console.log("📦 Respuestas:");
    console.log("Aplicaciones:", aplicacionesRes.status);
    console.log("Productos:", productosRes.status);
    console.log("Locaciones:", locacionesRes.status);

    if (!aplicacionesRes.ok || !productosRes.ok || !locacionesRes.ok) {
      throw new Error("❌ Una o más respuestas no fueron exitosas");
    }

    const aplicacionesJson = await aplicacionesRes.json();
    const productosJson = await productosRes.json();
    const locacionesJson = await locacionesRes.json();

    const aplicaciones: Aplicacion[] = aplicacionesJson.content ?? [];
    const productos: Producto[] = productosJson.content ?? productosJson; // fallback por si no es paginado
    const locaciones: Locacion[] = locacionesJson.content ?? locacionesJson;

    console.log("📥 Datos obtenidos. Guardando en IndexedDB...");
    console.log(`📌 Aplicaciones: ${aplicaciones.length}`);
    console.log(`📌 Productos: ${productos.length}`);
    console.log(`📌 Locaciones: ${locaciones.length}`);

    await db.transaction('rw', db.aplicaciones, db.productos, db.locaciones, db.recetas, async () => {
      await db.aplicaciones.clear();
      await db.productos.clear();
      await db.locaciones.clear();
      await db.recetas.clear();

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

      const recetasExtraidas = aplicaciones.map((a) => ({
        aplicacionId: a.id,
        type: a.recipe?.type || 'SIN_TIPO',
        recipe_items: a.recipe?.recipe_items || [],
        synced: true,
      }));

      await db.recetas.bulkAdd(recetasExtraidas);
    });

    console.log("✅ Datos guardados exitosamente.");
  } catch (err) {
    console.error("❌ Error al descargar o guardar data inicial offline:", err);
  }
}

// 🔹 Sincronización de requests pendientes
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
          console.log(`✅ Request sincronizado con éxito: ${request.url}`);
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
