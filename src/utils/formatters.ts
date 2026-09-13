import type { ApiResponse, ApiErrorResponse, ListResponse, PaginationParams } from '../types/api.types';
import type { ErrorPayload } from '../types/errors.types';

export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> => {
  return meta ? { success: true, data, meta } : { success: true, data };
};

export const created = <T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> => {
  return ok(data, meta);
};

export const errorResponse = (
  error: ErrorPayload,
  requestId?: string
): ApiErrorResponse => {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
    },
  };
};

export const pagination = <T>(
  items: T[],
  total: number,
  params: PaginationParams
): ListResponse<T> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const size = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / size));
  return {
    items,
    total,
    page,
    pageSize: size,
    totalPages,
  };
}