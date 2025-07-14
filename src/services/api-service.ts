/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { openDB } from "idb";

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

interface PendingRequest {
  id?: number;
  options: ApiOptions;
  timestamp: number;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private defaultBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/";
  private token: string | null = null;
  private logout: () => void;

  constructor(token: string | null, logout: () => void) {
    this.logout = logout;
    this.token = token;

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
        if (error.response?.status === 401) {
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

  /**
   * Inicializa o abre IndexedDB para almacenar peticiones pendientes
   */
  private async getDB() {
    return await openDB("api-offline-db", 1, {
      upgrade(db) {
        db.createObjectStore("pending", { keyPath: "id", autoIncrement: true });
      },
    });
  }

  /**
   * Agrega una petición a la cola offline
   */
  private async queueRequest(options: ApiOptions) {
    const db = await this.getDB();
    const req: PendingRequest = {
      options,
      timestamp: Date.now(),
    };
    await db.add("pending", req);
  }

  /**
   * Método central de request
   */
  private async request<T>(options: ApiOptions): Promise<ApiResponse<T>> {
    const { baseUrl = this.defaultBaseUrl, endpoint, id, data, method, headers } = options;
    const url = id ? `${endpoint}/${id}` : endpoint;

    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: { ...this.axiosInstance.defaults.headers.common, ...headers },
      baseURL: baseUrl,
    };

    if (!navigator.onLine) {
      console.warn("Sin conexión, guardando en cola offline:", options);
      await this.queueRequest(options);
      return {
        data: null as any,
        status: 503,
        success: false,
        error: "Sin conexión: petición guardada para sincronizar.",
      };
    }

    try {
      const response = await this.axiosInstance(config);
      return { data: response.data, status: response.status, success: true };
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
      }
      return {
        data: null as any,
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.message || error.message || "Error en la petición",
      };
    }
  }

  /**
   * Sincroniza peticiones pendientes cuando hay conexión
   */
  async syncPending(): Promise<void> {
    if (!navigator.onLine) return;

    const db = await this.getDB();
    const all = await db.getAll("pending");
    for (const pending of all) {
      const { id, options } = pending;
      console.log("Sincronizando petición pendiente:", options);
      try {
        const result = await this.request(options);
        if (result.success) {
          await db.delete("pending", id!);
        } else {
          console.warn("Falló la sincronización, se mantiene en cola:", options);
        }
      } catch {
        console.warn("Error al sincronizar, se mantiene en cola:", options);
      }
    }
  }

  /**
   * Métodos públicos
   */
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
