function createRateLimiter({ windowMs, maxRequests, message }) {
    const attempts = new Map();
 
    return function rateLimiter(req, res, next) {
      const now = Date.now();
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      const current = attempts.get(key);
 
      if (!current || current.resetAt <= now) {
        attempts.set(key, {
          count: 1,
          resetAt: now + windowMs
        });
        return next();
      }
 
      current.count += 1;
 
      if (current.count > maxRequests) {
        const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
 
        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
          message,
          retryAfterSeconds
        });
      }
 
      return next();
    };
  }
 
  module.exports = {
    createRateLimiter
  };