const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

// Halaman index pelanggan
router.get('/', customersController.viewIndexCustomer);

// customer list pelanggan lengkap
router.get('/get', customersController.getAllCustomer);

// customer by ID
router.get('/details/:id', customersController.getByIdCustomer);

// customer limit
router.get('/limit', customersController.getAllLimitCustomer);

// customer untuk dropdown
router.get('/get-names', customersController.getCustomerNameList);

// Tambah pelanggan
router.post('/add', customersController.createCustomer);

// Update pelanggan
router.put('/update/:id', customersController.updateByIdCustomer);

// Hapus pelanggan
router.get('/delete/:id', customersController.deleteCustomer);

module.exports = router;
