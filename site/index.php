
<?php
$titrePage = 'Accueil - DexApp';
require_once 'includes/entete.php';
?>

<section>
    <h2>Bienvenue sur DexApp</h2>

    <p>
        Consultez les travaux disponibles et choisissez
        vos créneaux de disponibilité.
    </p>

    <div id="app">
        <p>Chargement des travaux...</p>
    </div>
</section>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/app.js"></script>

<?php
require_once 'includes/pied.php';
?>
