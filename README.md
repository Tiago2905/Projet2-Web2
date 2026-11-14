# DexApp — Gestion des disponibilités étudiantes

## 1. Présentation du projet

DexApp est une application Web permettant aux étudiants de consulter les travaux disponibles dans leurs cours et de sélectionner leurs disponibilités pour des rencontres.

Les enseignants disposent d'une interface d'administration leur permettant de gérer leurs travaux et les créneaux proposés aux étudiants.

Le projet a été réalisé dans le cadre du cours **Programmation Web 2**.

## 2. Technologies utilisées

| Technologie | Utilisation                           |
| ----------- | ------------------------------------- |
| PHP         | Structure et affichage des pages      |
| HTML5       | Structure du site                     |
| CSS3        | Mise en forme et design               |
| JavaScript  | Fonctionnement côté client            |
| Vue.js 3    | Interface dynamique                   |
| Node.js     | Environnement d'exécution de l'API    |
| Express.js  | Création des routes API               |
| MySQL       | Base de données                       |
| MySQL2      | Connexion à MySQL                     |
| bcrypt      | Hachage des mots de passe             |
| dotenv      | Gestion des variables d'environnement |
| XAMPP       | Serveur Apache et MySQL local         |

## 3. Architecture du projet

L'application est divisée en deux parties principales.

### Site PHP et Vue.js

Le site utilise PHP pour afficher les pages et partager les éléments communs comme l'en-tête et le pied de page.

Vue.js permet de gérer les interactions avec les utilisateurs et d'effectuer les appels à l'API avec `fetch`.

### API Express

L'API Express traite les requêtes, valide les données, gère l'authentification et communique avec la base de données MySQL.

**Important :** le site PHP ne communique pas directement avec MySQL. Toutes les opérations sur la base de données passent par l'API Express.

### Structure des dossiers

```text
TP2-Dex/
│
├── api/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cours.js
│   │   ├── creneaux.js
│   │   └── travaux.js
│   │
│   ├── db.js
│   ├── server.js
│   ├── tokens.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── site/
│   ├── includes/
│   │   ├── entete.php
│   │   └── pied.php
│   │
│   ├── js/
│   │   ├── admin.js
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── config.js
│   │   └── travail.js
│   │
│   ├── 404.php
│   ├── admin.php
│   ├── index.php
│   ├── travail.php
│   └── style.css
│
├── init.sql
├── README.md
└── .gitignore
```

## 4. Prérequis

Avant d'installer le projet, les logiciels suivants doivent être disponibles :

- XAMPP
- Node.js
- npm
- Un navigateur Web
- Visual Studio Code (recommandé)

## 5. Installation du projet

### Étape 1 — Placer le projet dans XAMPP

Placer le dossier `TP2-Dex` dans le répertoire `htdocs` de XAMPP.

Chemin attendu :

```text
C:\xampp\htdocs\TP2-Dex
```

### Étape 2 — Démarrer XAMPP

Ouvrir le panneau de contrôle XAMPP et démarrer les services suivants :

- Apache
- MySQL

Les deux services doivent être actifs.

### Étape 3 — Créer la base de données

Ouvrir phpMyAdmin dans le navigateur :

```text
http://localhost/phpmyadmin
```

Importer le fichier `init.sql` afin de créer et initialiser la base de données du projet.

Le nom de la base de données utilisée est :

```text
DexAppBD
```

### Étape 4 — Créer le fichier .env

Dans le dossier `api`, créer un fichier nommé `.env`.

Ce fichier contient les informations nécessaires à la connexion à MySQL ainsi que le port utilisé par le serveur Express.

Ajouter le contenu suivant :

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=DexAppBD
```

Description des variables :

| Variable      | Description                         |
| ------------- | ----------------------------------- |
| `PORT`        | Port utilisé par le serveur Express |
| `DB_HOST`     | Adresse du serveur MySQL            |
| `DB_USER`     | Nom d'utilisateur MySQL             |
| `DB_PASSWORD` | Mot de passe de l'utilisateur MySQL |
| `DB_NAME`     | Nom de la base de données           |

**Important :**

- Adapter les valeurs selon la configuration MySQL de l'ordinateur.
- Si MySQL possède un mot de passe, l'inscrire après `DB_PASSWORD=`.
- Le fichier `.env` ne doit jamais être publié sur GitHub. Il est exclu du dépôt grâce au fichier `.gitignore`.

### Étape 5 — Installer les dépendances de l'API

Ouvrir un terminal dans le dossier du projet, puis accéder au dossier `api` :

```bash
cd C:\xampp\htdocs\TP2-Dex\api
```

Installer les dépendances :

```bash
npm install
```

Cette commande installe les modules nécessaires au fonctionnement de l'API.

### Étape 6 — Démarrer le serveur API

Dans le dossier `api`, exécuter :

```bash
node server.js
```

Le serveur Express démarre sur le port configuré dans le fichier `.env`.

En environnement local, l'API est accessible à l'adresse :

```text
http://localhost:3000
```

### Étape 7 — Accéder à l'application

Ouvrir le navigateur et accéder à l'adresse suivante :

```text
http://localhost/TP2-Dex/site/
```

L'application est maintenant prête à être utilisée.

## 6. Base de données

La base de données utilisée par l'application est `DexAppBD`.

Elle contient les principales tables suivantes :

| Table            | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `utilisateurs`   | Contient les comptes des enseignants                  |
| `cours`          | Contient les cours associés aux enseignants           |
| `travaux`        | Contient les travaux disponibles                      |
| `creneaux`       | Contient les créneaux proposés pour les travaux       |
| `disponibilites` | Contient les réponses des étudiants pour les créneaux |

### Relations importantes

- Un enseignant peut être associé à plusieurs cours.
- Un cours peut contenir plusieurs travaux.
- Un travail peut proposer plusieurs créneaux.
- Les disponibilités sont associées à un travail, un créneau et un étudiant identifié par son matricule.
- La suppression d'un créneau entraîne la suppression des disponibilités qui lui sont associées grâce à la clé étrangère avec `ON DELETE CASCADE`.

## 7. Fonctionnalités de l'application

### 7.1 Interface étudiante

Les étudiants peuvent :

- Consulter la liste des travaux ouverts.
- Filtrer les travaux par cours.
- Consulter les détails d'un travail.
- Voir les créneaux disponibles.
- Entrer leur matricule et leur nom.
- Sélectionner un ou plusieurs créneaux.
- Enregistrer leurs disponibilités.
- Modifier leurs choix en soumettant une nouvelle sélection.

Les informations de l'étudiant et ses sélections sont conservées localement dans le navigateur afin de faciliter le retour sur la page.

### 7.2 Interface administrateur

Les enseignants peuvent :

- Se connecter à leur compte.
- Consulter leurs propres travaux.
- Modifier les informations d'un travail.
- Ajouter des créneaux.
- Modifier des créneaux existants.
- Supprimer des créneaux.
- Consulter le nombre de réponses étudiantes associées à un créneau avant sa suppression.
- Se déconnecter.

Chaque enseignant peut uniquement gérer les travaux qui lui appartiennent.

### 7.3 Authentification

L'application utilise un système d'authentification pour les enseignants.

Les mécanismes utilisés sont :

- Hachage des mots de passe avec bcrypt.
- Jetons Bearer pour l'authentification.
- Middleware pour protéger les routes administratives.
- Stockage du jeton dans `sessionStorage` côté client.

Les étudiants n'ont pas besoin de compte pour enregistrer leurs disponibilités.

## 8. Routes de l'API

Toutes les routes utilisent le préfixe suivant :

```text
http://localhost:3000/api
```

### Routes publiques

| Méthode | Route                                    | Description                                 |
| ------- | ---------------------------------------- | ------------------------------------------- |
| GET     | `/cours`                                 | Récupérer la liste des cours                |
| GET     | `/travaux`                               | Récupérer les travaux ouverts               |
| GET     | `/travaux?cours=<id>`                    | Filtrer les travaux par cours               |
| GET     | `/travaux/:id`                           | Récupérer un travail et ses créneaux        |
| GET     | `/travaux/:id/disponibilites`            | Consulter les disponibilités étudiantes     |
| PUT     | `/travaux/:id/disponibilites/:matricule` | Enregistrer ou remplacer les disponibilités |
| POST    | `/connexion`                             | Connecter un enseignant                     |
| POST    | `/deconnexion`                           | Déconnecter un enseignant                   |

### Routes protégées

Ces routes nécessitent un jeton Bearer valide dans l'en-tête HTTP `Authorization`.

| Méthode | Route                            | Description                                            |
| ------- | -------------------------------- | ------------------------------------------------------ |
| GET     | `/admin/travaux`                 | Récupérer les travaux de l'enseignant connecté         |
| PUT     | `/travaux/:id`                   | Modifier un travail                                    |
| POST    | `/travaux/:id/creneaux`          | Ajouter un créneau                                     |
| PUT     | `/creneaux/:id`                  | Modifier un créneau                                    |
| GET     | `/creneaux/:id/suppression-info` | Récupérer le nombre de réponses associées à un créneau |
| DELETE  | `/creneaux/:id`                  | Supprimer un créneau                                   |

## 9. Comptes de démonstration

Deux comptes enseignants sont disponibles pour tester l'application.

| Identifiant | Mot de passe | Enseignant    |
| ----------- | ------------ | ------------- |
| `prof`      | `dex2026`    | Claire Dubois |
| `prof2`     | `web2026`    | Marc Tremblay |

Pour tester l'interface étudiante, il est possible d'utiliser un matricule et un nom de test.

## 10. Gestion des erreurs HTTP

L'API utilise les codes de statut HTTP pour indiquer le résultat des requêtes.

| Code | Signification                             |
| ---- | ----------------------------------------- |
| 200  | Requête réussie                           |
| 201  | Ressource créée                           |
| 204  | Opération réussie sans contenu de réponse |
| 400  | Données invalides                         |
| 401  | Authentification absente ou invalide      |
| 403  | Accès interdit                            |
| 404  | Ressource introuvable                     |
| 409  | Conflit de données                        |
| 500  | Erreur interne du serveur                 |

Les erreurs de validation sont retournées sous forme de réponse JSON.

## 11. Sécurité

Le projet applique plusieurs mesures de sécurité :

- Les mots de passe des enseignants sont hachés avec bcrypt.
- Les routes administratives sont protégées par un jeton Bearer.
- Les enseignants peuvent uniquement modifier leurs propres travaux.
- Les requêtes SQL utilisent des paramètres pour limiter les risques d'injection SQL.
- Les données reçues par l'API sont validées.
- Les informations de connexion sont conservées dans un fichier `.env`.
- Les fichiers sensibles et les dépendances installées ne doivent pas être publiés sur GitHub.

## 12. Auteur

Projet réalisé dans le cadre du cours **Programmation Web 2**.

**Nom du projet :** DexApp
**Type de projet :** Application Web de gestion des disponibilités étudiantes
**Technologies principales :** PHP, Vue.js, Node.js, Express et MySQL
