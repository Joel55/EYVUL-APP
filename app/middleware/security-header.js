  function securityHeaders(req, res, next) {
    res.set({
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Permitted-Cross-Domain-Policies': 'none'
    });
 
    return next();
  }
 
  module.exports = securityHeaders;
 
  app/middleware/errorHandler.js
 
  function notFound(req, res) {
    return res.status(404).json({ message: 'Not found' });
  }
 
  function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);
 
    return res.status(err.status || 500).json({
      message: err.publicMessage || 'Internal server error'
    });
  }
 
  module.exports = { notFound, errorHandler };