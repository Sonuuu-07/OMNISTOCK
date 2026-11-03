import { Request, Response, NextFunction } from 'express';
import { verifyJwt, UserRole, UserPayload } from './auth';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// In-Memory Rate Limiter Map (IP address -> { count, resetTime })
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 120; // 120 req/min for general, 30 for AI

/**
 * Rate Limiting Middleware with standard RFC headers
 */
export function rateLimiter(maxRequests: number = MAX_REQUESTS_PER_WINDOW) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
      rateLimitStore.set(ip, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
        retryAfter: resetSeconds,
      });
    }

    next();
  };
}

/**
 * Input Sanitization & Prompt Injection Defense Detector
 * Checks for known jailbreak vectors, SQL injections, and script tags
 */
export function sanitizeInput(input: any): { clean: any; flags: string[] } {
  const flags: string[] = [];
  if (typeof input !== 'string') return { clean: input, flags };

  const lower = input.toLowerCase();

  // Prompt injection & jailbreak patterns
  const injectionPatterns = [
    { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, name: 'System Override Attempt' },
    { pattern: /you\s+are\s+now\s+in\s+developer\s+mode/i, name: 'DAN / Developer Mode Jailbreak' },
    { pattern: /reveal\s+(the\s+)?(system\s+prompt|secret\s+key|api_key)/i, name: 'Secret Exfiltration Attempt' },
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, name: 'Cross-Site Scripting (XSS)' },
    { pattern: /union\s+select|drop\s+table|delete\s+from\s+users/i, name: 'Destructive SQL Injection' },
    { pattern: /\b(eval|exec)\s*\(/i, name: 'Code Execution Injection' },
  ];

  for (const { pattern, name } of injectionPatterns) {
    if (pattern.test(input)) {
      flags.push(name);
    }
  }

  // Basic HTML entity encoding for defense-in-depth
  const clean = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '');

  return { clean, flags };
}

/**
 * Sanitization Middleware
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const detectedFlags: string[] = [];

    const sanitizeObject = (obj: any) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          const { clean, flags } = sanitizeInput(obj[key]);
          if (flags.length > 0) detectedFlags.push(...flags);
          obj[key] = clean;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(req.body);
    if (detectedFlags.length > 0) {
      // Attach injection detection report to request
      (req as any).securityAlerts = detectedFlags;
    }
  }
  next();
}

/**
 * Authenticate JWT Middleware
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header with Bearer token',
    });
  }

  const token = authHeader.substring(7);
  const result = verifyJwt(token);

  if (!result.valid || !result.payload) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: result.error || 'Invalid session token',
    });
  }

  req.user = result.payload;
  next();
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Your role (${req.user.role}) lacks permission for this resource. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error Middleware]', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred',
    path: req.path,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
}
