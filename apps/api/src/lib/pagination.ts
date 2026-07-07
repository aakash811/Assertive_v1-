export type Pagination = {
  page: number;
  limit: number;
};

export function getPagination(page?: string, limit?: string): Pagination {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,

    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100
        ? parsedLimit
        : 20,
  };
}
