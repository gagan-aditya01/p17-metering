const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, customerId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        errorCode: 'DUPLICATE_ERROR'
      });
    }

    let assignedCustomerId = customerId || null;

    // Auto-create Customer tenant record if user is registering as 'customer' without an explicit ID
    if (role === 'customer' && !assignedCustomerId) {
      const newCustomer = await Customer.create({
        name,
        email,
        currency: 'USD'
      });
      assignedCustomerId = newCustomer._id;
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'customer',
      customerId: assignedCustomerId
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & return JWT
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('customerId');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
