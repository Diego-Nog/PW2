const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta: POST /api/users/register
router.post('/register', userController.registerUser);

// Ruta: POST /api/users/login
router.post('/login', userController.loginUser);

module.exports = router;