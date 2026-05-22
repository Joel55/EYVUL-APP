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
 

 
 
 
