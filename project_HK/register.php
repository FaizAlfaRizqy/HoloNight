<?php
session_start();
include 'koneksi.php';

// Redirect ke dashboard jika sudah login
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

$message = '';
$error = '';

// Handle registration
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['register'])) {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);
    $mc_choice = $_POST['mc_choice']; // Tambahan untuk MC selection
    
    if (empty($username) || empty($email) || empty($password) || empty($confirm_password) || empty($mc_choice)) {
        $error = 'Semua field harus diisi!';
    } elseif ($password !== $confirm_password) {
        $error = 'Password dan konfirmasi password tidak sama!';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter!';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid!';
    } elseif (!in_array($mc_choice, ['knight', 'hornet'])) {
        $error = 'Pilihan karakter tidak valid!';
    } else {
        // Cek apakah username atau email sudah ada
        $username_esc = mysqli_real_escape_string($koneksi, $username);
        $email_esc = mysqli_real_escape_string($koneksi, $email);
        
        $check_query = "SELECT id FROM users WHERE username = '$username_esc' OR email = '$email_esc'";
        $check_result = mysqli_query($koneksi, $check_query);
        
        if (mysqli_num_rows($check_result) > 0) {
            $error = 'Username atau email sudah terdaftar!';
        } else {
            // Insert tanpa password hashing (untuk testing)
            $password_esc = mysqli_real_escape_string($koneksi, $password);
            $mc_choice_esc = mysqli_real_escape_string($koneksi, $mc_choice);
            
            // Insert dengan kolom 'karakter'
            $insert_query = "INSERT INTO users (username, email, password, karakter) VALUES ('$username_esc', '$email_esc', '$password_esc', '$mc_choice_esc')";
            
            if (mysqli_query($koneksi, $insert_query)) {
                $message = "Registrasi berhasil! Selamat datang, " . ($mc_choice == 'knight' ? 'Knight' : 'Hornet') . "! Silakan login.";
            } else {
                $error = 'Terjadi kesalahan: ' . mysqli_error($koneksi);
            }
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Daftar Akun - Hollow Knight Fan Website</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>🦋 Hollow Knight Fan Website</h1>
    <h2>Bergabunglah dengan Fellow Knights!</h2>
    
    <?php if ($message): ?>
        <p style="color: green;"><strong><?php echo htmlspecialchars($message); ?></strong></p>
        <p><a href="index.php">Login sekarang</a></p>
    <?php endif; ?>
    
    <?php if ($error): ?>
        <p style="color: red;"><strong><?php echo htmlspecialchars($error); ?></strong></p>
    <?php endif; ?>

    <?php if (!$message): ?>
    <h3>Daftar Akun Baru</h3>
    <form method="POST">
        <table>
            <tr>
                <td>Username:</td>
                <td><input type="text" name="username" maxlength="50" required></td>
            </tr>
            <tr>
                <td>Email:</td>
                <td><input type="email" name="email" maxlength="100" required></td>
            </tr>
            <tr>
                <td>Password:</td>
                <td><input type="password" name="password" required></td>
            </tr>
            <tr>
                <td>Konfirmasi Password:</td>
                <td><input type="password" name="confirm_password" required></td>
            </tr>
            <tr>
                <td>Pilih Karakter:</td>
                <td>
                    <select name="mc_choice" required>
                        <option value="">-- Pilih Karakter --</option>
                        <option value="knight">⚔️ The Knight</option>
                        <option value="hornet">🕷️ Hornet</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td colspan="2"><input type="submit" name="register" value="Daftar"></td>
            </tr>
        </table>
    </form>
    <?php endif; ?>

    <p>Sudah punya akun? <a href="index.php">Login di sini</a></p>
</body>
</html>