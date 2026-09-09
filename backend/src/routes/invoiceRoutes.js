const express = require('express');
const router = express.Router();
const { getInvoices, payInvoice, generateInvoices } = require('../controllers/invoiceController');
const { verifyJWT, requireRole } = require('../middlewares/auth.middleware');

router.get('/', verifyJWT, getInvoices);
router.post('/:id/pay', verifyJWT, payInvoice);
router.post('/generate', verifyJWT, requireRole('admin'), generateInvoices);

module.exports = router;
