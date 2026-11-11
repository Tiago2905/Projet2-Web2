
const express = require('express');
const db = require('../db');
const verifierJeton = require('../middleware/auth');

const router = express.Router();

// MODIFIER UN CRÉNEAU
router.put('/:id', verifierJeton, async (req, res) => {
    try {
        const { id } = req.params;
        const { debut, fin } = req.body;

        if (!debut || !fin || new Date(fin) <= new Date(debut)) {
            return res.status(400).json({
                erreurs: ['Les dates du créneau sont invalides.']
            });
        }

        const [resultats] = await db.execute(
            `SELECT cr.id
             FROM creneaux cr
             INNER JOIN travaux t ON cr.travail_id = t.id
             INNER JOIN cours c ON t.cours_id = c.id
             WHERE cr.id = ? AND c.utilisateur_id = ?`,
            [id, req.utilisateur.id]
        );

        if (resultats.length === 0) {
            const [creneaux] = await db.execute(
                'SELECT id FROM creneaux WHERE id = ?',
                [id]
            );

            if (creneaux.length === 0) {
                return res.status(404).json({
                    erreurs: ['Créneau introuvable.']
                });
            }

            return res.status(403).json({
                erreurs: ['Vous ne pouvez pas modifier ce créneau.']
            });
        }

        await db.execute(
            `UPDATE creneaux
             SET debut = ?, fin = ?
             WHERE id = ?`,
            [debut, fin, id]
        );

        return res.status(200).json({
            message: 'Créneau modifié avec succès.'
        });

    } catch (erreur) {
        console.error(erreur);

        return res.status(500).json({
            erreurs: ['Une erreur est survenue sur le serveur.']
        });
    }
});

// SUPPRIMER UN CRÉNEAU
router.delete('/:id', verifierJeton, async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le créneau appartient au professeur
        const [resultats] = await db.execute(
            `SELECT cr.id
             FROM creneaux cr
             INNER JOIN travaux t ON cr.travail_id = t.id
             INNER JOIN cours c ON t.cours_id = c.id
             WHERE cr.id = ? AND c.utilisateur_id = ?`,
            [id, req.utilisateur.id]
        );

        if (resultats.length === 0) {
            const [creneaux] = await db.execute(
                'SELECT id FROM creneaux WHERE id = ?',
                [id]
            );

            if (creneaux.length === 0) {
                return res.status(404).json({
                    erreurs: ['Créneau introuvable.']
                });
            }

            return res.status(403).json({
                erreurs: ['Vous ne pouvez pas supprimer ce créneau.']
            });
        }

        // Supprimer le créneau
        await db.execute(
            'DELETE FROM creneaux WHERE id = ?',
            [id]
        );

        return res.status(204).send();

    } catch (erreur) {
        console.error(erreur);

        return res.status(500).json({
            erreurs: ['Une erreur est survenue sur le serveur.']
        });
    }
});

module.exports = router;
