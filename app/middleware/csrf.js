const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
 
  function parseAllowedOrigins() {
    return (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
 
  function getOriginFromReferer(referer) {
    if (!referer) return null;
 
    try {
      return new URL(referer).origin;
    } catch (err) {
      return null;
    }
  }
 
  function createCsrfProtection() {
    const allowedOrigins = parseAllowedOrigins();
 
    return function csrfProtection(req, res, next) {
      if (!UNSAFE_METHODS.has(req.method)) {
        return next();
      }
 
      const origin = req.get('origin') || getOriginFromReferer(req.get('referer'));
 
      if (!origin) {
        return next();
      }
 
      if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: 'Cross-site request blocked' });
      }
 
      return next();
    };
  }
 
  module.exports = createCsrfProtection;