"use client";
import ApiService from "@/services/api-service";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/domain/models/User";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (updatedToken: string, userId: string, userData?: User) => void;
  logout: () => void;
  getApiService: () => ApiService;
  isReady: boolean; // Agregado para indicar si el contexto está listo
  getUserId: () => string | null;
  setUserId: (id: string) => void;
  user: User | null;
  isLoadingUser: boolean; // Nuevo estado para indicar si se está cargando el usuario
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
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const logout = () => {
    console.log("Eliminando el token: ", token);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    set_UserId(null);
    setIsLoadingUser(false);
    router.push("/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserData = localStorage.getItem("userData");
  
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  
    if (storedUserId) {
      set_UserId(storedUserId);
    }

    // Intentar restaurar los datos del usuario desde localStorage
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem("userData");
      }
    }
  
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Solo hacer fetch si tenemos userId pero no tenemos user
    if (!isReady || !userId || user) return;

    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const apiService = getApiService();
        const response = await apiService.get<User>(`/users/${userId}`);
        if (response.success) {
          setUser(response.data);
          // Guardar en localStorage para persistencia
          localStorage.setItem("userData", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        // Si falla el fetch, limpiar el estado
        logout();
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [isReady, userId]); // Removí 'user' de las dependencias para evitar loops

  const login = (updatedToken: string, userId: string, userData?: User) => {
    console.log("Login called with:", { updatedToken, userId, userData });
    
    localStorage.setItem("token", updatedToken);
    localStorage.setItem("userId", userId);
    
    setToken(updatedToken);
    setUserId(userId);
    setIsAuthenticated(true);
    
    if (userData) {
      console.log("Setting user data:", userData);
      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  };

  const getUserId = () => userId;
  const setUserId = (id: string) => {
    set_UserId(id);
  };
  
  const getApiService = () => new ApiService(token, logout);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      login, 
      logout, 
      getApiService, 
      isReady, 
      getUserId, 
      setUserId, 
      user,
      isLoadingUser 
    }}>
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