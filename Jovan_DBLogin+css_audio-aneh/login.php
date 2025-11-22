<?php
session_start();
include 'koneksi.php';

$error = '';

// Handle login
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (empty($username) || empty($password)) {
        $error = 'Username dan password harus diisi!';
    } else {
        // Query untuk login
        $username_esc = mysqli_real_escape_string($koneksi, $username);
        $password_esc = mysqli_real_escape_string($koneksi, $password);
        
        $query = "SELECT id, username, email FROM users WHERE (username = '$username_esc' OR email = '$username_esc') AND password = '$password_esc'";
        $result = mysqli_query($koneksi, $query);
        
        if ($user = mysqli_fetch_assoc($result)) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            
            // Redirect ke main.html
            echo '<script>window.location.href = "main.html";</script>';
            exit();
        } else {
            $error = 'Zote The Mighty Said :\nPassword atau Username salah bang';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollow Knight - Login</title>
    <link rel="stylesheet" href="style/login.css">
</head>
<body>
    <div class="login-container">
        <video class="video-background" autoplay loop muted playsinline>
            <source src="src/background/login.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="content">
            <div class="decorative-border-top">
                <img src="src/img/lineTop.png" alt="top decoration" class="line-decoration">
            </div>
            
            <h1 class="title">SIGN IN</h1>
            
            <div class="divider">
                <img src="src/img/line1.png" alt="divider" class="divider-img">
            </div>
            
            <form class="login-form" method="POST" id="loginForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" class="input-field" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="input-field" required>
                </div>

                <?php if ($error): ?>
                    <div id="errorMessage" class="error-message" style="display: block;"><?php echo nl2br(htmlspecialchars($error)); ?></div>
                <?php endif; ?>
                
                <div class="button-group">
                    <button type="submit" name="login" class="btn-confirm">CONFIRM</button>
                    <a href="index.html" class="btn-back">BACK</a>
                </div>
            </form>
            
            <div class="decorative-border-bottom">
                <img src="src/img/lineBot.png" alt="bottom decoration" class="line-decoration">
            </div>
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