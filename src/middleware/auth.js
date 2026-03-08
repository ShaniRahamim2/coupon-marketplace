function resellerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization token',
    });
  }

  // grab the token part after "Bearer"
  const token = authHeader.split(' ')[1];

  if (token !== process.env.RESELLER_API_TOKEN) {
    return res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }

  // token is valid, let the request through
  next();
}

// same idea but for admin routes, uses a separate token
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization token',
    });
  }

  const token = authHeader.split(' ')[1];

  if (token !== process.env.ADMIN_API_TOKEN) {
    return res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Invalid admin token',
    });
  }

  next();
}

module.exports = { resellerAuth, adminAuth };
