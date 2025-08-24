'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return; // Espera que AuthProvider termine de inicializar
    router.replace("/login");
    /*if (isAuthenticated) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }*/
  }, [isAuthenticated, isReady]);

  return null; // no mostramos nada mientras redirige
}
