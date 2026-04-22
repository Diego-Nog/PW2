const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta: POST /api/users/register
router.post('/register', userController.upload.single('profile_pic'), userController.registerUser);

// Ruta: POST /api/users/login
router.post('/login', userController.loginUser);

// Ruta: GET /api/users (listar todos - admin)
router.get('/', userController.getAllUsers);

// Ruta: PUT /api/users/:id
router.put('/:id', userController.upload.single('profile_pic'), userController.updateUser);

// Ruta: DELETE /api/users/:id (eliminar usuario - admin)
router.delete('/:id', userController.deleteUser);

module.exports = router;