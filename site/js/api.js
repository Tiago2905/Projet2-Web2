
// Récupérer tous les cours
async function obtenirCours() {
    const reponse = await fetch(`${API_URL}/cours`);

    if (!reponse.ok) {
        throw new Error('Impossible de récupérer les cours.');
    }

    return await reponse.json();
}

// Récupérer les travaux
async function obtenirTravaux(cours = null) {
    let url = `${API_URL}/travaux`;

    if (cours) {
        url += `?cours=${encodeURIComponent(cours)}`;
    }

    const reponse = await fetch(url);

    if (!reponse.ok) {
        throw new Error('Impossible de récupérer les travaux.');
    }

    return await reponse.json();
}

// Récupérer un travail précis
async function obtenirTravail(id) {
    const reponse = await fetch(`${API_URL}/travaux/${id}`);

    if (!reponse.ok) {
        throw new Error('Impossible de récupérer ce travail.');
    }

    return await reponse.json();
}

// Récupérer les disponibilités d'un travail
async function obtenirDisponibilites(id) {
    const response = await fetch(
        `${API_URL}/travaux/${id}/disponibilites`
    );

    if (!response.ok) {
        throw new Error('Impossible de récupérer les disponibilités.');
    }

    return await response.json();
}

// Enregistrer les disponibilités d'un étudiant
async function enregistrerDisponibilitesAPI(id, matricule, donnees) {
    const reponse = await fetch(
        `${API_URL}/travaux/${id}/disponibilites/${matricule}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donnees)
        }
    );

    const resultat = await reponse.json();

    if (!reponse.ok) {
        throw new Error(
            resultat.erreurs?.join(', ') ||
            "Impossible d'enregistrer les disponibilités."
        );
    }

    return resultat;
}

window.obtenirTravail = obtenirTravail;
window.obtenirDisponibilites = obtenirDisponibilites;
window.enregistrerDisponibilitesAPI = enregistrerDisponibilitesAPI;