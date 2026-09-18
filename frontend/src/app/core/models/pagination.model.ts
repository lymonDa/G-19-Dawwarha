<<<<<<< HEAD
export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  count?: number;
  totalPages?: number;
=======
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
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
}
