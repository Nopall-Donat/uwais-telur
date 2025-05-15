const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const multer = require('multer');
const upload = multer(); // Gunakan upload.none() untuk form tanpa file

const { ensureAuthenticated } = require('../middleware/authMiddleware');

// ------------------------
// 📄 ROUTE UTAMA
// ------------------------

router.get('/', ensureAuthenticated, salesController.viewIndexSales);
router.get('/data', ensureAuthenticated, salesController.listSales);
router.get('/api', ensureAuthenticated, salesController.getAllSales);

// ------------------------
// 🧾 TRANSAKSI
// ------------------------

router.post('/add', ensureAuthenticated, salesController.createSales);
router.get('/details/:id', ensureAuthenticated, salesController.viewSalesDetail);
router.get('/delete/:id', ensureAuthenticated, salesController.deleteSales);

// ------------------------
// 📦 ORDER
// ------------------------

router.post('/order', ensureAuthenticated, upload.none(), salesController.addOrderToSales);

// ------------------------
// 💵 PEMBAYARAN
// ------------------------

router.post('/payment', ensureAuthenticated, upload.none(), salesController.addPaymentToSales);
router.post('/payment/delete', ensureAuthenticated, salesController.deleteSalesPayment);
router.get('/payments/:id', ensureAuthenticated, salesController.getSalesPaymentHistory);

// ------------------------
// 🔧 UTILITAS
// ------------------------

router.get('/generate/order-id', ensureAuthenticated, salesController.generateNewOrderId);
router.get('/backup', ensureAuthenticated, salesController.backupSalesToExcel);

// ------------------------
// 🧾 STRUK
// ------------------------
router.get('/printer-list', ensureAuthenticated, salesController.getPrinterList);
router.get('/nota/:id', ensureAuthenticated, salesController.viewSalesReceipt);
router.post('/cetak-nota/:id', ensureAuthenticated, salesController.printSalesReceipt);
router.get('/printer-default', ensureAuthenticated, salesController.getDefaultPrinter);
router.post('/printer-default', ensureAuthenticated, salesController.setDefaultPrinter);
router.get('/nota-preview/:id', ensureAuthenticated, salesController.previewSalesReceipt);

module.exports = router;