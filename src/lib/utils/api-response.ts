import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(data: T, message: string = 'Success'): NextResponse {
  return NextResponse.json({ success: true, message, data }, { status: 200 });
}

export function errorResponse(message: string, code: string = 'INTERNAL_SERVER_ERROR', status: number = 500): NextResponse {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

export function paginatedResponse<T>(data: T[], pagination: PaginationMeta, message: string = 'Success'): NextResponse {
  return NextResponse.json({ success: true, message, data, pagination }, { status: 200 });
}

export function conflictResponse(message: string = 'Conflict'): NextResponse {
  return errorResponse(message, 'CONFLICT', 409);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 'FORBIDDEN', 403);
}

export function notFoundResponse(message: string = 'Not Found'): NextResponse {
  return errorResponse(message, 'NOT_FOUND', 404);
}

export function validationErrorResponse(message: string, errors?: any): NextResponse {
  return NextResponse.json({ success: false, error: { message, code: 'VALIDATION_ERROR', details: errors } }, { status: 400 });
}
