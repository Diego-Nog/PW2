const Game = require('../models/Game'); // Importamos el ORM para Games
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// 1. Obtener todos los juegos (Read All)
exports.getAllGames = async (req, res) => {
    try {
        // Usamos el ORM para obtener la lista y "popular" el nombre del género
        const games = await Game.find().populate('genre_id', 'name');
        
        res.status(200).json({
            count: games.length,
            games: games
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los juegos", error: error.message });
    }
};

// 2. Obtener un juego específico (Read One)
exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate('genre_id');
        
        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: "ID de juego inválido o error de servidor", error: error.message });
    }
};

// 3. Crear un nuevo juego (Create - Solo Admin sugerido)
exports.createGame = async (req, res) => {
    try {
        const { title, developer, release_year, genre_id } = req.body;
        const cover_url = req.file ? `/uploads/${req.file.filename}` : req.body.cover_url;

        // --- VALIDACIONES INDEPENDIENTES (Rúbrica) ---
        if (!title || !developer || !genre_id) {
            return res.status(400).json({ message: "Título, Desarrollador y Género son campos obligatorios" });
        }

        // Validación de año lógica
        const parsedReleaseYear = release_year ? parseInt(release_year, 10) : undefined;
        const currentYear = new Date().getFullYear();
        if (parsedReleaseYear && (parsedReleaseYear < 1950 || parsedReleaseYear > currentYear + 5)) {
            return res.status(400).json({ message: "El año de lanzamiento no es válido" });
        }

        // Crear instancia con el ORM
        const newGame = new Game({
            title,
            developer,
            release_year: parsedReleaseYear,
            cover_url,
            genre_id
        });

        await newGame.save();

        res.status(201).json({
            message: "Juego agregado al catálogo exitosamente",
            game: newGame
        });

    } catch (error) {
        res.status(500).json({ message: "Error al crear el juego", error: error.message });
    }
};

// 4. Actualizar un juego existente (Update)
exports.updateGame = async (req, res) => {
    try {
        const { title, developer, release_year, genre_id } = req.body;
        const cover_url = req.file ? `/uploads/${req.file.filename}` : req.body.cover_url;

        if (!title || !developer || !genre_id) {
            return res.status(400).json({ message: "Título, Desarrollador y Género son campos obligatorios" });
        }

        const parsedReleaseYear = release_year ? parseInt(release_year, 10) : undefined;
        const currentYear = new Date().getFullYear();
        if (parsedReleaseYear && (parsedReleaseYear < 1950 || parsedReleaseYear > currentYear + 5)) {
            return res.status(400).json({ message: "El año de lanzamiento no es válido" });
        }

        const updatedGame = await Game.findByIdAndUpdate(
            req.params.id,
            { title, developer, release_year: parsedReleaseYear, cover_url, genre_id },
            { new: true, runValidators: true }
        );

        if (!updatedGame) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        res.status(200).json({
            message: "Juego actualizado exitosamente",
            game: updatedGame
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el juego", error: error.message });
    }
};

// 5. Eliminar un juego (Delete)
exports.deleteGame = async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);

        if (!deletedGame) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        res.status(200).json({ message: "Juego eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el juego", error: error.message });
    }
};

exports.upload = upload;