export class ApiError extends Error {
  code?: string;
  status?: number;
  data?: unknown;

  constructor(message: string, options?: { code?: string; status?: number; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.status = options?.status;
    this.data = options?.data;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError; 