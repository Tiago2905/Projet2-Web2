
<?php
$titrePage = $titrePage ?? 'DexApp';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?= htmlspecialchars($titrePage) ?></title>

    <link rel="stylesheet" href="style.css">

    <!-- Vue.js 3 -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>

<body>

<header>
    <h1>DexApp</h1>

    <nav>
        <a href="index.php">Accueil</a>
        <a href="admin.php">Administration</a>
    </nav>
</header>

<main>
