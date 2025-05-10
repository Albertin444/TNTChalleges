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
    console.log('Petición recibida en /save-score');
    const { Usuario: usuario, Puntaje } = req.body;

    try {
        // Busca el usuario en la base de datos
        const user = await Usuario.findOne({ Usuario: usuario });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Solo actualiza si el puntaje recibido es mayor que el almacenado
        if (Puntaje > user.Puntaje) {
            user.Puntaje = Puntaje;
            await user.save();
            return res.status(200).json({ success: true, message: 'Puntaje actualizado' });
        } else {
            return res.status(400).json({ success: false, message: 'El puntaje no es mayor que el actual' });
        }

    } catch (error) {
        console.error('Error al actualizar el puntaje:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar puntaje' });
    }
});



app.post('/register', async (req, res) => {
    const { Usuario: nombre, Correo, Puntaje, Contrasena } = req.body;

    console.log(req.body);  // Agrega esto para ver lo que llega del frontend

    if (!nombre || !Correo || Puntaje == null || !Contrasena) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const nuevoUsuario = new Usuario({
            nombre,
            Correo,
            Contrasena,
            Puntaje: 0, // Puntaje inicial
        });

        await nuevoUsuario.save();// Guardamos en MongoDB
        res.status(200).json({ success: true, message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
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

app.get('/get-session', (req, res) => {
    res.json({ user: req.session.user || null });
});


app.post('/update-score', async (req, res) => {
    const { Usuario, Puntaje } = req.body;

    if (!Usuario || Puntaje == null) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const user = await Usuario.findOne({ Usuario });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Solo actualiza si el nuevo puntaje es mayor
        if (Puntaje > user.Puntaje) {
            user.Puntaje = Puntaje;
            await user.save();
        }

        res.json({ ok: true, message: 'Puntaje actualizado' });

    } catch (err) {
        console.error('Error al actualizar puntaje:', err);
        res.status(500).json({ error: 'Error al actualizar el puntaje' });
    }
});

app.get('/scores/:usuario', async (req, res) => {
    const { usuario } = req.params;

    try {
        const user = await Usuario.findOne({ Usuario: usuario });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ Usuario: user.Usuario, Puntaje: user.Puntaje });
    } catch (err) {
        console.error('Error al buscar usuario:', err);
        res.status(500).json({ error: 'Error al obtener el puntaje' });
    }
});






