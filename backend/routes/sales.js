const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Route untuk menampilkan daftar transaksi
router.get('/', salesController.indexSales);

// Route untuk menampilkan detail transaksi (misal: saat mengklik nama pelanggan)
router.get('/:id/detail', salesController.detailSales);

// Route untuk membuat transaksi baru (header) melalui POST (misal: setelah memilih pelanggan dan klik "Save Changes")
router.post('/create', salesController.createSales);

// Anda dapat menambahkan route lain, seperti untuk update order, delete transaksi, dsb.

module.exports = router;
