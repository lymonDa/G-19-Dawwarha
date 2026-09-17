export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}
