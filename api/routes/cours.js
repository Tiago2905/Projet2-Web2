
const express = require('express');
const router = express.Router();

const db = require('../db');

// GET : récupérer tous les cours
router.get('/', async (req, res) => {
    try {
        const [cours] = await db.query(`
            SELECT id, titre
            FROM cours
            ORDER BY id
        `);

        res.json(cours);

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            message: 'Erreur lors de la récupération des cours.'
        });
    }
});

module.exports = router;
