const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect('TU_URI_DE_MONGODB_AQUÍ', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado a MongoDB Atlas'))
.catch(err => console.error('🔴 Error de conexión:', err));

// Esquema y modelo
const ScoreSchema = new mongoose.Schema({
    name: String,
    clicks: Number,
    createdAt: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

// Rutas
app.post('/save-score', async (req, res) => {
    const { name, clicks } = req.body;
    try {
        const newScore = new Score({ name, clicks });
        await newScore.save();
        res.status(201).json({ message: 'Puntaje guardado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar' });
    }
});

app.get('/scores', async (req, res) => {
    const scores = await Score.find().sort({ clicks: -1 }).limit(10);
    res.json(scores);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
