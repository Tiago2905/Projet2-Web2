
const { createApp } = Vue;

function formaterDateInput(date) {
    return String(date).replace(' ', 'T').slice(0, 16);
}

createApp({
    data() {
        return {
            identifiant: '',
            motDePasse: '',
            erreur: '',
            chargement: false,
            jeton: sessionStorage.getItem('dexapp_jeton') || '',

            travaux: [],
            travailEnEdition: null,

            travailSelectionne: null,
            creneaux: [],
            nouveauCreneau: {
                debut: '',
                fin: ''
            },
            creneauEnEdition: null,

            message: ''
        };
    },

    async mounted() {
        if (this.jeton) {
            await this.chargerTravaux();
        }
    },

    methods: {
        // CONNEXION
        async seConnecter() {
            this.erreur = '';
            this.chargement = true;

            try {
                const reponse = await fetch(`${API_URL}/connexion`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        identifiant: this.identifiant,
                        motDePasse: this.motDePasse
                    })
                });

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Identifiant ou mot de passe incorrect.'
                    );
                }

                this.jeton = resultat.jeton;

                sessionStorage.setItem(
                    'dexapp_jeton',
                    this.jeton
                );

                await this.chargerTravaux();

            } catch (erreur) {
                this.erreur = erreur.message;
            } finally {
                this.chargement = false;
            }
        },

        // CHARGER LES TRAVAUX
        async chargerTravaux() {
            this.erreur = '';

            try {
                const reponse = await fetch(
                    `${API_URL}/admin/travaux`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.jeton}`
                        }
                    }
                );

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Impossible de récupérer les travaux.'
                    );
                }

                this.travaux = resultat;

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // COMMENCER LA MODIFICATION D'UN TRAVAIL
        commencerModification(travail) {
            this.message = '';

            this.travailEnEdition = {
                id: travail.id,
                titre: travail.titre,
                description: travail.description,
                type: travail.type,
                disponible: formaterDateInput(travail.disponible),
                remise: formaterDateInput(travail.remise),
                ouvert: Boolean(Number(travail.ouvert))
            };
        },

        annulerModification() {
            this.travailEnEdition = null;
            this.message = '';
        },

        // ENREGISTRER LA MODIFICATION D'UN TRAVAIL
        async enregistrerModification() {
            this.erreur = '';
            this.message = '';

            try {
                const travail = this.travailEnEdition;

                const reponse = await fetch(
                    `${API_URL}/travaux/${travail.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.jeton}`
                        },
                        body: JSON.stringify({
                            titre: travail.titre,
                            description: travail.description,
                            type: travail.type,
                            disponible: travail.disponible,
                            remise: travail.remise,
                            ouvert: travail.ouvert
                        })
                    }
                );

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Impossible de modifier le travail.'
                    );
                }

                this.message = 'Travail modifié avec succès !';
                this.travailEnEdition = null;

                await this.chargerTravaux();

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // AFFICHER LES CRÉNEAUX D'UN TRAVAIL
        async gererCreneaux(travail) {
            this.erreur = '';
            this.message = '';
            this.travailSelectionne = travail;
            this.creneauEnEdition = null;

            this.nouveauCreneau = {
                debut: '',
                fin: ''
            };

            await this.chargerCreneaux();
        },

        async chargerCreneaux() {
            try {
                const reponse = await fetch(
                    `${API_URL}/travaux/${this.travailSelectionne.id}`
                );

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        resultat.message ||
                        'Impossible de récupérer les créneaux.'
                    );
                }

                this.creneaux = resultat.creneaux || [];

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // AJOUTER UN CRÉNEAU
        async ajouterCreneau() {
            this.erreur = '';
            this.message = '';

            try {
                const reponse = await fetch(
                    `${API_URL}/travaux/${this.travailSelectionne.id}/creneaux`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.jeton}`
                        },
                        body: JSON.stringify({
                            debut: this.nouveauCreneau.debut,
                            fin: this.nouveauCreneau.fin
                        })
                    }
                );

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Impossible d’ajouter le créneau.'
                    );
                }

                this.message = 'Créneau ajouté avec succès !';

                this.nouveauCreneau = {
                    debut: '',
                    fin: ''
                };

                await this.chargerCreneaux();

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // PRÉPARER LA MODIFICATION D'UN CRÉNEAU
        commencerModificationCreneau(creneau) {
            this.erreur = '';
            this.message = '';

            this.creneauEnEdition = {
                id: creneau.id,
                debut: formaterDateInput(creneau.debut),
                fin: formaterDateInput(creneau.fin)
            };
        },

        // ENREGISTRER LA MODIFICATION D'UN CRÉNEAU
        async enregistrerModificationCreneau() {
            this.erreur = '';
            this.message = '';

            try {
                const creneau = this.creneauEnEdition;

                const reponse = await fetch(
                    `${API_URL}/creneaux/${creneau.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.jeton}`
                        },
                        body: JSON.stringify({
                            debut: creneau.debut,
                            fin: creneau.fin
                        })
                    }
                );

                const resultat = await reponse.json();

                if (!reponse.ok) {
                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Impossible de modifier le créneau.'
                    );
                }

                this.message = 'Créneau modifié avec succès !';
                this.creneauEnEdition = null;

                await this.chargerCreneaux();

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // SUPPRIMER UN CRÉNEAU
        async supprimerCreneau(creneau) {
            this.erreur = '';
            this.message = '';

            try {
                // 1. Récupérer le nombre de réponses étudiantes
                const reponseInfo = await fetch(
                    `${API_URL}/creneaux/${creneau.id}/suppression-info`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.jeton}`
                        }
                    }
                );

                const info = await reponseInfo.json();

                if (!reponseInfo.ok) {
                    throw new Error(
                        info.erreurs?.join(' ') ||
                        'Impossible de vérifier les réponses associées.'
                    );
                }

                // 2. Demander confirmation avec le nombre de réponses
                const nombre = Number(info.nombreReponses);

                const confirmation = confirm(
                    `Voulez-vous vraiment supprimer ce créneau ?\n\n` +
                    `${nombre} réponse(s) étudiante(s) seront également supprimées.`
                );

                if (!confirmation) {
                    return;
                }

                // 3. Supprimer le créneau
                const reponse = await fetch(
                    `${API_URL}/creneaux/${creneau.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${this.jeton}`
                        }
                    }
                );

                if (!reponse.ok) {
                    const resultat = await reponse.json();

                    throw new Error(
                        resultat.erreurs?.join(' ') ||
                        'Impossible de supprimer le créneau.'
                    );
                }

                this.message = 'Créneau supprimé avec succès !';

                await this.chargerCreneaux();

            } catch (erreur) {
                this.erreur = erreur.message;
            }
        },

        // FERMER LA GESTION DES CRÉNEAUX
        fermerCreneaux() {
            this.travailSelectionne = null;
            this.creneaux = [];
            this.creneauEnEdition = null;
            this.message = '';
        },

        // DÉCONNEXION
        async seDeconnecter() {
            try {
                await fetch(`${API_URL}/deconnexion`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.jeton}`
                    }
                });
            } finally {
                sessionStorage.removeItem('dexapp_jeton');

                this.jeton = '';
                this.travaux = [];
                this.travailEnEdition = null;
                this.travailSelectionne = null;
                this.creneaux = [];
                this.identifiant = '';
                this.motDePasse = '';
            }
        }
    },

    template: `
        <div>
            <!-- CONNEXION -->
            <div v-if="!jeton">
                <h3>Connexion professeur</h3>

                <form @submit.prevent="seConnecter">
                    <div>
                        <label for="identifiant">Identifiant :</label>
                        <input
                            id="identifiant"
                            type="text"
                            v-model="identifiant"
                            required
                        >
                    </div>

                    <div>
                        <label for="motDePasse">Mot de passe :</label>
                        <input
                            id="motDePasse"
                            type="password"
                            v-model="motDePasse"
                            required
                        >
                    </div>

                    <button type="submit" :disabled="chargement">
                        {{ chargement ? 'Connexion...' : 'Se connecter' }}
                    </button>
                </form>
            </div>

            <!-- ADMINISTRATION -->
            <div v-else>
                <h3>Gestion des travaux</h3>

                <button @click="seDeconnecter">
                    Se déconnecter
                </button>

                <div v-for="travail in travaux" :key="travail.id">
                    <h4>{{ travail.titre }}</h4>

                    <p>{{ travail.description }}</p>
                    <p>Type : {{ travail.type }}</p>

                    <p>
                        Ouvert :
                        {{ travail.ouvert ? 'Oui' : 'Non' }}
                    </p>

                    <button @click="commencerModification(travail)">
                        Modifier le travail
                    </button>

                    <button @click="gererCreneaux(travail)">
                        Gérer les créneaux
                    </button>
                </div>

                <!-- FORMULAIRE DE MODIFICATION DU TRAVAIL -->
                <div v-if="travailEnEdition">
                    <h3>Modifier le travail</h3>

                    <form @submit.prevent="enregistrerModification">
                        <div>
                            <label for="titre">Titre :</label>
                            <input
                                id="titre"
                                type="text"
                                v-model="travailEnEdition.titre"
                                required
                            >
                        </div>

                        <div>
                            <label for="description">Description :</label>
                            <textarea
                                id="description"
                                v-model="travailEnEdition.description"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label for="type">Type :</label>
                            <select
                                id="type"
                                v-model="travailEnEdition.type"
                                required
                            >
                                <option value="individuel">Individuel</option>
                                <option value="equipe">Équipe</option>
                            </select>
                        </div>

                        <div>
                            <label for="disponible">
                                Date de disponibilité :
                            </label>
                            <input
                                id="disponible"
                                type="datetime-local"
                                v-model="travailEnEdition.disponible"
                                required
                            >
                        </div>

                        <div>
                            <label for="remise">Date de remise :</label>
                            <input
                                id="remise"
                                type="datetime-local"
                                v-model="travailEnEdition.remise"
                                required
                            >
                        </div>

                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="travailEnEdition.ouvert"
                                >
                                Travail ouvert
                            </label>
                        </div>

                        <button type="submit">
                            Enregistrer les modifications
                        </button>

                        <button type="button" @click="annulerModification">
                            Annuler
                        </button>
                    </form>
                </div>

                <!-- GESTION DES CRÉNEAUX -->
                <div v-if="travailSelectionne">
                    <h3>
                        Créneaux de : {{ travailSelectionne.titre }}
                    </h3>

                    <button @click="fermerCreneaux">
                        Fermer la gestion des créneaux
                    </button>

                    <h4>Créneaux existants</h4>

                    <p v-if="creneaux.length === 0">
                        Aucun créneau disponible.
                    </p>

                    <div v-for="creneau in creneaux" :key="creneau.id">
                        <p>
                            {{ creneau.debut }} - {{ creneau.fin }}
                        </p>

                        <button
                            @click="commencerModificationCreneau(creneau)"
                        >
                            Modifier
                        </button>

                        <button @click="supprimerCreneau(creneau)">
                            Supprimer
                        </button>
                    </div>

                    <!-- AJOUTER UN CRÉNEAU -->
                    <h4>Ajouter un créneau</h4>

                    <form @submit.prevent="ajouterCreneau">
                        <div>
                            <label for="nouveauDebut">Début :</label>
                            <input
                                id="nouveauDebut"
                                type="datetime-local"
                                v-model="nouveauCreneau.debut"
                                required
                            >
                        </div>

                        <div>
                            <label for="nouveauFin">Fin :</label>
                            <input
                                id="nouveauFin"
                                type="datetime-local"
                                v-model="nouveauCreneau.fin"
                                required
                            >
                        </div>

                        <button type="submit">
                            Ajouter le créneau
                        </button>
                    </form>

                    <!-- MODIFIER UN CRÉNEAU -->
                    <div v-if="creneauEnEdition">
                        <h4>Modifier le créneau</h4>

                        <form @submit.prevent="enregistrerModificationCreneau">
                            <div>
                                <label for="modifierDebut">Début :</label>
                                <input
                                    id="modifierDebut"
                                    type="datetime-local"
                                    v-model="creneauEnEdition.debut"
                                    required
                                >
                            </div>

                            <div>
                                <label for="modifierFin">Fin :</label>
                                <input
                                    id="modifierFin"
                                    type="datetime-local"
                                    v-model="creneauEnEdition.fin"
                                    required
                                >
                            </div>

                            <button type="submit">
                                Enregistrer
                            </button>

                            <button
                                type="button"
                                @click="creneauEnEdition = null"
                            >
                                Annuler
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <p v-if="message">{{ message }}</p>
            <p v-if="erreur">{{ erreur }}</p>
        </div>
    `
}).mount('#app');
