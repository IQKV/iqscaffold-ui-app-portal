export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  links: string[];
  last_page: number;
  from: number;
  to: number;
  path: number;
  allowed_sorts: Record<string, { asc: string; desc: string }>;
  default_sort: string;
  default_sort_direction: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: "asc" | "desc";
  search?: string;
}

export const createPaginationParams = (params: PaginationParams): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }

  if (params.per_page && params.per_page !== 10) {
    searchParams.set("per_page", params.per_page.toString());
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.direction && params.direction !== "asc") {
    searchParams.set("direction", params.direction);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  return searchParams;
};

export const parsePaginationParams = (searchParams: URLSearchParams): PaginationParams => {
  return {
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    per_page: searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!, 10) : 10,
    sort: searchParams.get("sort") || undefined,
    direction: (searchParams.get("direction") as "asc" | "desc") || "asc",
    search: searchParams.get("search") || undefined,
  };
};

export const calculatePaginationInfo = (pagination: PaginationData) => {
  const { current_page, per_page, total, last_page } = pagination;

  return {
    currentPage: current_page,
    pageSize: per_page,
    total,
    totalPages: last_page,
    hasNextPage: current_page < last_page,
    hasPreviousPage: current_page > 1,
    startIndex: (current_page - 1) * per_page + 1,
    endIndex: Math.min(current_page * per_page, total),
  };
};
