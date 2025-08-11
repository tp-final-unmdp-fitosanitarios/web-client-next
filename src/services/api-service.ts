/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { getItem, setItem } from "@/utilities/indexedDB";

interface ApiOptions {
  baseUrl?: string;
  endpoint: string;
  id?: number | string;
  data?: any;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private defaultBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/";
  private token: string | null = null;
  private logout: () => void;
  private connection = navigator.onLine? true : false;

  constructor(token: string | null, logout: () => void) {
    this.logout = logout;
    this.axiosInstance = axios.create({
      baseURL: this.defaultBaseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log("Error response:", error.response);
        if (error.response?.status === 401) {
          console.log("Fallo de autorizacion");
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (!config.headers) {
          config.headers = {} as AxiosRequestHeaders;
        }
        if (this.token) {
          (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private async request<T>(options: ApiOptions): Promise<ApiResponse<T>> {
    const { baseUrl = this.defaultBaseUrl, endpoint, id, data, method, headers } = options;
    const path = id ? `${endpoint}/${id}` : endpoint;
    const url = new URL(path, baseUrl);
  
    const config: AxiosRequestConfig = {
      method,
      url: url.toString(),
      data,
      headers: { ...this.axiosInstance.defaults.headers.common, ...headers },
      baseURL: undefined,
    };
  
    // Solo GET tiene cache
    const cacheKey = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
    try {
      if (method !== "GET") {
        // Para POST, PUT, PATCH, DELETE no cacheamos ni fallback
        const response = await this.axiosInstance(config);
        return { data: response.data, status: response.status, success: true };
      }
  
      // Para GET intentamos primero la llamada a API
      if (!this.connection) {
        // Si no hay conexión, fallback inmediato a cache
        console.log("buscando resp offline");
        const cachedData = await getItem<T>(cacheKey);
        if (cachedData) {
          console.warn(`[CACHE] Respuesta offline desde cache para ${url.toString()}`);
          return { data: cachedData, status: 200, success: true };
        } else {
          return { data: null as T, status: 503, success: false, error: "Connection error and no cache" };
        }
      }
  
      // Hay conexión, intentamos llamar a la API
      const response = await this.axiosInstance(config);
  
      // Guardamos en cache la respuesta
      if (response?.data) {
        await setItem<T>(cacheKey, response.data);
      }
  
      return { data: response.data, status: response.status, success: true };
  
    } catch (error: any) {
      // Si hay error en la llamada a API (ej timeout, server down), fallback a cache si es GET
      if (method === "GET") {
        const cachedData = await getItem<T>(cacheKey);
        if (cachedData) {
          console.warn(`[CACHE] Fallback offline desde cache tras error para ${url.toString()}`);
          return { data: cachedData, status: 200, success: true };
        }
      }
  
      // Manejo errores 401, 403, 500
      if (error.response?.status === 401) {
        console.log("Fallo de autorizacion");
        this.logout();
      }
      if (error.response?.status === 403) {
        console.log("Acceso denegado");
      }
      if (error.response?.status === 500) {
        console.error("API Error:", error.response || error);
      }
  
      return {
        data: null as T,
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.message || error.message || "Error en la petición",
      };
    }
  }
  
  async create<T>(endpoint: string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: "POST", data, ...options });
  }

  async get<T>(endpoint: string, id?: number | string, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "GET", ...options });
  }

  async update<T>(
    endpoint: string,
    id: number | string,
    data: any,
    options: Partial<ApiOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PUT", data, ...options });
  }

  async updateDirect<T>(
    endpoint: string,
    data: any,
    options: Partial<ApiOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: "PUT", data, ...options });
  }

  async patch<T>(
    endpoint: string,
    id: number | string,
    data: any,
    options: Partial<ApiOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PATCH", data, ...options });
  }

  async delete<T>(endpoint: string, id: number | string, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "DELETE", ...options });
  }
}

export default ApiService;
