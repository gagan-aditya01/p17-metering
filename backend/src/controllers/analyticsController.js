const { getExecutiveAnalytics } = require('../services/analytics.service');

// @desc    Get Admin Executive Analytics Dashboard
// @route   GET /api/v1/analytics/dashboard
exports.getAnalyticsDashboard = async (req, res, next) => {
  try {
    const data = await getExecutiveAnalytics();
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
