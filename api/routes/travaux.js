
const express = require('express');
const router = express.Router();

const db = require('../db');

// GET : récupérer les travaux ouverts
router.get('/', async (req, res) => {
    try {
        const { cours_id } = req.query;

        let sql = `
            SELECT id, cours_id, titre, description,
                   type, disponible, remise, ouvert
            FROM travaux
            WHERE ouvert = TRUE
        `;

        const parametres = [];

        // Filtrer par cours si un cours_id est fourni
        if (cours_id) {
            sql += ' AND cours_id = ?';
            parametres.push(cours_id);
        }

        sql += ' ORDER BY remise ASC';

        const [travaux] = await db.execute(sql, parametres);

        res.json(travaux);

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            message: 'Erreur lors de la récupération des travaux.'
        });
    }
});

// GET : récupérer un travail précis avec ses créneaux
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [travaux] = await db.execute(
            `SELECT id, cours_id, titre, description,
                    type, disponible, remise, ouvert
             FROM travaux
             WHERE id = ?`,
            [id]
        );

        if (travaux.length === 0) {
            return res.status(404).json({
                message: 'Travail introuvable.'
            });
        }

        const [creneaux] = await db.execute(
            `SELECT id, travail_id, debut, fin
             FROM creneaux
             WHERE travail_id = ?
             ORDER BY debut ASC`,
            [id]
        );

        res.json({
            ...travaux[0],
            creneaux
        });

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            message: 'Erreur lors de la récupération du travail.'
        });
    }
});


// GET : récupérer les disponibilités d'un travail
router.get('/:id/disponibilites', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le travail existe
        const [travaux] = await db.execute(
            'SELECT id FROM travaux WHERE id = ?',
            [id]
        );

        if (travaux.length === 0) {
            return res.status(404).json({
                message: 'Travail introuvable.'
            });
        }

        // Récupérer les créneaux et les étudiants disponibles
        const [resultats] = await db.execute(`
            SELECT
                c.id,
                c.debut,
                c.fin,
                d.matricule,
                d.nom
            FROM creneaux c
            LEFT JOIN disponibilites d
                ON d.creneau_id = c.id
                AND d.travail_id = c.travail_id
            WHERE c.travail_id = ?
            ORDER BY c.debut ASC, d.nom ASC
        `, [id]);

        // Regrouper les étudiants par créneau
        const creneaux = {};

        resultats.forEach(ligne => {
            if (!creneaux[ligne.id]) {
                creneaux[ligne.id] = {
                    id: ligne.id,
                    debut: ligne.debut,
                    fin: ligne.fin,
                    nombre_etudiants: 0,
                    noms: []
                };
            }

            if (ligne.matricule !== null) {
                creneaux[ligne.id].nombre_etudiants++;
                creneaux[ligne.id].noms.push(ligne.nom);
            }
        });

        res.json(Object.values(creneaux));

    } catch (erreur) {
        console.error(erreur);

        res.status(500).json({
            message: 'Erreur lors de la récupération des disponibilités.'
        });
    }
});


// PUT : remplacer les disponibilités d'un étudiant
router.put('/:id/disponibilites/:matricule', async (req, res) => {
    const { id, matricule } = req.params;
    const { nom, creneaux } = req.body;

    // Vérifier les données reçues
    if (
        typeof nom !== 'string' ||
        !nom.trim() ||
        !Array.isArray(creneaux) ||
        !creneaux.every(c => typeof c === 'string' && c.trim())
    ) {
        return res.status(400).json({
            message: 'Nom ou créneaux invalides.'
        });
    }

    // Éviter les créneaux en double
    const creneauxUniques = [...new Set(creneaux)];

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Vérifier que le travail existe
        const [travaux] = await connection.execute(
            'SELECT id FROM travaux WHERE id = ?',
            [id]
        );

        if (travaux.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: 'Travail introuvable.'
            });
        }

        // Vérifier que les créneaux appartiennent au travail
        if (creneauxUniques.length > 0) {
            const placeholders = creneauxUniques.map(() => '?').join(',');

            const [creneauxValides] = await connection.execute(
                `SELECT id FROM creneaux
                 WHERE travail_id = ?
                 AND id IN (${placeholders})`,
                [id, ...creneauxUniques]
            );

            if (creneauxValides.length !== creneauxUniques.length) {
                await connection.rollback();

                return res.status(400).json({
                    message: 'Un ou plusieurs créneaux sont invalides.'
                });
            }
        }

        // Supprimer les anciennes disponibilités
        await connection.execute(
            `DELETE FROM disponibilites
             WHERE travail_id = ? AND matricule = ?`,
            [id, matricule]
        );

        // Insérer les nouvelles disponibilités
        if (creneauxUniques.length > 0) {
            const valeurs = creneauxUniques
                .map(() => '(?, ?, ?, ?)')
                .join(', ');

            const parametres = creneauxUniques.flatMap(creneau => [
                id,
                creneau,
                matricule,
                nom.trim()
            ]);

            await connection.execute(
                `INSERT INTO disponibilites
                 (travail_id, creneau_id, matricule, nom)
                 VALUES ${valeurs}`,
                parametres
            );
        }

        await connection.commit();

        res.json({
            message: 'Disponibilités enregistrées avec succès.',
            travail_id: id,
            matricule: matricule,
            nom: nom.trim(),
            creneaux: creneauxUniques
        });

    } catch (erreur) {
        await connection.rollback();

        console.error(erreur);

        res.status(500).json({
            message: 'Erreur lors de l’enregistrement des disponibilités.'
        });

    } finally {
        connection.release();
    }
});


module.exports = router;
