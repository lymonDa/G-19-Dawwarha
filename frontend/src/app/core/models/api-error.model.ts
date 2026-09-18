export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  pagination?: {
    page: number;
    limit: number;
    total?: number;
    count?: number;
  };
}
