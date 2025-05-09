// Importamos los módulos necesarios
const express = require('express');   // Framework para crear el servidor
const mongoose = require('mongoose'); // ODM para interactuar con MongoDB
const cors = require('cors');         // Permite peticiones desde otros orígenes (como un frontend en otro puerto)

// Inicializamos la app de Express y definimos el puerto
const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARES
// ===============================

// Habilita CORS (Cross-Origin Resource Sharing) para que el frontend pueda comunicarse con este servidor
app.use(cors());

// Permite que el servidor entienda solicitudes JSON
app.use(express.json());

// Sirve archivos estáticos desde la carpeta 'public' (ej. index.html, style.css)
app.use(express.static('public'));

// ===============================
// CONEXIÓN A MONGODB ATLAS
// ===============================

mongoose.connect(
    'mongodb+srv://az4:tnt@tntchallenges.6fnnall.mongodb.net/TNTChallenges', // URI de tu clúster y base de datos
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => console.log('🟢 Conectado a MongoDB Atlas'))
.catch(err => console.error('🔴 Error de conexión:', err));

// ===============================
// DEFINICIÓN DEL MODELO DE USUARIO
// ===============================

// Esquema (estructura de los datos que se guardan en MongoDB)
const usuarioSchema = new mongoose.Schema({
    Usuario: String,
    Correo: String,
    Puntaje: Number,
    Contrasena: String,
    createdAt: { type: Date, default: Date.now } // Fecha de creación automática
});

// Modelo que se usará para interactuar con la colección 'usuarios'
const Usuario = mongoose.model('Usuario', usuarioSchema);

// ===============================
// RUTAS DE LA API
// ===============================

/**
 * POST /save-score
 * Guarda un nuevo usuario con su puntaje.
 * Espera un JSON como:
 * {
 *   "Usuario": "Juan",
 *   "Correo": "juan@mail.com",
 *   "Puntaje": 50,
 *   "Contrasena": "1234"
 * }
 */
app.post('/save-score', async (req, res) => {
    // Extraemos los datos del cuerpo de la solicitud
    const { Usuario: nombre, Correo, Puntaje, Contrasena } = req.body;

    // Validamos que no falten datos
    if (!nombre || !Correo || Puntaje == null || !Contrasena) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        // Creamos un nuevo documento con los datos recibidos
        const nuevoUsuario = new Usuario({ Usuario: nombre, Correo, Puntaje, Contrasena });
        await nuevoUsuario.save(); // Guardamos en MongoDB
        res.status(201).json({ message: 'Puntaje guardado exitosamente' });
    } catch (err) {
        console.error('Error al guardar:', err);
        res.status(500).json({ error: 'Error al guardar el puntaje' });
    }
});

/**
 * GET /scores
 * Devuelve los 10 usuarios con mayor puntaje (ordenados de mayor a menor)
 */
app.get('/scores', async (req, res) => {
    try {
        const scores = await Usuario.find().sort({ Puntaje: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener puntajes' });
    }
});

/**
 * GET /ver-usuarios
 * Devuelve todos los usuarios registrados (sin filtro)
 */
app.get('/ver-usuarios', async (req, res) => {
    try {
        const datos = await Usuario.find();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ===============================
// INICIAR EL SERVIDOR
// ===============================

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

 // Agrega esta ruta en tu server.js
app.post('/login', async (req, res) => {
    const { Usuario: nombreUsuario, Contrasena } = req.body;

    try {
        // Aquí usamos el modelo Usuario (Mongoose) sin sobrescribirlo
        const usuario = await Usuario.findOne({ Usuario: nombreUsuario });

        console.log("Datos recibidos:", req.body);
        console.log('Buscando usuario:', nombreUsuario);
        console.log('Resultado de búsqueda:', usuario);

        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.Contrasena !== Contrasena) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso' });

    } catch (err) {
        console.error("Error en /login:", err.message, err.stack);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


