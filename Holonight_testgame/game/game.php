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
    <img src="../src/game/ui/left.png" alt="UI Left" class="ui-left-image">
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
            <!-- Health Icons -->
            <div class="health-container" id="healthContainer">
                <img src="../src/game/ui/health.png" alt="Health" class="health-icon">
                <img src="../src/game/ui/health.png" alt="Health" class="health-icon">
                <img src="../src/game/ui/health.png" alt="Health" class="health-icon">
                <img src="../src/game/ui/health.png" alt="Health" class="health-icon">
                <img src="../src/game/ui/health.png" alt="Health" class="health-icon">
            </div>
            
            <!-- Score -->
            <div class="stat-group score-group">
                <img src="../src/game/ui/money.png" alt="Money" class="score-icon">
                <div class="score-text">
                    <span class="stat-value" id="scoreDisplay">100</span>
                </div>
            </div>
            
        </div>
        
        <!-- Canvas Wrapper -->
        <div class="canvas-wrapper">
            <canvas id="gameCanvas"></canvas>
        </div>
        
        <!-- Controls Info -->
        <div class="controls-bar">
            <span class="controls-text">← → Arrow Keys:  Move | X: Jump | F: Attack</span>
        </div>
    </div>
    
    <!-- Game Over Screen -->
    <div class="game-over-overlay" id="gameOverScreen">
        <div class="game-over-content">
            <div class="game-over-title" id="gameOverTitle">GAME OVER</div>
            <div class="blood-drip"></div>
            
            <!-- Score and Wave - Side by Side -->
            <div class="stats-container">
                <div class="game-over-score">
                    <div class="score-label">FINAL SCORE</div>
                    <div class="score-value" id="finalScoreDisplay">0</div>
                </div>
                <div class="game-over-wave">
                    <div class="wave-label">WAVE</div>
                    <div class="wave-value" id="finalWaveDisplay">0</div>
                </div>
            </div>
            
            <div class="game-over-buttons">
                <button class="btn-death" onclick="saveScore()">SAVE</button>
                <button class="btn-death" onclick="restartGame()">RETRY</button>
                <a href="../main.php" class="btn-death">ESCAPE</a>
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
    

    
    <!-- Load JavaScript (ORDER IMPORTANT!) -->
    <script src="js/config.js"></script>
    <script src="js/player.js"></script>
    <script src="js/enemy.js"></script>
    <script src="js/barrel.js"></script>
    <script src="js/game.js"></script>
</body>
</html>