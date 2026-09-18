export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total?: number;
    count?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
