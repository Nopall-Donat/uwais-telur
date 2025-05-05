const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// ⬇️ Tambahkan multer untuk menangani multipart/form-data dari FormData
const multer = require('multer');
const upload = multer(); // Gunakan upload.none() untuk form tanpa file

// ------------------------
// 📄 ROUTE UTAMA
// ------------------------

// Halaman utama (index penjualan)
router.get('/', salesController.viewIndexSales);

// Data dengan filter (AJAX)
router.get('/data', salesController.listSales);

// API semua data
router.get('/api', salesController.getAllSales);

// ------------------------
// 🧾 TRANSAKSI
// ------------------------

// Tambah transaksi baru
router.post('/add', salesController.createSales);

// Detail transaksi
router.get('/details/:id', salesController.viewSalesDetail);

// Update transaksi
router.post('/update/:id', salesController.updateSales);

// Hapus transaksi
router.get('/delete/:id', salesController.deleteSales);

// ------------------------
// 📦 ORDER
// ------------------------

// Tambah / Update pesanan
router.post('/order', upload.none(), salesController.addOrderToSales);

// ------------------------
// 💵 PEMBAYARAN
// ------------------------

router.post('/payment', upload.none(), salesController.addPaymentToSales);

// ------------------------
// 🔧 UTILITAS
// ------------------------

// Generate ID Order baru
router.get('/generate/order-id', salesController.generateNewOrderId);

module.exports = router;