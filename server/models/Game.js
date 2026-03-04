const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    developer: { 
        type: String, 
        required: true 
    },
    release_year: { 
        type: Number 
    },
    cover_url: { 
        type: String 
    },
    genre_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Genre', // Relación con la colección Genres
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);