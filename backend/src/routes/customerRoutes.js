const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers } = require('../controllers/customerController');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.route('/')
  .post(verifyJWT, requireRole('admin'), createCustomer)
  .get(verifyJWT, getCustomers);

module.exports = router;
