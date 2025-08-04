// pollForUpdatedList.ts
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Aplicacion } from "@/domain/models/Aplicacion";
import ApiService from "@/services/api-service";

export async function pollForUpdatedList(
  apiService: ApiService,
  key: string,
  newAppId: string,
  maxRetries = 6,
  interval = 700
): Promise<ResponseItems<Aplicacion> | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const resp = await apiService.get<ResponseItems<Aplicacion>>(key);
      if (
        resp.success &&
        Array.isArray(resp.data?.content) &&
        resp.data.content.some((app) => app.id === newAppId)
      ) {
        // Encontró la app nueva
        console.log(`[pollForUpdatedList] Success on try ${i + 1}`);
        return resp.data;
      } else {
        console.log(`[pollForUpdatedList] Try ${i + 1}: app not found yet`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(`[pollForUpdatedList] Error on try ${i + 1}:`, e.message);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  console.warn("[pollForUpdatedList] No se encontró la app nueva tras los reintentos");
  return null;
}
