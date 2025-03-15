const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Gunakan controller untuk mengambil data transaksi dan render halaman utama
router.get('/', salesController.getAllSales);
router.get('/:id/detail', salesController.getDetailSales);

module.exports = router;