const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

// Verify JWT token in Authorization header
exports.verifyJWT = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route (Missing token)',
        errorCode: 'UNAUTHORIZED'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
        errorCode: 'UNAUTHORIZED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errorCode: 'INVALID_TOKEN'
    });
  }
};

// Require specific user roles
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`,
        errorCode: 'FORBIDDEN'
      });
    }
    next();
  };
};

// Verify x-api-key for server-to-server usage ingestion
exports.verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Missing x-api-key header for usage ingestion',
        errorCode: 'MISSING_API_KEY'
      });
    }

    const customer = await Customer.findOne({ apiKey });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Key',
        errorCode: 'INVALID_API_KEY'
      });
    }

    if (customer.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Customer account is suspended',
        errorCode: 'ACCOUNT_SUSPENDED'
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};
