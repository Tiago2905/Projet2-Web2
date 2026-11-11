
const express = require('express');
const db = require('../db');
const verifierJeton = require('../middleware/auth');

const router = express.Router();

// Lister les travaux du professeur connecté
router.get('/travaux', verifierJeton, async (req, res) => {
    try {
        const [travaux] = await db.execute(
            `SELECT t.*
             FROM travaux t
             INNER JOIN cours c ON t.cours_id = c.id
             WHERE c.utilisateur_id = ?`,
            [req.utilisateur.id]
        );

        return res.status(200).json(travaux);

    } catch (erreur) {
        console.error(erreur);

        return res.status(500).json({
            erreurs: ['Une erreur est survenue sur le serveur.']
        });
    }
});

module.exports = router;
