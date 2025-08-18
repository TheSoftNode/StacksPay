import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
}

// Simple in-memory rate limiter (for production, use Redis or similar)
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: RateLimitOptions) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowMs = options.windowMs
    const maxRequests = options.maxRequests

    // Clean up old entries
    requests.forEach((value, key) => {
      if (now > value.resetTime) {
        requests.delete(key)
      }
    })

    // Get current request count for this IP
    const current = requests.get(ip) || { count: 0, resetTime: now + windowMs }

    if (now > current.resetTime) {
      // Reset window
      current.count = 1
      current.resetTime = now + windowMs
    } else {
      current.count++
    }

    requests.set(ip, current)

    // Check if limit exceeded
    if (current.count > maxRequests) {
      return NextResponse.json(
        { 
          error: options.message || 'Too many requests', 
          retryAfter: Math.ceil((current.resetTime - now) / 1000) 
        },
        { status: 429 }
      )
    }

    return null // Allow request to continue
  }
}

// Common rate limiting configurations
export const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests from this IP, please try again later.'
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.'
  },
  webhooks: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many webhook requests, please slow down.'
  }
}
