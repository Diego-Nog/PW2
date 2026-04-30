const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Ruta: POST /api/users/register
router.post('/register', userController.upload.single('profile_pic'), userController.registerUser);

// Ruta: POST /api/users/login
router.post('/login', userController.loginUser);

router.use(authenticateToken);

// Ruta: GET /api/users (listar todos - admin)
router.get('/', requireAdmin, userController.getAllUsers);

// Ruta: PUT /api/users/:id
router.put('/:id', userController.upload.single('profile_pic'), userController.updateUser);

// Ruta: DELETE /api/users/:id (eliminar usuario - admin)
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;