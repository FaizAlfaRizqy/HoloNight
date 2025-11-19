<?php
session_start();
include 'koneksi.php';

// Cek apakah user sudah login
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}

$username = $_SESSION['username'];

// Get user data including character choice
$user_id = $_SESSION['user_id'];
$query = "SELECT username, email, karakter FROM users WHERE id = $user_id";
$result = mysqli_query($koneksi, $query);
$user_data = mysqli_fetch_assoc($result);

$character = $user_data['karakter'];
$character_display = ($character == 'knight') ? '⚔️ The Knight' : '🕷️ Hornet';

// Get user's best score
$query = "SELECT MAX(score) as best_score, MAX(wave_reached) as highest_wave FROM game_scores WHERE user_id = $user_id";
$result = mysqli_query($koneksi, $query);
$score_data = mysqli_fetch_assoc($result);
$best_score = $score_data['best_score'] ?? 0;
$highest_wave = $score_data['highest_wave'] ?? 0;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Hollow Knight Fan Website</title>
</head>
<body>
    <h1>🦋 Hollow Knight Fan Website</h1>
    <h2>Selamat datang, <?php echo htmlspecialchars($username); ?>!</h2>
    
    <h3>📊 Profil Anda:</h3>
    <table border="1">
        <tr>
            <td><strong>Username:</strong></td>
            <td><?php echo htmlspecialchars($username); ?></td>
        </tr>
        <tr>
            <td><strong>Email:</strong></td>
            <td><?php echo htmlspecialchars($user_data['email']); ?></td>
        </tr>
        <tr>
            <td><strong>Karakter:</strong></td>
            <td><?php echo htmlspecialchars($character_display); ?></td>
        </tr>
        <tr>
            <td><strong>Skor Terbaik:</strong></td>
            <td><?php echo number_format($best_score); ?></td>
        </tr>
        <tr>
            <td><strong>Wave Tertinggi:</strong></td>
            <td><?php echo $highest_wave; ?></td>
        </tr>
    </table>
    
    <h3>🎮 Menu Utama:</h3>
    <ul>
        <li><strong>📚 Wiki Sections:</strong>
            <ul>
                <li>Main Story & Silk Song (Coming Soon)</li>
                <li>Lore Database (Coming Soon)</li>
                <li>Enemy Database (Coming Soon)</li>
                <li>Video Guides (Coming Soon)</li>
            </ul>
        </li>
        <li><strong>🎯 Mini Game:</strong>
            <ul>
                <li><a href="game.php">🎮 Play Survival Game</a> (Coming Soon)</li>
                <li><a href="leaderboard.php">🏆 View Leaderboard</a> (Coming Soon)</li>
            </ul>
        </li>
    </ul>
    
    <h3>⚡ Quick Actions:</h3>
    <ul>
        <li><a href="leaderboard.php">🏆 Lihat Leaderboard</a></li>
        <li><a href="logout.php">🚪 Logout</a></li>
    </ul>
    
    <hr>
    <p><em>"<?php echo ($character == 'knight') ? 'No mind to think, no will to break...' : 'Git gud!'; ?>"</em></p>
</body>
</html>