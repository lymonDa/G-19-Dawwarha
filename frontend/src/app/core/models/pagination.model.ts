export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  count?: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
