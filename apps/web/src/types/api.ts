export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};
