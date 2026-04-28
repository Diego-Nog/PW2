const Game = require('../models/Game'); // Importamos el ORM para Games
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { isServerless, uploadImage } = require('../utils/imageStorage');

const storage = isServerless
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        }
    });

const upload = multer({ storage });

const isTruthy = (value) => value === true || value === 'true';

const sanitizeUserId = (value) => {
    if (value === undefined || value === null) return null;

    const normalized = String(value).trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') return null;

    return normalized;
};

const buildGamesFilter = (query) => {
    const filter = {};
    const includePending = isTruthy(query.include_pending);
    const includeRejected = isTruthy(query.include_rejected);
    const onlyPending = isTruthy(query.only_pending);

    if (onlyPending) {
        // Solo pendientes
        filter.approval_status = 'pending';
    } else if (includePending && includeRejected) {
        // Todos los estados (admin o usuario viendo sus propios juegos)
        // Sin filtro de status
    } else if (includePending) {
        // Aprobados + pendientes (sin rechazados)
        filter.approval_status = { $in: ['approved', 'pending'] };
    } else {
        // Default: SOLO aprobados (dashboard público / Home)
        filter.approval_status = 'approved';
    }

    if (query.created_by) {
        filter.created_by = query.created_by;
    }

    return filter;
};

// 1. Obtener todos los juegos (Read All)
exports.getAllGames = async (req, res) => {
    try {
        const filter = buildGamesFilter(req.query);

        // Usamos el ORM para obtener la lista y "popular" el nombre del género
        const games = await Game.find(filter)
            .populate('genre_id', 'name')
            .populate('created_by', 'username');
        
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
        const game = await Game.findById(req.params.id)
            .populate('genre_id')
            .populate('created_by', 'username');
        
        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        if (game.approval_status !== 'approved') {
            const requesterIsAdmin = isTruthy(req.query.is_admin);
            const requesterUserId = req.query.user_id;
            const ownerId = game.created_by?._id ? game.created_by._id.toString() : game.created_by?.toString();

            if (!requesterIsAdmin && (!requesterUserId || ownerId !== requesterUserId)) {
                return res.status(403).json({ message: "Este juego no esta disponible publicamente" });
            }
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
        const uploadedCoverUrl = req.file ? await uploadImage(req.file, 'gamesense/game-covers') : null;
        const cover_url = uploadedCoverUrl || req.body.cover_url;
        const requesterIsAdmin = isTruthy(req.body.is_admin);
        const requesterUserId = sanitizeUserId(req.body.user_id);

        // --- VALIDACIONES INDEPENDIENTES (Rúbrica) ---
        if (!title || !developer || !genre_id) {
            return res.status(400).json({ message: "Título, Desarrollador y Género son campos obligatorios" });
        }

        if (!requesterIsAdmin && !requesterUserId) {
            return res.status(400).json({ message: "user_id es obligatorio para crear juegos" });
        }

        if (requesterUserId && !mongoose.Types.ObjectId.isValid(requesterUserId)) {
            return res.status(400).json({ message: "user_id no es valido" });
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
            genre_id,
            created_by: requesterIsAdmin ? (requesterUserId || null) : requesterUserId,
            approval_status: requesterIsAdmin ? 'approved' : 'pending'
        });

        await newGame.save();

        res.status(201).json({
            message: requesterIsAdmin
                ? "Juego agregado al catálogo exitosamente"
                : "Juego enviado y marcado como pendiente de aprobacion",
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
        const uploadedCoverUrl = req.file ? await uploadImage(req.file, 'gamesense/game-covers') : null;
        const cover_url = uploadedCoverUrl || req.body.cover_url;
        const requesterIsAdmin = isTruthy(req.body.is_admin);
        const requesterUserId = sanitizeUserId(req.body.user_id);

        if (!title || !developer || !genre_id) {
            return res.status(400).json({ message: "Título, Desarrollador y Género son campos obligatorios" });
        }

        const parsedReleaseYear = release_year ? parseInt(release_year, 10) : undefined;
        const currentYear = new Date().getFullYear();
        if (parsedReleaseYear && (parsedReleaseYear < 1950 || parsedReleaseYear > currentYear + 5)) {
            return res.status(400).json({ message: "El año de lanzamiento no es válido" });
        }

        const existingGame = await Game.findById(req.params.id);

        if (!existingGame) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        if (!requesterIsAdmin) {
            if (!requesterUserId) {
                return res.status(400).json({ message: "user_id es obligatorio para actualizar" });
            }

            if (!mongoose.Types.ObjectId.isValid(requesterUserId)) {
                return res.status(400).json({ message: "user_id no es valido" });
            }

            if (!existingGame.created_by || existingGame.created_by.toString() !== requesterUserId) {
                return res.status(403).json({ message: "No tienes permiso para editar este juego" });
            }
        }

        const updateData = {
            title,
            developer,
            release_year: parsedReleaseYear,
            cover_url,
            genre_id,
            approval_status: requesterIsAdmin
                ? (req.body.approval_status || existingGame.approval_status || 'approved')
                : (resolveApprovalStatus(existingGame) || 'pending')
        };

        const updatedGame = await Game.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

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
        const requesterIsAdmin = isTruthy(req.query.is_admin) || isTruthy(req.body?.is_admin);
        const requesterUserId = sanitizeUserId(req.query.user_id || req.body?.user_id);
        const targetGame = await Game.findById(req.params.id);

        if (!targetGame) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        if (!requesterIsAdmin) {
            if (!requesterUserId) {
                return res.status(400).json({ message: "user_id es obligatorio para eliminar" });
            }

            if (!mongoose.Types.ObjectId.isValid(requesterUserId)) {
                return res.status(400).json({ message: "user_id no es valido" });
            }

            if (!targetGame.created_by || targetGame.created_by.toString() !== requesterUserId) {
                return res.status(403).json({ message: "No tienes permiso para eliminar este juego" });
            }
        }

        const deletedGame = await Game.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Juego eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el juego", error: error.message });
    }
};

// 6. Aprobar un juego pendiente (Solo Admin)
exports.approveGame = async (req, res) => {
    try {
        if (!isTruthy(req.body.is_admin)) {
            return res.status(403).json({ message: "Solo un administrador puede aprobar juegos" });
        }

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        game.approval_status = 'approved';
        await game.save();

        res.status(200).json({
            message: 'Juego aprobado exitosamente',
            game
        });
    } catch (error) {
        res.status(500).json({ message: "Error al aprobar el juego", error: error.message });
    }
};

// 7. Rechazar un juego (Solo Admin)
exports.rejectGame = async (req, res) => {
    try {
        if (!isTruthy(req.body.is_admin)) {
            return res.status(403).json({ message: "Solo un administrador puede rechazar juegos" });
        }

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({ message: "Juego no encontrado" });
        }

        game.approval_status = 'rejected';
        await game.save();

        res.status(200).json({
            message: 'Juego rechazado exitosamente',
            game
        });
    } catch (error) {
        res.status(500).json({ message: "Error al rechazar el juego", error: error.message });
    }
};

exports.upload = upload;