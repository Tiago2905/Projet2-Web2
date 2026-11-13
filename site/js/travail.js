
const { createApp } = Vue;

// Récupérer l'identifiant dans l'URL
const parametres = new URLSearchParams(window.location.search);
const id = parametres.get('id');

createApp({
    data() {
        return {
            travail: null,
            creneaux: [],
            erreur: '',

            matricule: '',
            nom: '',
            creneauxSelectionnes: [],
            message: ''
        };
    },

    async mounted() {
    try {
        // Vérifier si l'identifiant est présent
        if (!id) {
            throw new Error('Identifiant du travail manquant.');
        }

        // Récupérer les informations du travail
        this.travail = await obtenirTravail(id);

        // Récupérer les créneaux du travail
        this.creneaux = await obtenirDisponibilites(id);

        this.matricule = localStorage.getItem('dexapp_matricule') || '';
        this.nom = localStorage.getItem('dexapp_nom') || '';

        const selections = localStorage.getItem(`dexapp_creneaux_${id}`);

        if (selections) {
            this.creneauxSelectionnes = JSON.parse(selections);
        }

    } catch (erreur) {
        this.erreur = erreur.message;
        console.error(erreur);
    }
},

// Méthodes de l'application
    methods: {

        async enregistrerDisponibilites() {

            this.message = '';

            // Vérifier le matricule et le nom
            if (!this.matricule.trim() || !this.nom.trim()) {
                this.message =
                    'Veuillez remplir votre matricule et votre nom.';
                return;
            }

            // Vérifier les créneaux sélectionnés
            if (this.creneauxSelectionnes.length === 0) {
                this.message =
                    'Veuillez sélectionner au moins un créneau.';
                return;
            }

            try {

                // Envoyer les données à l'API
                await window.enregistrerDisponibilitesAPI(
                    id,
                    this.matricule.trim(),
                    {
                        nom: this.nom.trim(),
                        creneaux: this.creneauxSelectionnes
                    }
                );

                // Sauvegarder les informations localement
                localStorage.setItem(
                    'dexapp_matricule',
                    this.matricule.trim()
                );

                localStorage.setItem(
                    'dexapp_nom',
                    this.nom.trim()
                );

                localStorage.setItem(
                    `dexapp_creneaux_${id}`,
                    JSON.stringify(this.creneauxSelectionnes)
                );

                // Afficher un message de confirmation
                this.message =
                    'Vos disponibilités ont été enregistrées avec succès !';

                // Actualiser les créneaux et le nombre d'étudiants
                this.creneaux = await window.obtenirDisponibilites(id);

            } catch (erreur) {

                this.message = erreur.message;
                console.error(erreur);

            }
        }
    },

    template: `
        <div>
            <p v-if="erreur">{{ erreur }}</p>

            <div v-else-if="!travail">
                Chargement du travail...
            </div>

            <div v-else>
                <h2>{{ travail.titre }}</h2>

                <p>{{ travail.description }}</p>

                <p>Type : {{ travail.type }}</p>

                <p>Date de disponibilité : {{ travail.disponible }}</p>

                <p>Date de remise : {{ travail.remise }}</p>

                <h3>Créneaux disponibles</h3>

                <div v-if="creneaux.length === 0">
                    Aucun créneau disponible.
                </div>

                <div v-else>
                    <ul>
                        <li v-for="creneau in creneaux" :key="creneau.id">
                            {{ creneau.debut }} - {{ creneau.fin }}
                            ({{ creneau.nombre_etudiants }} étudiants inscrits)
                        </li>
                    </ul>
                </div>

                    <h3>Inscription aux créneaux</h3>

                    <div>
                        <label for="matricule">Matricule :</label>
                        <input
                            type="text"
                            id="matricule"
                            v-model="matricule"
                            placeholder="Votre matricule"
                        >
                    </div>

                    <div>
                        <label for="nom">Nom :</label>
                        <input
                            type="text"
                            id="nom"
                            v-model="nom"
                            placeholder="Votre nom"
                        >
                    </div>

                    <h4>Choisissez vos créneaux :</h4>

                    <div v-for="creneau in creneaux" :key="creneau.id">
                        <label>
                            <input
                                type="checkbox"
                                :value="creneau.id"
                                v-model="creneauxSelectionnes"
                            >
                            {{ creneau.debut }} - {{ creneau.fin }}
                        </label>
                    </div>
                    
                    <button @click="enregistrerDisponibilites">Enregistrer mes disponibilités</button>
                    <p v-if="message">{{ message }}</p>
            </div>
        </div>
    `
}).mount('#app');
