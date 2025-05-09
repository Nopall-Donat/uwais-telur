const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchasesController');
const multer = require('multer');
const upload = multer(); // untuk menangani FormData tanpa file

const { ensureAuthenticated } = require('../middleware/authMiddleware');

// ------------------------
// 📄 ROUTE UTAMA
// ------------------------

router.get('/', ensureAuthenticated, purchasesController.viewIndexPurchases);
router.get('/data', ensureAuthenticated, purchasesController.listPurchases);
router.get('/api', ensureAuthenticated, purchasesController.getAllPurchases);

// ------------------------
// 🧾 TRANSAKSI
// ------------------------

router.post('/add', ensureAuthenticated, purchasesController.createPurchase);
router.get('/details/:id', ensureAuthenticated, purchasesController.viewPurchaseDetail);
router.get('/delete/:id', ensureAuthenticated, purchasesController.deletePurchase);

// ------------------------
// 📦 ORDER
// ------------------------

router.post('/order', ensureAuthenticated, upload.none(), purchasesController.addOrderToPurchase);

// ------------------------
// 💵 PEMBAYARAN
// ------------------------

router.post('/payment', ensureAuthenticated, upload.none(), purchasesController.addPaymentToPurchase);
router.post('/payment/delete', ensureAuthenticated, purchasesController.deletePurchasePayment);
router.get('/payments/:id', ensureAuthenticated, purchasesController.getPurchasePaymentHistory);

// ------------------------
// 🔧 UTILITAS
// ------------------------

router.get('/generate/order-id', ensureAuthenticated, purchasesController.generateNewPurchaseOrderId);
router.get('/backup', ensureAuthenticated, purchasesController.backupPurchasesToExcel);
router.get('/nota/:id', ensureAuthenticated, purchasesController.viewPurchaseReceipt);

module.exports = router;