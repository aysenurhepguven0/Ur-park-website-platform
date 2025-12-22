import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 100, // Much higher limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // More lenient in development
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful requests
});

// Rate limiter for creating resources
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 10, // More lenient in development
  message: 'Too many resources created, please try again later.'
});

// Rate limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 10, // More lenient in development
  message: 'Too many payment requests, please try again later.'
});

// Rate limiter for messaging
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 200 : 30, // More lenient in development
  message: 'You are sending messages too quickly, please slow down.'
});
