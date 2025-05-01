const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

// Halaman index pelanggan
router.get('/', customersController.viewIndexCustomer);

// customer list pelanggan lengkap
router.get('/get', customersController.getAllCustomer);

// Endpoint Data AJAX Search + Limit
router.get('/data', customersController.listCustomers);

// Tambah pelanggan
router.post('/add', customersController.createCustomer);

// customer by ID
router.get('/details/:id', customersController.getByIdCustomer);

// Update pelanggan
router.post('/update/:id', customersController.updateByIdCustomer);

// Hapus pelanggan
router.get('/delete/:id', customersController.deleteCustomer);

module.exports = router;
