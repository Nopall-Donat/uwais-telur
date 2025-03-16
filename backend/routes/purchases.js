const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchasesController');

router.get('/', purchasesController.getAllPurchases);
router.get('/:id/details', purchasesController.getDetailPurchase);

module.exports = router;
