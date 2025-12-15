<?php
require_once 'config/koneksi.php';
require_once 'includes/session_check.php';

// Check if user is logged in (optional untuk leaderboard)
$current_user_id = isset($_SESSION['user_id']) ?  $_SESSION['user_id'] : null;
$current_username = isset($_SESSION['username']) ?  $_SESSION['username'] : null;

// Get top 3 for podium
$podium_query = "SELECT u.username, gs.score, gs.wave_reached, gs.created_at 
                 FROM game_scores gs 
                 JOIN users u ON gs.user_id = u.id 
                 ORDER BY gs.score DESC 
                 LIMIT 3";
$podium_result = mysqli_query($koneksi, $podium_query);
$podium = [];
while ($row = mysqli_fetch_assoc($podium_result)) {
    $podium[] = $row;
}

// Pad podium with empty data if less than 3
while (count($podium) < 3) {
    $podium[] = ['username' => 'No Data', 'score' => 0];
}

// Get top 15 for leaderboard table (skip top 3)
$leaderboard_query = "SELECT u.username, gs. score, gs.wave_reached, gs.created_at, u.id as user_id 
                      FROM game_scores gs 
                      JOIN users u ON gs.user_id = u.id 
                      ORDER BY gs.score DESC 
                      LIMIT 3, 12";
$leaderboard_result = mysqli_query($koneksi, $leaderboard_query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollow Knight - Leaderboard</title>
    <link rel="stylesheet" href="style/leaderboard.css">
    <style>
        /* Additional styles for user highlight */
        .highlight-user {
            background: rgba(74, 158, 255, 0.3) !important;
            border-left: 4px solid #4a9eff;
            box-shadow: 0 0 20px rgba(74, 158, 255, 0.4);
        }

        .highlight-user:hover {
            background: rgba(74, 158, 255, 0.4) !important;
            transform: translateX(10px);
        }

        . you-badge {
            display: inline-block;
            margin-left: 10px;
            padding: 2px 8px;
            background: #4a9eff;
            color: white;
            font-size: 12px;
            border-radius: 4px;
            font-weight: bold;
        }

        .no-data-message {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.6;
            font-size: 18px;
            letter-spacing: 2px;
        }

        .no-data-message a {
            color: #4a9eff;
            text-decoration: none;
            font-weight: bold;
        }

        .no-data-message a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar">
        <button class="hamburger-menu" id="hamburgerMenu">
            <img src="src/img/hamburger.jpg" alt="Menu">
        </button>
        <div class="nav-container" id="navContainer">
            <a href="main.php" class="nav-link">HOME</a>
            <a href="leaderboard.php" class="nav-link active">LEADERBOARD</a>
            <a href="howtoplay.php" class="nav-link">HOW TO PLAY</a>
            <a href="game/game.php" class="nav-link">PLAY GAME</a>
        </div>
    </nav>
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

    <!-- Auth Buttons -->
    <div class="auth-buttons">
        <?php if ($current_user_id): ?>
            <span class="user-info" style="opacity: 0.8; cursor: default;">
                <?php echo htmlspecialchars($current_username); ?>
            </span>
            <a href="auth/logout.php" class="auth-btn">LOGOUT</a>
        <?php else: ?>
            <a href="auth/login.php" class="auth-btn">LOGIN</a>
            <a href="auth/register.php" class="auth-btn">REGISTER</a>
        <?php endif; ?>
    </div>

    <!-- Banner -->
    <div class="banner">
        <img src="src/background/leaderboard.png" alt="Leaderboard Banner" class="banner-image">
    </div>

    <!-- Podium Section -->
    <div class="podium-container">
        <!-- 2nd Place (Left) -->
        <div class="podium-item podium-second">
            <img src="src/img/second.png" alt="Second Place" class="podium-badge">
            <div class="podium-name">
                <?php echo htmlspecialchars($podium[1]['username']); ?>
            </div>
            <div class="podium-score">
                <?php echo $podium[1]['score'] > 0 ? number_format($podium[1]['score']) : '-'; ?>
            </div>
        </div>

        <!-- 1st Place (Center) -->
        <div class="podium-item podium-first">
            <img src="src/img/first.png" alt="First Place" class="podium-badge">
            <div class="podium-name">
                <?php echo htmlspecialchars($podium[0]['username']); ?>
            </div>
            <div class="podium-score">
                <?php echo $podium[0]['score'] > 0 ? number_format($podium[0]['score']) : '-'; ?>
            </div>
        </div>

        <!-- 3rd Place (Right) -->
        <div class="podium-item podium-third">
            <img src="src/img/third.png" alt="Third Place" class="podium-badge">
            <div class="podium-name">
                <?php echo htmlspecialchars($podium[2]['username']); ?>
            </div>
            <div class="podium-score">
                <?php echo $podium[2]['score'] > 0 ? number_format($podium[2]['score']) : '-'; ?>
            </div>
        </div>
    </div>

    <!-- Leaderboard Content -->
    <div class="leaderboard-container">
        <div class="leaderboard-table">
            <div class="table-header">
                <div class="rank-col">Rank</div>
                <div class="name-col">Username</div>
                <div class="score-col">Points</div>
            </div>

            <div class="table-body">
                <?php 
                $rank = 4; // Start from 4 (after podium top 3)
                if (mysqli_num_rows($leaderboard_result) > 0):
                    while ($row = mysqli_fetch_assoc($leaderboard_result)): 
                        // Highlight current user
                        $is_current_user = ($current_user_id && $row['user_id'] == $current_user_id);
                        $highlight_class = $is_current_user ? 'highlight-user' : '';
                ?>
                <div class="table-row <?php echo $highlight_class; ?>">
                    <div class="rank-col">#<?php echo $rank; ?></div>
                    <div class="name-col">
                        <?php echo htmlspecialchars($row['username']); ?>
                        <?php if ($is_current_user): ?>
                            <span class="you-badge">YOU</span>
                        <?php endif; ?>
                    </div>
                    <div class="score-col"><?php echo number_format($row['score']); ?></div>
                </div>
                <?php 
                    $rank++;
                    endwhile;
                else: 
                ?>
                <div class="no-data-message">
                    <p>🏆 No scores yet. Be the first to play!</p>
                    <p style="margin-top: 20px;">
                        <a href="game/game.php">Play Game Now →</a>
                    </p>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        // Hamburger Menu Toggle
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navContainer = document.getElementById('navContainer');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navContainer.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenuOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            navContainer.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when nav link is clicked (ensure menu closes before navigation)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Only run on mobile (nav is overlayed)
                if (window.innerWidth <= 900) {
                    hamburgerMenu.classList.remove('active');
                    navContainer.classList.remove('active');
                    mobileMenuOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    // Delay navigation to allow menu to close smoothly
                    setTimeout(() => {
                        window.location = link.getAttribute('href');
                    }, 120);
                    e.preventDefault();
                }
            });
        });
    </script>
</body>
</html>