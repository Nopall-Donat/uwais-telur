const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliersController');

router.get('/', suppliersController.getAllSuppliers);

module.exports = router;
