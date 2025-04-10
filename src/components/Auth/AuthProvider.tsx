"use client";
import ApiService from "@/services/api-service";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (updatedToken: string) => void;
  logout: () => void;
  getApiService: () => ApiService;
  isReady: boolean; // Agregado para indicar si el contexto está listo
  getUserId: () => string | null;
  setUserId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, set_UserId] = useState<string | null>(null);
  const router = useRouter(); // Hook para redirigir después del login
  let apiService: ApiService;
  const [isReady, setIsReady] = useState(false);

  const logout = () => {
    console.log("Eliminando el token: ", token);
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    apiService = new ApiService(null, logout);
    router.push("/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsReady(true);
  }, []);

  const getApiService = () => new ApiService(token, logout);

  const login = (updatedToken: string) => {
    localStorage.setItem("token", updatedToken);
    setToken(updatedToken);
    setIsAuthenticated(true);
  };

  const getUserId = () => userId;
  const setUserId = (id: string) => set_UserId(id);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, getApiService, isReady, getUserId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};