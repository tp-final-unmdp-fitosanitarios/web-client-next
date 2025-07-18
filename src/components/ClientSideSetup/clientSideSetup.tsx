"use client";

import { useOfflineSync } from "@/hooks/useOfflineSyncs";
import { useEffect } from "react";

export default function ClientSideSetup() {
     
  useOfflineSync();

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