const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String 
    },
    tags: [{ 
        type: String 
    }] // Un arreglo de strings para las etiquetas
});

module.exports = mongoose.model('Genre', genreSchema);