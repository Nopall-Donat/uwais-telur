const express = require('express');
const router = express.Router();

// Sales
router.get('/', (req, res) => {
    res.render('pages/sales', {
        title: 'Transaksi - Uwais Telur'
    });
});

// Customers
router.get('/customers', (req, res) => {
    res.render('pages/customers', {
        title: 'Data Pelanggan - Uwais Telur'
    });
});

// Purchases
router.get('/purchases', (req, res) => {
    res.render('pages/purchases', {
        title: 'Pembelian - Uwais Telur'
    });
});
// Data Supplier
router.get('/suppliers', (req, res) => {
    res.render('pages/suppliers', {
        title: 'Data Suplier - Uwais Telur'
    });
});
// Stok Barang
router.get('/items', (req, res) => {
    res.render('pages/items', {
        title: 'Data Barang - Uwais Telur'
    });
});

// Admins
router.get('/admins', (req, res) => {
    res.render('pages/admins', {
        title: 'Data Admin - Uwais Telur'
    });
});

module.exports = router; 