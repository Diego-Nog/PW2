const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password_hash: { 
        type: String, 
        required: true 
    },
    profile_pic: { 
        type: String, 
        default: 'default_avatar.png' 
    },
    token: { 
        type: String,
        default: ""
    },
    is_admin: { 
        type: Boolean, 
        default: false // Por defecto los usuarios normales no serán admin
    }
}, {
    // Esto es un extra profesional: guarda automáticamente la fecha de creación y actualización
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);