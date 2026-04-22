const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    game_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Game', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['jugado', 'pendiente de jugar', 'jugando'], // Estados válidos
        default: 'pendiente de jugar'
    }
}, { timestamps: true });

librarySchema.index({ user_id: 1, game_id: 1 }, { unique: true });

module.exports = mongoose.model('Library', librarySchema);