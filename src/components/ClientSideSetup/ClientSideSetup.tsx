"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import ApiService from "@/services/api-service";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { useWarmupAlertStore } from "@/contexts/warmupAlertStore";

const WARMUP_DONE_KEY = "warmup_finalizar_done_v1";

export default function ClientSideSetup() {
  const { user, token, getApiService } = useAuth();
  const { show, hide } = useWarmupAlertStore();

  useEffect(() => {
    // Solo ejecutá si NO se hizo aún en la sesión
    if (
      user?.roles.includes("APPLICATOR") &&
      token &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem(WARMUP_DONE_KEY)
    ) {
      show("Cargando datos para modo offline...");
      const apiService = getApiService ? getApiService() : new ApiService(token, () => {});
      const queryParams = new URLSearchParams();
      queryParams.append('status', "IN_PROGRESS");
      queryParams.append('page', "0");
      queryParams.append('size', "20");
      apiService.get<ResponseItems<Aplicacion>>(`applications?${queryParams.toString()}`).then(response => {
        if (response.success && Array.isArray(response.data?.content)) {
          response.data.content.forEach(app => {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = `/aplicaciones/finalizar?id=${app.id}`;
            document.body.appendChild(iframe);
            setTimeout(() => document.body.removeChild(iframe), 3000);
          });
        }
        // Marcá el warmup como hecho
        sessionStorage.setItem(WARMUP_DONE_KEY, "true");
        setTimeout(hide, 3500); // Oculta el mensaje después de 3.5 segundos (opcional)
      });
    }
  }, [user, token, getApiService, show, hide]);

  return null;
}
