const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Halaman utama stok
router.get('/', ensureAuthenticated, itemsController.viewIndexItems);

// Endpoint ambil semua data item
router.get('/get', ensureAuthenticated, itemsController.getAllItems);

// Endpoint untuk AJAX Search + Limit + Pagination
router.get('/data', ensureAuthenticated, itemsController.listItems);

// Tambah item baru
router.post('/add', ensureAuthenticated, itemsController.createItem);

// Tampilkan detail item
router.get('/details/:id', ensureAuthenticated, itemsController.getByIdItem);

// Update data item
router.post('/update/:id', ensureAuthenticated, itemsController.updateByIdItem);

// Hapus item
router.get('/delete/:id', ensureAuthenticated, itemsController.deleteItem);

module.exports = router;