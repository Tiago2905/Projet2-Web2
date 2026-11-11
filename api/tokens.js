
const jetons = new Map();

// Durée de validité : 8 heures
const DUREE_JETON = 8 * 60 * 60 * 1000;

module.exports = {
    jetons,
    DUREE_JETON
};
