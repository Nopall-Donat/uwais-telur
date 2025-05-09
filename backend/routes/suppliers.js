const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliersController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Halaman index pemasok
router.get('/', ensureAuthenticated, suppliersController.viewIndexSupplier);

// supplier list lengkap (JSON)
router.get('/get', ensureAuthenticated, suppliersController.getAllSupplier);

// Endpoint Data AJAX Search + Limit
router.get('/data', ensureAuthenticated, suppliersController.listSuppliers);

// Tambah pemasok
router.post('/add', ensureAuthenticated, suppliersController.createSupplier);

// supplier by ID
router.get('/details/:id', ensureAuthenticated, suppliersController.getByIdSupplier);

// Update pemasok
router.post('/update/:id', ensureAuthenticated, suppliersController.updateByIdSupplier);

// Hapus pemasok
router.get('/delete/:id', ensureAuthenticated, suppliersController.deleteSupplier);

module.exports = router;