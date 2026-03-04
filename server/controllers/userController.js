const User = require('../models/User'); // Importamos el modelo (ORM)

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

        // Crear el nuevo usuario usando el ORM
        const newUser = new User({
            username,
            email,
            password_hash, // Nota: Más adelante usaremos bcrypt para encriptar
            is_admin: false
        });

        await newUser.save();

        res.status(201).json({ 
            message: "Usuario creado exitosamente",
            user: { id: newUser._id, username: newUser.username }
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// Login de Usuario (AUTH / GET)
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
        if (user && user.password_hash === password_hash) {
            res.status(200).json({
                message: "Login exitoso",
                user: {
                    id: user._id,
                    username: user.username,
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