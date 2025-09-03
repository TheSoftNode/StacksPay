import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  SDKOptions,
  APIError 
} from './types';

export class SBTCGatewayError extends Error {
  public code?: string;
  public details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'SBTCGatewayError';
    this.code = code;
    this.details = details;
  }
}

export class BaseAPI {
  protected client: AxiosInstance;
  protected apiKey: string;

  constructor(options: SDKOptions) {
    this.apiKey = options.apiKey;
    
    this.client = axios.create({
      baseURL: options.baseURL || 'https://api.sbtc-gateway.com',
      timeout: options.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '@sbtc-gateway/node/1.0.0'
      }
    });

    // Request interceptor for retries
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response?.data) {
          const apiError = error.response.data as APIError;
          throw new SBTCGatewayError(
            apiError.error || 'API request failed',
            apiError.code,
            apiError.details
          );
        }
        throw new SBTCGatewayError(
          error.message || 'Network error occurred',
          'NETWORK_ERROR'
        );
      }
    );
  }

  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}
