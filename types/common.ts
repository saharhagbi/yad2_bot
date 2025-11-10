/**
 * Common utility types used across the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponseWrapper<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: Date;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  error: string;
  code: number;
  details?: unknown;
}

/**
 * Database operation result
 */
export interface DatabaseOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}