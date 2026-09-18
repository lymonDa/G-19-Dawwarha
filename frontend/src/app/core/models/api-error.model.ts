export interface ApiError {
  code: string;
  message: string;
<<<<<<< HEAD
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
=======
  fieldErrors?: Record<string, string>;
  status?: number;
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
}
