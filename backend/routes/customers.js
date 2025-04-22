const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customersController');

// Halaman index pelanggan
router.get('/', ctrl.viewIndexCustomer);

// API list pelanggan lengkap
router.get('/api', ctrl.getAllCustomer);

// API by ID
router.get('/api/:id', ctrl.getByIdCustomer);

// API limit
router.get('/api-limit', ctrl.getAllLimitCustomer);

// API untuk dropdown
router.get('/api/names', ctrl.getCustomerNameList);

// Tambah pelanggan
router.post('/api', ctrl.createCustomer);

// Update pelanggan
router.put('/api/:id', ctrl.updateByIdCustomer);

// Hapus pelanggan
router.delete('/api/:id', ctrl.deleteCustomer);

module.exports = router;
