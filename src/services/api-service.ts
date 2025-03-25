/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import useToken from "./tokenService";

// Interfaz para las opciones de la petición
interface ApiOptions {
  baseUrl?: string; 
  endpoint: string;
  id?: number | string;
  data?: any; 
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; 
  headers?: Record<string, string>; 
}

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data: T; 
  status: number; 
  success: boolean; 
  error?: string; 
}

//Obtengo el token
const { token } = useToken();

// Servicio genérico para manejar peticiones HTTP con Axios
class ApiService {
  private axiosInstance: AxiosInstance;
  private defaultBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/";

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.defaultBaseUrl,
      headers: { "Content-Type": "application/json" },
    });

    // Interceptor para manejar errores globalmente
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          return Promise.reject({
            status: error.response.status,
            error: error.response.data?.error || "Error en la petición",
          });
        } else if (error.request) {
          return Promise.reject({
            status: 0,
            error: "No se pudo conectar con el servidor",
          });
        }
        return Promise.reject({
          status: 0,
          error: "Error desconocido",
        });
      }
    );
  }

  // Método genérico para realizar peticiones HTTP
  private async request<T>(options: ApiOptions): Promise<ApiResponse<T>> {
    const { baseUrl = this.defaultBaseUrl, endpoint, id, data, method = "GET", headers } = options;
    const url = id ? `${endpoint}/${id}` : endpoint;

    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: { ...this.axiosInstance.defaults.headers.common, ...headers },
    };

    const instance = axios.create({ baseURL: baseUrl, headers: config.headers });

    try {
      const response = await instance(config);
      return { data: response.data, status: response.status, success: true };
    } catch (error: any) {
      return {
        data: null as any,
        status: error.status || 500,
        success: false,
        error: error.error || "Error en la petición",
      };
    }
  }

  // Métodos CRUD
  async create<T>(endpoint: string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: "POST", data, ...options });
  }

  async get<T>(endpoint: string, id?: number | string, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "GET", ...options });
  }

  async update<T>(endpoint: string, id: number | string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PUT", data, ...options });
  }

  async patch<T>(endpoint: string, id: number | string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PATCH", data, ...options });
  }

  async delete<T>(endpoint: string, id: number | string, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "DELETE", ...options });
  }

  // Métodos para autenticación
  setAuthToken() {
    this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }
}

// Exportamos la instancia única
export const apiService = new ApiService();