/*"use client"; // Asegúrate de que esto esté presente
import { useState, useEffect } from "react";

export default function useToken() {
  const [token, setToken] = useState<string | null>(null); // Inicializamos como null

  // Cargar el token desde localStorage solo en el cliente
  useEffect(() => {
    const tokenString = localStorage.getItem("token");
    const userToken = tokenString ? tokenString : "";
    setToken(userToken);
  }, []);

  const saveToken = (userToken: string) => {
    if (typeof window !== "undefined") { // Proteger escritura en localStorage
      localStorage.setItem("token", userToken);
    }
    setToken(userToken);
  };

  const removeToken = () => {
    if (typeof window !== "undefined") { // Proteger eliminación en localStorage
      localStorage.removeItem("token");
    }
    setToken(null);
  };

  return {
    setToken: saveToken,
    removeToken,
    token,
  };
}*/