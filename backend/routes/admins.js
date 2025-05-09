const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Halaman index admin
router.get('/', ensureAuthenticated, adminsController.viewIndexAdmins);

// Daftar semua admin (JSON)
router.get('/get', ensureAuthenticated, adminsController.getAllAdmins);

// Endpoint Data AJAX Search + Limit
router.get('/data', ensureAuthenticated, adminsController.listAdmins);

// Tambah admin baru (dengan verifikasi password admin yang login)
router.post('/add', ensureAuthenticated, adminsController.createAdmin);

// Detail admin by ID
router.get('/details/:id', ensureAuthenticated, adminsController.getByIdAdmin);

// Update data admin (dengan verifikasi password admin yang login)
router.post('/update/:id', ensureAuthenticated, adminsController.updateByIdAdmin);

// Hapus admin (dengan verifikasi password admin yang login)
router.post('/delete/:id', ensureAuthenticated, adminsController.deleteAdmin);

module.exports = router;