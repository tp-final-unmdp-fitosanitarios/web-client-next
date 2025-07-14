"use client";

import { useEffect } from "react";

export default function ClientSideSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("../../../public/serviceWorker")
          .then((reg) => console.log("Service Worker registrado:", reg))
          .catch((err) => console.error("Error registrando SW:", err));
      });
    }
  }, []);

  return null;
}