import { NextResponse } from 'next/server'

/**
 * Standard error response for API routes
 */
export function apiError(message: string, code?: string, status: number = 500) {
  const errorResponse: { error: string; code?: string; details?: Record<string, string> } = {
    error: message,
  }
  
  if (code) {
    errorResponse.code = code
  }
  
  return NextResponse.json(errorResponse, { status })
}

/**
 * Standard success response for API routes
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Rate limit headers
 */
export function withRateLimitHeaders(response: NextResponse, limit: number, remaining: number) {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  return response
}
