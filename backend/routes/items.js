const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

// Halaman utama stok
router.get('/', itemsController.viewIndexItems);

// Endpoint ambil semua data item
router.get('/get', itemsController.getAllItems);

// Endpoint untuk AJAX Search + Limit + Pagination
router.get('/data', itemsController.listItems);

// Tambah item baru
router.post('/add', itemsController.createItem);

// Tampilkan detail item
router.get('/details/:id', itemsController.getByIdItem);

// Update data item
router.post('/update/:id', itemsController.updateByIdItem);

// Hapus item
router.get('/delete/:id', itemsController.deleteItem);

module.exports = router;
