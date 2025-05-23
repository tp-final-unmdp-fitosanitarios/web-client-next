"use client";
import ApiService from "@/services/api-service";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/domain/models/User";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (updatedToken: string, userId: string) => void;
  logout: () => void;
  getApiService: () => ApiService;
  isReady: boolean; // Agregado para indicar si el contexto está listo
  getUserId: () => string | null;
  setUserId: (id: string) => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, set_UserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const logout = () => {
    console.log("Eliminando el token: ", token);
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
  
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  
    if (storedUserId) {
      set_UserId(storedUserId);
    }
  
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !userId) return;

    const fetchUser = async () => {
      try {
        const apiService = getApiService();
        const response = await apiService.get<User>(`/users/${userId}`);
        if (response.success) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [isReady, userId]);

  const login = (updatedToken: string, userId: string) => {
    localStorage.setItem("token", updatedToken);
    localStorage.setItem("userId", userId);
    setToken(updatedToken);
    setUserId(userId);
    setIsAuthenticated(true);
  };

  const getUserId = () => userId;
  const setUserId = (id: string) => {
    set_UserId(id);
  };
  
  const getApiService = () => new ApiService(token, logout);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, getApiService, isReady, getUserId, setUserId, user }}>
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