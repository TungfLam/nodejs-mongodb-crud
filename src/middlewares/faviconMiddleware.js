const faviconMiddleware = (req, res, next) => {
  if (req.url === '/favicon.ico' && req.method === 'GET') {
    return;
  }
  next();
};

module.exports = faviconMiddleware;
