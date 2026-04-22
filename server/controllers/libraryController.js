const Library = require('../models/Library');

exports.addToLibrary = async (req, res) => {
  try {
    const { user_id, game_id, status } = req.body;

    if (!user_id || !game_id) {
      return res.status(400).json({ message: 'user_id y game_id son obligatorios' });
    }

    const entry = await Library.create({
      user_id,
      game_id,
      status: status || 'pendiente de jugar'
    });

    return res.status(201).json({
      message: 'Juego agregado a tu biblioteca',
      library: entry
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ese juego ya esta en tu biblioteca' });
    }

    return res.status(500).json({ message: 'Error al agregar a biblioteca', error: error.message });
  }
};

exports.getUserLibrary = async (req, res) => {
  try {
    const { userId } = req.params;

    const library = await Library.find({ user_id: userId })
      .populate('game_id')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: library.length,
      library
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener biblioteca', error: error.message });
  }
};

exports.updateLibraryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'El estado es obligatorio' });
    }

    const updatedEntry = await Library.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('game_id');

    if (!updatedEntry) {
      return res.status(404).json({ message: 'Registro de biblioteca no encontrado' });
    }

    return res.status(200).json({
      message: 'Estado actualizado correctamente',
      library: updatedEntry
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
  }
};

exports.removeFromLibrary = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await Library.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: 'Registro de biblioteca no encontrado' });
    }

    return res.status(200).json({ message: 'Juego eliminado de tu biblioteca' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar de biblioteca', error: error.message });
  }
};
