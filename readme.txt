1. Instalación de Dependencias
El proyecto está dividido en dos carpetas principales. Debes instalar las librerías en ambas:

Client (Frontend):

cd client
npm install

Server (Backend):

cd server
npm install

2. Variables de Entorno
El archivo de configuración no se sube a GitHub por seguridad. Debes crearlo manualmente:

Crea un archivo llamado .env dentro de la carpeta /server.

Copia y pega el siguiente contenido:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gamesense_db

3. Base de Datos
Asegúrate de tener instalado MongoDB Compass.

Crea una base de datos llamada gamesense_db para que coincida con tu configuración local.

4. Ejecución del Proyecto
Para trabajar en el desarrollo, abre dos terminales:

Terminal 1 (Frontend):

cd client
npm run dev

Terminal 2 (Backend):

cd server
node index.js