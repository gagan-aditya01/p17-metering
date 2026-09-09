const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet } = require('../controllers/walletController');
const { verifyJWT } = require('../middlewares/auth.middleware');

router.get('/', verifyJWT, getWallet);
router.post('/topup', verifyJWT, topUpWallet);

module.exports = router;
