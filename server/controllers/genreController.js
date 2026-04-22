const Genre = require('../models/Genre');

// Obtener todos los generos
exports.getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        res.status(200).json({ genres });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener generos', error: error.message });
    }
};

// Obtener un genero por ID
exports.getGenreById = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);

        if (!genre) {
            return res.status(404).json({ message: 'Genero no encontrado.' });
        }

        res.status(200).json({ genre });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el genero', error: error.message });
    }
};

// Crear un nuevo genero
exports.createGenre = async (req, res) => {
    try {
        const { name, description, tags } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'El nombre del genero es obligatorio.' });
        }

        const exists = await Genre.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: 'Ya existe un genero con ese nombre.' });
        }

        const genre = new Genre({ name, description, tags });
        await genre.save();

        res.status(201).json({ message: 'Genero creado exitosamente', genre });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el genero', error: error.message });
    }
};

// Actualizar un genero existente
exports.updateGenre = async (req, res) => {
    try {
        const { name, description, tags } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'El nombre del genero es obligatorio.' });
        }

        const exists = await Genre.findOne({ name, _id: { $ne: req.params.id } });
        if (exists) {
            return res.status(400).json({ message: 'Ya existe un genero con ese nombre.' });
        }

        const updatedGenre = await Genre.findByIdAndUpdate(
            req.params.id,
            { name, description, tags },
            { new: true, runValidators: true }
        );

        if (!updatedGenre) {
            return res.status(404).json({ message: 'Genero no encontrado.' });
        }

        res.status(200).json({ message: 'Genero actualizado exitosamente', genre: updatedGenre });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el genero', error: error.message });
    }
};

// Eliminar un genero por ID
exports.deleteGenre = async (req, res) => {
    try {
        const deletedGenre = await Genre.findByIdAndDelete(req.params.id);

        if (!deletedGenre) {
            return res.status(404).json({ message: 'Genero no encontrado.' });
        }

        res.status(200).json({ message: 'Genero eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el genero', error: error.message });
    }
};