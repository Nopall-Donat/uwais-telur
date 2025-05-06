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
// Delete Transaksi
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
router.post('/payment/delete', salesController.deleteSalesPayment);
router.get('/payments/:id', salesController.getSalesPaymentHistory);

// ------------------------
// 🔧 UTILITAS
// ------------------------

// Generate ID Order baru
router.get('/generate/order-id', salesController.generateNewOrderId);
// Backup database
router.get('/backup', salesController.backupSalesToExcel);
// Cetak Nota Penjualan
router.get('/nota/:id', salesController.viewSalesReceipt);

module.exports = router;