const express = require('express');
const router = express.Router();
const { getAnalyticsDashboard } = require('../controllers/analyticsController');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.get('/dashboard', verifyJWT, requireRole('admin'), getAnalyticsDashboard);

module.exports = router;
