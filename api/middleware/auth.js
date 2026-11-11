
const { jetons } = require('../tokens');

function verifierJeton(req, res, next) {
    const authorization = req.headers.authorization;

    // Vérifier la présence du jeton
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            erreurs: ['Jeton absent ou invalide.']
        });
    }

    const jeton = authorization.split(' ')[1];

    // Vérifier si le jeton existe
    const session = jetons.get(jeton);

    if (!session) {
        return res.status(401).json({
            erreurs: ['Jeton absent ou invalide.']
        });
    }

    // Vérifier si le jeton est expiré
    if (Date.now() > session.expireA) {
        jetons.delete(jeton);

        return res.status(401).json({
            erreurs: ['Jeton expiré.']
        });
    }

    // Rendre l'utilisateur accessible aux routes protégées
    req.utilisateur = session.utilisateur;

    next();
}

module.exports = verifierJeton;
