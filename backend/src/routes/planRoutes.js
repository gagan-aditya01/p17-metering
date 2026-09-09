const express = require('express');
const router = express.Router();
const { createPlan, getPlans } = require('../controllers/planController');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.route('/')
  .post(verifyJWT, requireRole('admin'), createPlan)
  .get(getPlans);

module.exports = router;
