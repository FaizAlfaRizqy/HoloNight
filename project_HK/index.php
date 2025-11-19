<?php
session_start();
include 'koneksi.php';

// Redirect ke dashboard jika sudah login
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

$error = '';

// Handle login
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (empty($username) || empty($password)) {
        $error = 'Username dan password harus diisi!';
    } else {
        // Query untuk login tanpa password verification
        $username_esc = mysqli_real_escape_string($koneksi, $username);
        $password_esc = mysqli_real_escape_string($koneksi, $password);
        
        $query = "SELECT id, username, email, karakter FROM users WHERE (username = '$username_esc' OR email = '$username_esc') AND password = '$password_esc'";
        $result = mysqli_query($koneksi, $query);
        
        if ($user = mysqli_fetch_assoc($result)) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['character'] = $user['karakter'];
            header('Location: dashboard.php');
            exit();
        } else {
            $error = 'Username/email atau password salah!';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Hollow Knight Fan Website - Login</title>
</head>
<body>
    <h1>🦋 Hollow Knight Fan Website</h1>
    <h2>Selamat Datang, Knight!</h2>
    
    <?php if ($error): ?>
        <p style="color: red;"><strong><?php echo htmlspecialchars($error); ?></strong></p>
    <?php endif; ?>

    <h3>Login</h3>
    <form method="POST">
        <table>
            <tr>
                <td>Username/Email:</td>
                <td><input type="text" name="username" required></td>
            </tr>
            <tr>
                <td>Password:</td>
                <td><input type="password" name="password" required></td>
            </tr>
            <tr>
                <td colspan="2"><input type="submit" name="login" value="Login"></td>
            </tr>
        </table>
    </form>

    <p>Belum punya akun? <a href="register.php">Daftar di sini</a></p>
</body>
</html>