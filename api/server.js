
const express = require('express');
const cors = require('cors');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api', (req, res) => {
    res.json({
        message: 'API Dex fonctionnelle !'
    });
});

const coursRoutes = require('./routes/cours');
app.use('/api/cours', coursRoutes);

const travauxRoutes = require('./routes/travaux');
app.use('/api/travaux', travauxRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`API Dex démarrée sur http://localhost:${PORT}`);
});
