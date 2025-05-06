const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchasesController');

const multer = require('multer');
const upload = multer(); // untuk menangani FormData tanpa file

// ------------------------
// 📄 ROUTE UTAMA
// ------------------------

// Halaman utama (index pembelian)
router.get('/', purchasesController.viewIndexPurchases);
// Data dengan filter (AJAX)
router.get('/data', purchasesController.listPurchases);
// API semua data
router.get('/api', purchasesController.getAllPurchases);

// ------------------------
// 🧾 TRANSAKSI
// ------------------------

// Tambah transaksi baru
router.post('/add', purchasesController.createPurchase);
// Detail transaksi
router.get('/details/:id', purchasesController.viewPurchaseDetail);
// Hapus transaksi
router.get('/delete/:id', purchasesController.deletePurchase);

// ------------------------
// 📦 ORDER
// ------------------------

// Tambah / Update pesanan
router.post('/order', upload.none(), purchasesController.addOrderToPurchase);

// ------------------------
// 💵 PEMBAYARAN
// ------------------------

router.post('/payment', upload.none(), purchasesController.addPaymentToPurchase);
router.post('/payment/delete', purchasesController.deletePurchasePayment);
router.get('/payments/:id', purchasesController.getPurchasePaymentHistory);

// ------------------------
// 🔧 UTILITAS
// ------------------------

// Generate ID Order baru
router.get('/generate/order-id', purchasesController.generateNewPurchaseOrderId);
// Backup data pembelian
router.get('/backup', purchasesController.backupPurchasesToExcel);
// Cetak Nota Pembelian
router.get('/nota/:id', purchasesController.viewPurchaseReceipt);

module.exports = router;