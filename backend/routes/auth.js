const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/authMiddleware');

router.get('/login', redirectIfAuthenticated, authController.renderLoginPage);
router.post('/login', authController.processLogin);
router.get('/logout', authController.logout);

module.exports = router;