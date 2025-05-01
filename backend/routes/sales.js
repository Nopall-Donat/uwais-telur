const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Halaman utama (render index)
router.get('/', salesController.viewIndexSales);

// Data AJAX + Pagination
router.get('/data', salesController.listSales);

// API full data
router.get('/api', salesController.getAllSales);

// Tambah transaksi
router.post('/add', salesController.createSales);

// Detail transaksi (render detail view)
router.get('/details/:id', salesController.viewSalesDetail);

// Update transaksi
router.post('/update/:id', salesController.updateSales);

// Hapus transaksi
router.get('/delete/:id', salesController.deleteSales);

// API tambahan (opsional)
router.post('/order', salesController.addOrderToSales);
router.post('/payment', salesController.addPaymentToSales);

module.exports = router;
