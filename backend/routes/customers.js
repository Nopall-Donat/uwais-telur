const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get('/', customersController.getAllCustomers);

module.exports = router;
