<?php
session_start();
include 'koneksi.php';

$message = '';
$error = '';

// Handle registration
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['register'])) {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirmPassword']);
    
    if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        $error = 'Semua field harus diisi!';
    } elseif ($password !== $confirm_password) {
        $error = 'Password dan Confirm Password tidak sama!';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter!';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid!';
    } else {
        // Cek apakah username atau email sudah ada
        $username_esc = mysqli_real_escape_string($koneksi, $username);
        $email_esc = mysqli_real_escape_string($koneksi, $email);
        
        $check_query = "SELECT id FROM users WHERE username = '$username_esc' OR email = '$email_esc'";
        $check_result = mysqli_query($koneksi, $check_query);
        
        if (mysqli_num_rows($check_result) > 0) {
            $error = 'Anda sudah terdaftar sebagai Warga Nasional Hollownest';
        } else {
            // Insert user baru
            $password_esc = mysqli_real_escape_string($koneksi, $password);
            
            $insert_query = "INSERT INTO users (username, email, password) VALUES ('$username_esc', '$email_esc', '$password_esc')";
            
            if (mysqli_query($koneksi, $insert_query)) {
                $message = 'Selamat anda telah menjadi Warga Nasional Hollownest';
            } else {
                $error = 'Terjadi kesalahan saat mendaftar!';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollow Knight - Register</title>
    <link rel="stylesheet" href="style/login.css">
</head>
<body>
    <div class="register-container">
        <video class="video-background" autoplay loop muted playsinline>
            <source src="src/background/login.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="content">
            <div class="decorative-border-top">
                <img src="src/img/lineTop.png" alt="top decoration" class="line-decoration">
            </div>
            
            <h1 class="title">SIGN UP</h1>
            
            <div class="divider">
                <img src="src/img/line1.png" alt="divider" class="divider-img">
            </div>
            
            <form class="register-form" method="POST" id="registerForm">
                <div class="form-group">
                    <input type="text" id="username" name="username" class="input-field" placeholder="USERNAME" required>
                </div>
                
                <div class="form-group">
                    <input type="email" id="email" name="email" class="input-field" placeholder="EMAIL" required>
                </div>
                
                <div class="form-group">
                    <input type="password" id="password" name="password" class="input-field" placeholder="PASSWORD" required>
                </div>
                
                <div class="form-group">
                    <input type="password" id="confirmPassword" name="confirmPassword" class="input-field" placeholder="CONFIRM PASSWORD" required>
                </div>

                <?php if ($error): ?>
                    <div id="errorMessage" class="error-message" style="display: block;"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>
                
                <?php if ($message): ?>
                    <div id="successMessage" class="success-message" style="display: block;"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>
                
                <div class="button-group">
                    <button type="submit" name="register" class="btn-confirm">CONFIRM</button>
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

        <?php if ($message): ?>
        // Redirect ke login setelah 2 detik jika registrasi berhasil
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 2000);
        <?php endif; ?>
    </script>
</body>
</html>