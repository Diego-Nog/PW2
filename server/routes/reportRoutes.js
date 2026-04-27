const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/top-rated-by-genre
router.get('/top-rated-by-genre', reportController.topRatedByGenre);

// GET /api/reports/critic-activity
router.get('/critic-activity', reportController.criticActivity);

// GET /api/reports/launch-trends
router.get('/launch-trends', reportController.launchTrends);

// GET /api/reports/system-health
router.get('/system-health', reportController.systemHealth);

module.exports = router;
