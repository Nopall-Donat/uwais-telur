const express = require('express');
const router = express.Router();
const { addTransaction } = require('../controllers/transactionController');

router.post('/', addTransaction);

module.exports = router;
