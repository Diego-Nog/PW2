const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    level: { 
        type: String, 
        enum: ['error', 'info'], 
        required: true 
    },
    action: { 
        type: String, 
        required: true 
    },
    error_details: { 
        type: mongoose.Schema.Types.Mixed // Permite guardar objetos o texto libre
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('SystemLog', systemLogSchema);