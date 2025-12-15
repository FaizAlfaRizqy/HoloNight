<?php
require_once 'config/koneksi.php';
require_once 'includes/session_check.php';

// Require login
requireLogin();

// Get current user
$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollow Knight - How to Play</title>
    <link rel="stylesheet" href="style/howtoplay.css">
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar">
        <button class="hamburger-menu" id="hamburgerMenu">
            <img src="src/img/hamburger.jpg" alt="Menu">
        </button>
        <div class="nav-container" id="navContainer">
            <a href="index.php" class="nav-link">HOME</a>
            <a href="leaderboard.php" class="nav-link">LEADERBOARD</a>
            <a href="howtoplay.php" class="nav-link active">HOW TO PLAY</a>
            <a href="game/game.php" class="nav-link">PLAY GAME</a>
        </div>
    </nav>
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

    <!-- Auth Buttons -->
    <div class="auth-buttons">
        <span class="user-info"><?php echo htmlspecialchars($user['username']); ?></span>
        <a href="auth/logout.php" class="auth-btn">LOGOUT</a>
    </div>

    <!-- Background -->
    <div class="background-container">
        <img src="src/background/How-To-Play.png" alt="Background" class="bg-image">
        <div class="overlay"></div>
    </div>

    <!-- Content -->
    <div class="content-container">
        <h1 class="title">How to Play?</h1>
        
        <div class="instructions-wrapper">
            <!-- Controls Section -->
            <div class="section">
                <h2 class="section-title">Key:</h2>
                <div class="controls">
                    <div class="control-item">
                        <span class="key">→</span>
                        <span class="description">= To move right</span>
                    </div>
                    <div class="control-item">
                        <span class="key">←</span>
                        <span class="description">= To move left</span>
                    </div>
                    <div class="control-item">
                        <span class="key">Z</span>
                        <span class="description">= Attack</span>
                    </div>
                    <div class="control-item">
                        <span class="key">X</span>
                        <span class="description">= Jump</span>
                    </div>
                    <div class="control-item">
                        <span class="key">C</span>
                        <span class="description">= Dash</span>
                    </div>
                </div>
            </div>

            <!-- Rules Section -->
            <div class="section">
                <h2 class="section-title">Rule:</h2>
                <div class="rules">
                    <div class="rule-item">
                        <span class="number">1.</span>
                        <span class="rule-text">Get as many point as you can</span>
                    </div>
                    <div class="rule-item">
                        <span class="number">2.</span>
                        <span class="rule-text">Boss will appear every 5 waves</span>
                    </div>
                    <div class="rule-item">
                        <span class="number">3.</span>
                        <span class="rule-text">Have Fun</span>
                    </div>
                </div>
            </div>

            <!-- Note -->
            <div class="note">
                (Game mode won't be optimized on android/iOS)
            </div>
        </div>
    </div>

    <!-- Music Toggle -->
    <audio id="bgMusic" loop>
        <source src="src/music/CityOfTears.mp3" type="audio/mpeg">
    </audio>
    
    <button id="musicToggle" class="music-toggle">🔊</button>

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

        // Close menu when nav link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navContainer.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Music Controls
        const music = document.getElementById('bgMusic');
        const musicToggle = document.getElementById('musicToggle');
        let isPlaying = false;

        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                music.pause();
                musicToggle.textContent = '🔇';
                isPlaying = false;
            } else {
                music.play();
                musicToggle.textContent = '🔊';
                isPlaying = true;
            }
        });

        document.addEventListener('click', () => {
            if (!isPlaying) {
                music.play();
                musicToggle.textContent = '🔊';
                isPlaying = true;
            }
        }, { once: true });
    </script>
</body>
</html>
