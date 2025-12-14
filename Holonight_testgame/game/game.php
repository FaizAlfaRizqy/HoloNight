<?php
require_once '../config/koneksi.php';
require_once '../includes/session_check.php';

requireLogin();
$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollow Knight - Wave Survival</title>
    <link rel="stylesheet" href="css/game.css">
</head>
<body>
    <!-- Game Container -->
    <div class="game-container">
        <!-- Header UI Bar -->
        <div class="game-header">

            <div class="player-info">
                Playing as:  <strong><?php echo htmlspecialchars($user['username']); ?></strong>
            </div>
        </div>
        
        <!-- Stats Bar (Above Canvas) -->
        <div class="stats-bar">
            <!-- Health -->
            <div class="stat-group">
                <span class="stat-label">HEALTH: </span>
                <div class="health-bar-container">
                    <div class="health-bar-fill" id="healthBarFill"></div>
                </div>
                <span class="health-text" id="healthText">100 / 100</span>
            </div>
            
            <!-- Wave -->
            <div class="stat-group">
                <span class="stat-label">WAVE:</span>
                <span class="stat-value" id="waveDisplay">1</span>
            </div>
            
            <!-- Score -->
            <div class="stat-group">
                <span class="stat-label">SCORE: </span>
                <span class="stat-value" id="scoreDisplay">100</span>
            </div>
            
            <!-- Enemies -->
            <div class="stat-group">
                <span class="stat-label">ENEMIES: </span>
                <span class="stat-value" id="enemiesDisplay">0 / 3</span>
            </div>
        </div>
        
        <!-- Canvas Wrapper -->
        <div class="canvas-wrapper">
            <canvas id="gameCanvas"></canvas>
        </div>
        
        <!-- Controls Info -->
        <div class="controls-bar">
            <span class="controls-text">← → Arrow Keys:  Move | SPACE: Jump | F: Attack</span>
        </div>
    </div>
    
    <!-- Game Over Screen -->
    <div class="game-over-overlay" id="gameOverScreen">
        <div class="game-over-content">
            <h2>💀 GAME OVER</h2>
            <p class="game-over-subtitle">You have fallen in the depths of Hollownest</p>
            
            <div class="final-stats">
                <p>Wave Reached: <span id="finalWave">0</span></p>
                <p>Final Score: <span id="finalScore">0</span></p>
            </div>
            
            <div class="game-over-buttons">
                <button class="btn-game" onclick="saveScore()">Save Score</button>
                <button class="btn-game" onclick="restartGame()">Restart</button>
                <a href="../main.php" class="btn-game">Main Menu</a>
            </div>
        </div>
    </div>
    
    <!-- User data for JavaScript -->
    <script>
        const CURRENT_USER = {
            id: <?php echo $user['id']; ?>,
            username: '<?php echo addslashes($user['username']); ?>'
        };
    </script>

    fetch('../save_score.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        score: finalScore,
        wave: finalWave,
        game_time: gameTime
    })
})
.then(res => res.json())
.then(data => {
    console.log(data);
})
.catch(err => {
    console.error("JSON ERROR:", err);
});

    
    <!-- Load JavaScript (ORDER IMPORTANT!) -->
    <script src="js/config.js"></script>
    <script src="js/player.js"></script>
    <script src="js/enemy.js"></script>
    <script src="js/game.js"></script>
</body>
</html>