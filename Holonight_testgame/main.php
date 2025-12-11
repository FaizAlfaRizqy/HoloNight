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
    <title>Hollow Knight - Main</title>
    <link rel="stylesheet" href="style/main.css">
</head>
<body>
    <div class="hero-container">
        <video class="video-background" autoplay loop muted playsinline>
            <source src="src/background/FanmadeAnim.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="hero-content">
            <img src="src/img/logo.png" alt="Hollow Knight Logo" class="hero-logo">
            
            <!-- User Info -->
            <div style="text-align: center; margin-top: 20px; color: white;">
                <p style="font-size: 24px; letter-spacing: 3px;">
                    Welcome, <strong><?php echo htmlspecialchars($user['username']); ?></strong>
                </p>
                    <div style="margin-top: 15px;">
                        <a href="game/game.php" style="display: inline-block; padding: 12px 30px; background: rgba(74, 158, 255, 0.2); border: 2px solid #4a9eff; color: #4a9eff; text-decoration: none; font-size: 18px; letter-spacing: 3px; border-radius: 5px; margin: 5px; transition: all 0.3s;">
                            🎮 PLAY GAME
                        </a>
                        <a href="leaderboard.php" style="display: inline-block; padding: 12px 30px; background: rgba(138, 180, 213, 0.2); border: 2px solid #8ab4d5; color: #8ab4d5; text-decoration: none; font-size: 18px; letter-spacing: 3px; border-radius: 5px; margin: 5px; transition: all 0.3s;">
                            🏆 LEADERBOARD
                        </a>
                    </div>
                <a href="auth/logout.php" style="color: #8ab4d5; text-decoration: none; font-size: 16px; letter-spacing: 2px;">
                    LOGOUT
                </a>
            </div>
        </div>
    </div>

    <div class="content-section">
        <!-- Hallownest Story Card -->
        <div class="story-card">
            <h2>Hallownest</h2>
            <div class="divider-line"></div>
            <p>
                The land of Hallownest covers a vast network of caves and tunnels in the midst of a mountainous area. They are inhabited by sentient insects that follow ancient creatures. 
            </p>
            <p>
                Hallownest was once a thriving kingdom, but now lies in ruins. The few bugs that remain are either mad with infection or struggle to survive in the crumbling kingdom.
            </p>
        </div>

        <!-- Belief Story Card -->
        <div class="story-card">
            <h2>Belief</h2>
            <div class="divider-line"></div>
            <p class="subtitle">Worship of the Pale King</p>
            <div class="icon-decoration">⚔️</div>
            <p>
                The bugs of Hallownest believed that the Pale King created the entire world and everything in it. After his fall, they worshipped him through the King's Idols, icons which depict the King.  With just a few of them being destroyed by its owner, throughout Hallownest, such as the Fountain of Ancient Basin and a shrine in Crystal Peak. 
            </p>
        </div>

        <!-- The Infection Story Card -->
        <div class="story-card infection-card">
            <h2>The Infection</h2>
            <div class="divider-line"></div>
            <p>
                When the Moth Tribe stopped worshipping the Radiance and started to forget it, it forced it back to remember her through their dreams, creating the infection. To stop it, the Pale King created mindless vessels born from the Void, choosing only one to seal the Radiance within their mind, and placed them inside the Temple of the Black Egg.
            </p>
            <img src="src/img/knight.png" alt="Knight" class="knight-character">
        </div>

        <!-- Continue Prompt -->
        <div class="continue-prompt">
            Press Right Arrow to Continue ➡
        </div>
    </div>

    <audio id="bgMusic" loop>
        <source src="src/music/CityOfTears.mp3" type="audio/mpeg">
    </audio>
    
    <button id="musicToggle" class="music-toggle">🔊</button>

    <script>
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