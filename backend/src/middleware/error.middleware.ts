/**
 * Error Handling Middleware for sBTC Payment Gateway
 * Centralized error processing and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { createLogger } from '@/utils/logger';
import config from '@/config';

const logger = createLogger('ErrorHandler');

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
  stack?: string;
}

/**
 * Main error handling middleware
 * Should be the last middleware in the chain
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = config.nodeEnv === 'development';
  const isProduction = config.nodeEnv === 'production';

  // Generate unique request ID for tracking
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Log the error with context
  logError(error, req, requestId);

  // Handle different error types
  if (error instanceof AppError) {
    handleAppError(error, req, res, requestId, isDevelopment);
  } else if (error.name === 'ValidationError') {
    handleValidationError(error, req, res, requestId);
  } else if (error.name === 'CastError') {
    handleCastError(error, req, res, requestId);
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    handleMongoError(error, req, res, requestId);
  } else if (error.name === 'JsonWebTokenError') {
    handleJWTError(error, req, res, requestId);
  } else if (error.name === 'TokenExpiredError') {
    handleTokenExpiredError(error, req, res, requestId);
  } else if (error.name === 'MulterError') {
    handleMulterError(error, req, res, requestId);
  } else {
    handleGenericError(error, req, res, requestId, isDevelopment);
  }
};

/**
 * Handle custom AppError instances
 */
function handleAppError(
  error: AppError,
  req: Request,
  res: Response,
  requestId: string,
  isDevelopment: boolean
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.errorCode,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  if (isDevelopment) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}

/**
 * Handle MongoDB validation errors
 */
function handleValidationError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));

  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { errors },
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(400).json(response);
}

/**
 * Handle MongoDB cast errors (invalid ObjectId, etc.)
 */
function handleCastError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Invalid ${error.path}: ${error.value}`,
      code: 'INVALID_DATA_FORMAT',
      details: {
        field: error.path,
        value: error.value,
        expectedType: error.kind
      },
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(400).json(response);
}

/**
 * Handle MongoDB errors
 */
function handleMongoError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  let message = 'Database operation failed';
  let statusCode = 500;
  let details: any = {};

  // Handle duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 409;
    details = {
      field,
      value: error.keyValue[field]
    };
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code: 'DATABASE_ERROR',
      details,
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(statusCode).json(response);
}

/**
 * Handle JWT errors
 */
function handleJWTError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(401).json(response);
}

/**
 * Handle expired JWT tokens
 */
function handleTokenExpiredError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Authentication token has expired',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(401).json(response);
}

/**
 * Handle file upload errors
 */
function handleMulterError(
  error: any,
  req: Request,
  res: Response,
  requestId: string
): void {
  let message = 'File upload failed';
  let statusCode = 400;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      break;
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code: 'FILE_UPLOAD_ERROR',
      details: { originalError: error.code },
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  res.status(statusCode).json(response);
}

/**
 * Handle generic/unknown errors
 */
function handleGenericError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  isDevelopment: boolean
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  if (isDevelopment) {
    response.stack = error.stack;
    response.error.details = {
      name: error.name,
      cause: error.cause
    };
  }

  res.status(500).json(response);
}

/**
 * Log error with context information
 */
function logError(error: Error, req: Request, requestId: string): void {
  const errorInfo = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
    query: req.query,
    params: req.params,
    headers: sanitizeHeaders(req.headers),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        isOperational: error.isOperational,
        details: error.details
      })
    },
    timestamp: new Date().toISOString()
  };

  if (error instanceof AppError && error.isOperational) {
    logger.warn('Operational error occurred:', errorInfo);
  } else {
    logger.error('System error occurred:', errorInfo);
  }
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'privateKey', 'mnemonic'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Async error wrapper for route handlers
 * Usage: asyncHandler(async (req, res, next) => { ... })
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler middleware
 * Should be placed before the error handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      timestamp: new Date().toISOString(),
      requestId
    }
  };

  logger.warn('Route not found:', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json(response);
};

/**
 * Request ID middleware
 * Adds unique ID to each request for tracking
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
