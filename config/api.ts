export const apiConfig = {
  version: 'v1',
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  webhook: {
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000'),
    retries: parseInt(process.env.WEBHOOK_RETRIES || '3'),
  },
};
