/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

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

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.defaultBaseUrl,
      headers: { "Content-Type": "application/json" },
    });
  }

  private addAuthToken(config: AxiosRequestConfig) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }
    }
    return config;
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

    const finalConfig = this.addAuthToken(config);
    console.log(finalConfig);

    try {
      const response = await this.axiosInstance(finalConfig);
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

  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }
}

export const apiService = new ApiService();