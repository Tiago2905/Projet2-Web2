
const { createApp } = Vue;

createApp({
    data() {
        return {
            travaux: [],
            erreur: ''
        };
    },

    async mounted() {
        try {
            this.travaux = await obtenirTravaux();
        } catch (erreur) {
            this.erreur = 'Impossible de charger les travaux.';
            console.error(erreur);
        }
    },

    template: `
        <div>
            <p v-if="erreur">{{ erreur }}</p>

            <div v-else-if="travaux.length === 0">
                Aucun travail disponible.
            </div>

            <div v-else>
                <article v-for="travail in travaux" :key="travail.id">
                    <h3>{{ travail.titre }}</h3>
                    <p>{{ travail.description }}</p>
                    <p>Type : {{ travail.type }}</p>
                    <p>Date de remise : {{ travail.remise }}</p>

                    <a :href="'travail.php?id=' + travail.id">
                        Voir le travail
                    </a>
                </article>
            </div>
        </div>
    `
}).mount('#app');
