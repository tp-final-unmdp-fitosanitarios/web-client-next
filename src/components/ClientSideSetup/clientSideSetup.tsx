"use client";

import { useOfflineSync } from "@/hooks/useOfflineSyncs";
import { db } from "@/services/db";
import { downloadInitialData } from "@/services/offline-service";
import { useEffect } from "react";
import { useAuth } from "../Auth/AuthProvider";
export default function ClientSideSetup() {
     
  useOfflineSync();
const { user, token } = useAuth();


  // ✅ Inicializar IndexedDB y descargar datos si corresponde
  useEffect(() => {
    const init = async () => {
      try {
        await db.open(); // fuerza la apertura
        const apps = await db.aplicaciones.toArray();

        const isEmpty = apps.length === 0;
        const isTargetRole = user?.roles.includes("APPLICATOR") || user?.roles.includes("ENGINEER");

        if (navigator.onLine && isEmpty && token && isTargetRole) {
          console.log("[Offline] Descargando datos iniciales...");
          await downloadInitialData(token);
          console.log("[Offline] Datos descargados y guardados.");
        }
      } catch (err) {
        console.error("[IndexedDB] Error en inicialización:", err);
      }
    };

    init();
  }, [user, token]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
        .register("/serviceWorker.js")
          // .register("/serviceWorker.js")
      
          .then((reg) => console.log("Service Worker registrado:", reg))
          .catch((err) => console.error("Error registrando SW:", err));
      });
    }
  }, []);

  return null;
}