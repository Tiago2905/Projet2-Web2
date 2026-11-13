<?php

// Vérifier que l'identifiant est présent et valide
$id = $_GET['id'] ?? '';

if (!preg_match('/^[a-z0-9-]{1,30}$/', $id)) {
    http_response_code(404);
    require_once '404.php';
    exit;
}

$titrePage = 'Détails du travail - DexApp';
require_once 'includes/entete.php';
?>

<section>
    <h2>Détails du travail</h2>

    <div id="app">
        <p>Chargement du travail...</p>
    </div>
</section>

<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/travail.js"></script>

<?php
require_once 'includes/pied.php';
?>