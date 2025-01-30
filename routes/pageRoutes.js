const express = require('express');
const router = express.Router();

// Dashboard
router.get('/', (req, res, next) => {
    try {
        res.render('index', { 
            title: 'Dashboard - Uwais Telur'
        });
    } catch (err) {
        next(err); // Error akan ditangani oleh errorHandler
    }
});

// Transaksi
router.get('/transaksi', (req, res) => {
    res.render('pages/transaksi', {
        title: 'Transaksi Harian - Uwais Telur'
    });
});

// Daftar Penjualan
router.get('/daftar-penjualan', (req, res) => {
    res.render('pages/daftarPenjualan', {
        title: 'Daftar Penjualan - Uwais Telur'
    });
});

// Daftar Pembelian
router.get('/daftar-pembelian', (req, res) => {
    res.render('pages/daftarPembelian', {
        title: 'Daftar Pembelian - Uwais Telur'
    });
});

// Daftar Stok
router.get('/daftar-stok', (req, res) => {
    res.render('pages/daftarStokBarang', {
        title: 'Stok Barang - Uwais Telur'
    });
});

// Contoh route yang menghasilkan error
router.get('/test-error', (req, res, next) => {
    try {
        throw new Error('Ini adalah contoh error');
    } catch (err) {
        next(err);
    }
});

module.exports = router; 