const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Halaman index pelanggan
router.get('/', ensureAuthenticated, customersController.viewIndexCustomer);

// customer list pelanggan lengkap
router.get('/get', ensureAuthenticated, customersController.getAllCustomer);

// Endpoint Data AJAX Search + Limit
router.get('/data', ensureAuthenticated, customersController.listCustomers);

// Tambah pelanggan
router.post('/add', ensureAuthenticated, customersController.createCustomer);

// customer by ID
router.get('/details/:id', ensureAuthenticated, customersController.getByIdCustomer);

// Update pelanggan
router.post('/update/:id', ensureAuthenticated, customersController.updateByIdCustomer);

// Hapus pelanggan
router.get('/delete/:id', ensureAuthenticated, customersController.deleteCustomer);

module.exports = router;