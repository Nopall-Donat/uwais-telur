const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');

router.get('/', adminsController.getAllAdmins);

module.exports = router;
