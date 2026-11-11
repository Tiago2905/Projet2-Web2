
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = require('../db');
const { jetons, DUREE_JETON } = require('../tokens');

const router = express.Router();

// CONNEXION D'UN PROFESSEUR
router.post('/connexion', async (req, res) => {
    try {
        const { identifiant, motDePasse } = req.body;

        // Vérifier les champs reçus
        if (!identifiant || !motDePasse) {
            return res.status(400).json({
                erreurs: ['Identifiant et mot de passe requis.']
            });
        }

        // Rechercher le professeur dans la base de données
        const [resultats] = await db.execute(
            `SELECT id, identifiant, mot_de_passe_hache, nom
             FROM utilisateurs
             WHERE identifiant = ?`,
            [identifiant]
        );

        if (resultats.length === 0) {
            return res.status(401).json({
                erreurs: ['Identifiant ou mot de passe incorrect.']
            });
        }

        const professeur = resultats[0];

        // Comparer le mot de passe avec son hash
        const motDePasseValide = await bcrypt.compare(
            motDePasse,
            professeur.mot_de_passe_hache
        );

        if (!motDePasseValide) {
            return res.status(401).json({
                erreurs: ['Identifiant ou mot de passe incorrect.']
            });
        }

        // Générer un jeton unique
        const jeton = crypto.randomUUID();

        const utilisateur = {
            id: professeur.id,
            identifiant: professeur.identifiant,
            nom: professeur.nom
        };

        // Enregistrer le jeton et sa date d'expiration
        jetons.set(jeton, {
            utilisateur,
            expireA: Date.now() + DUREE_JETON
        });

        return res.status(200).json({
            jeton,
            utilisateur
        });

    } catch (erreur) {
        console.error(erreur);

        return res.status(500).json({
            erreurs: ['Une erreur est survenue sur le serveur.']
        });
    }
});


// DÉCONNEXION D'UN PROFESSEUR
router.post('/deconnexion', (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            erreurs: ['Jeton absent ou invalide.']
        });
    }

    const jeton = authorization.split(' ')[1];

    if (!jetons.has(jeton)) {
        return res.status(401).json({
            erreurs: ['Jeton absent ou invalide.']
        });
    }

    // Supprimer le jeton
    jetons.delete(jeton);

    return res.status(204).send();
});

module.exports = router;
