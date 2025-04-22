const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/', salesController.viewIndexSales);
// Mendapatkan semua transaksi
router.get('/api', salesController.getAllSales);

// Mendapatkan semua transaksi (limit)
router.get('/limit/:limit', salesController.getAllSalesLimit);

// Mendapatkan satu transaksi berdasarkan ID (header)
router.get('/:id', salesController.getSalesById);

// Mendapatkan detail transaksi (header + order + pembayaran)
router.get('/details/:id', salesController.viewSalesDetail);

// Membuat transaksi baru
router.post('/create', salesController.createSales);

// Menambahkan item ke transaksi
router.post('/order', salesController.addOrderToSales);

// Menambahkan pembayaran ke transaksi
router.post('/payment', salesController.addPaymentToSales);

// Update transaksi
router.put('/:id', salesController.updateSales);

// Hapus transaksi
router.delete('/:id', salesController.deleteSales);

module.exports = router;
