import { setItem } from "./indexedDB";
import ApiService from "@/services/api-service";

export const preloadDataAfterLogin = async (apiService: ApiService) => {
  try {
    const endpoints = [
      "/users",
      "/providers",
      "/machines",
      "/locations",
      "/stock/summary?page=0&size=10",
      "/locations?type=WAREHOUSE&type=FIELD",
      "locations?type=CROP",
      "/products?size=100",
      "/applications?status=PENDING&page=0&size=10",
      "/applications?status=IN_PROGRESS&page=0&size=10",
      "/applications?status=FINISHED&page=0&size=10",
      "/products?size=100",
      "/locations/crop-dashboard",
      "/products?page=0&size=10",
      "/agrochemicals?page=0&size=10"
    ];

    await Promise.all(
      endpoints.map(async (endpoint) => {
        const response = await apiService.get(endpoint);
        if (response.success) {
          await setItem(endpoint, response.data);
          console.log(`[CACHE] ${endpoint} cacheado en IndexedDB`);
        }
      })
    );
  } catch (error) {
    console.error("[CACHE] Error al precargar datos:", error);
  }
};