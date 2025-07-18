/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import {
  getOfflineAplicaciones,
  getOfflineProductos,
  getOfflineLocaciones,
} from './offline-service'

interface ApiOptions {
  baseUrl?: string;
  endpoint: string;
  id?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  private async handleOfflineGET<T>(endpoint: string): Promise<ApiResponse<T>> {
    if (endpoint.includes("/aplicaciones")) {
      const data = await getOfflineAplicaciones();
      return { data: data as any, status: 200, success: true };
    }
    if (endpoint.includes("/productos")) {
      const data = await getOfflineProductos();
      return { data: data as any, status: 200, success: true };
    }
    if (endpoint.includes("/locaciones")) {
      const data = await getOfflineLocaciones();
      return { data: data as any, status: 200, success: true };
    }

    return {
      data: null as any,
      status: 503,
      success: false,
      error: "Sin conexión: ruta no soportada offline.",
    };
  }

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
      console.warn("🔌 Sin conexión, modo offline activado:", options);

      if (method === "GET") {
        return await this.handleOfflineGET<T>(url);
      }

      return {
        data: null as any,
        status: 503,
        success: false,
        error: "Sin conexión: petición guardada para sincronizar (ver offlineService).",
      };
    }

    try {
      const response = await this.axiosInstance(config);
      return { data: response.data, status: response.status, success: true };
    } catch (error: any) {
      if (error.response?.status === 401) this.logout();

      return {
        data: null as any,
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

  async update<T>(endpoint: string, id: number | string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PUT", data, ...options });
  }

  async patch<T>(endpoint: string, id: number | string, data: any, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "PATCH", data, ...options });
  }

  async delete<T>(endpoint: string, id: number | string, options: Partial<ApiOptions> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, id, method: "DELETE", ...options });
  }
}

export default ApiService;
