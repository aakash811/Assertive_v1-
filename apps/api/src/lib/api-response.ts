import type { ErrorCode } from "@assertive/shared";

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
};

export type PaginatedResponse<T> = {
  success: true;
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export function ok<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function paginated<T>(
  data: T[],
  meta: {
    page: number;
    limit: number;
    total: number;
  },
): PaginatedResponse<T> {
  return {
    success: true,
    items: data,
    pagination: meta,
  };
}

export function fail(
  code: ErrorCode,
  message: string,
  details?: unknown,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
