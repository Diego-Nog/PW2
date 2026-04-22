const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a MongoDB');

        const existing = await User.findOne({ username: 'admin' });
        if (existing) {
            console.log('El usuario admin ya existe. No se creó uno nuevo.');
            process.exit(0);
        }

        const password_hash = await bcrypt.hash('Admin1234!', 10);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@gamesense.com',
            password_hash,
            is_admin: true
        });

        await adminUser.save();
        console.log('Usuario administrador creado correctamente:');
        console.log('  Username : admin');
        console.log('  Email    : admin@gamesense.com');
        console.log('  Password : Admin1234!');
        console.log('  is_admin : true');
    } catch (error) {
        console.error('Error al crear el admin:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
