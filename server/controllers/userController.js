const User = require('../models/User'); // Importamos el modelo (ORM)
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Registro de Usuario (CREATE)
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password_hash } = req.body;

        // 1. Validar que los campos no estén vacíos
        if (!username || !email || !password_hash) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // 2. Validar formato de email (Regex simple)
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Formato de email inválido" });
        }

        // 3. Verificar si el usuario ya existe (Consulta al ORM)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: "El usuario o email ya están registrados" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

        // Handle profile picture
        let profilePic = 'default_avatar.png';
        if (req.file) {
            profilePic = req.file.filename;
        }

        // Crear el nuevo usuario usando el ORM
        const newUser = new User({
            username,
            email,
            password_hash: hashedPassword,
            profile_pic: profilePic,
            is_admin: false
        });

        await newUser.save();

        res.status(201).json({ 
            message: "Usuario creado exitosamente",
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                profile_pic: newUser.profile_pic && newUser.profile_pic !== 'default_avatar.png' ? `/uploads/${newUser.profile_pic}` : null
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// Login de Usuario (AUTH / GET) - Actualizar para retornar perfil_pic con ruta completa
exports.loginUser = async (req, res) => {
    try {
        const { email, password_hash } = req.body;

        // Validaciones básicas de entrada
        if (!email || !password_hash) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }

        // Buscar al usuario mediante el ORM
        const user = await User.findOne({ email });

        // Validación de credenciales
        if (user && await bcrypt.compare(password_hash, user.password_hash)) {
            res.status(200).json({
                message: "Login exitoso",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile_pic: user.profile_pic && user.profile_pic !== 'default_avatar.png' ? `/uploads/${user.profile_pic}` : null,
                    is_admin: user.is_admin
                },
                token: "JWT_TOKEN_PENDIENTE" // Lo implementaremos en la siguiente fase
            });
        } else {
            res.status(401).json({ message: "Credenciales inválidas" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// Actualizar Usuario (UPDATE)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password_hash } = req.body;

        const updateData = { username, email };

        // Hash password if provided
        if (password_hash) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password_hash, saltRounds);
            updateData.password_hash = hashedPassword;
        }

        // Handle profile picture
        if (req.file) {
            updateData.profile_pic = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            message: "Usuario actualizado exitosamente",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profile_pic: updatedUser.profile_pic && updatedUser.profile_pic !== 'default_avatar.png' ? `/uploads/${updatedUser.profile_pic}` : null
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};

// Obtener todos los usuarios (admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '_id username email profile_pic is_admin');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// Eliminar un usuario (admin)
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};

exports.upload = upload;
