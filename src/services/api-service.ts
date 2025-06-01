/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
//import useToken from "./tokenService";


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

  
  constructor(token: string | null, logout: () => void) {
    this.logout = logout;
    this.axiosInstance = axios.create({
      baseURL: this.defaultBaseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log("Error response:", error.response);
        if (error.response?.status === 401) {
          console.log("Fallo de autorizacion")
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
          // Aseguramos compatibilidad con tipos AxiosHeaderValue
          (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
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
    
    try {
      console.log("Request URL:", `${baseUrl}${url}`);
      console.log("Request headers:", config.headers);
      const response = await this.axiosInstance(config);
      return { data: response.data, status: response.status, success: true };
    } catch (error: any) {
      console.error("API Error:", error.response || error);
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