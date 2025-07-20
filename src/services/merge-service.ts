import { Aplicacion } from "@/domain/models/Aplicacion";
import { getOfflineAplicaciones, getOfflineRecipeByAplicacionId } from "./offline-service";

export async function mergeAplicacionesWithRecetas(): Promise<Aplicacion[]> {
  const aplicaciones = await getOfflineAplicaciones();

  const merged = await Promise.all(
    aplicaciones.map(async (app) => {
      const receta = await getOfflineRecipeByAplicacionId(app.id);
      return {
        ...app,
        recipe: receta ?? { type: 'SIN_TIPO', recipe_items: [] }
      };
    })
  );

  return merged;
}