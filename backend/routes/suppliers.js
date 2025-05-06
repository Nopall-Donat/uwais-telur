const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliersController');

// Halaman index pemasok
router.get('/', suppliersController.viewIndexSupplier);

// supplier list lengkap (JSON)
router.get('/get', suppliersController.getAllSupplier);

// Endpoint Data AJAX Search + Limit
router.get('/data', suppliersController.listSuppliers);

// Tambah pemasok
router.post('/add', suppliersController.createSupplier);

// supplier by ID
router.get('/details/:id', suppliersController.getByIdSupplier);

// Update pemasok
router.post('/update/:id', suppliersController.updateByIdSupplier);

// Hapus pemasok
router.get('/delete/:id', suppliersController.deleteSupplier);

module.exports = router;