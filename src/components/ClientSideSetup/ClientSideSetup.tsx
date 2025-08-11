"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import ApiService from "@/services/api-service";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { useWarmupAlertStore } from "@/contexts/warmupAlertStore";

const WARMUP_DONE_KEY = "warmup_aplicaciones_done_v2"; // nuevo key, cubre finalizar+iniciar

export default function ClientSideSetup() {
  const { user, token, getApiService } = useAuth();
  const { show, hide } = useWarmupAlertStore();

  useEffect(() => {
    if (
      user?.roles.includes("APPLICATOR") &&
      token &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem(WARMUP_DONE_KEY)
    ) {
      show("Cargando datos para modo offline...");
      const apiService = getApiService ? getApiService() : new ApiService(token, () => {});

      const warmupFor = async (status: string, routeBase: string) => {
        const params = new URLSearchParams();
        params.append("status", status); // "IN_PROGRESS" o "PENDING"
        params.append("page", "0");
        params.append("size", "10");

        const resp = await apiService.get<ResponseItems<Aplicacion>>(
          `/applications?${params.toString()}`
        );

        if (resp.success && Array.isArray(resp.data?.content)) {
          resp.data.content.forEach((app) => {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = `${routeBase}${app.id}`;
            document.body.appendChild(iframe);
            setTimeout(() => document.body.removeChild(iframe), 3000);
          });
        }
      };

      (async () => {
        try {
          // 1) Finalizar (en curso)
          await warmupFor("IN_PROGRESS", "/aplicaciones/finalizar?id=");
          // 2) Iniciar (pendientes)
          await warmupFor("PENDING", "/aplicaciones/iniciar?id=");
        } finally {
          sessionStorage.setItem(WARMUP_DONE_KEY, "true");
          setTimeout(hide, 3500);
        }
      })();
    }
  }, [user, token, getApiService, show, hide]);
  
  return null;
}
