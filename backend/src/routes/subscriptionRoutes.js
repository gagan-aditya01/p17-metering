const express = require('express');
const router = express.Router();
const { createSubscription } = require('../controllers/subscriptionController');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.route('/')
  .post(verifyJWT, requireRole('admin'), createSubscription);

module.exports = router;
