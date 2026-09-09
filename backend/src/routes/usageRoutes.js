const express = require('express');
const router = express.Router();
const { ingestUsage, getUsageLogs } = require('../controllers/usageController');
const { verifyApiKey, verifyJWT } = require('../middlewares/auth.middleware');
const { checkEntitlement } = require('../middlewares/entitlement.middleware');

/**
 * @openapi
 * /usage/ingest:
 *   post:
 *     summary: Ingest raw telemetry usage event
 *     tags: [Usage Telemetry]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventName, units]
 *             properties:
 *               eventName:
 *                 type: string
 *                 example: llm_tokens
 *               units:
 *                 type: number
 *                 example: 1500
 *               metadata:
 *                 type: object
 *                 example: { model: "gpt-4o" }
 *     responses:
 *       201:
 *         description: Event ingested & rated successfully
 *       402:
 *         description: Payment Required - Entitlement / Wallet exhausted
 */
router.post('/ingest', verifyApiKey, checkEntitlement, ingestUsage);

/**
 * @openapi
 * /usage/logs:
 *   get:
 *     summary: Get usage logs
 *     tags: [Usage Telemetry]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of metered events
 */
router.get('/logs', verifyJWT, getUsageLogs);

module.exports = router;
