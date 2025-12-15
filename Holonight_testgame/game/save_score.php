<?php


// Nonaktifkan error output agar response tetap valid JSON
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require_once '../config/koneksi.php';


// Set header untuk JSON response
header('Content-Type: application/json');

// Cek apakah user sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit();
}

// Cek apakah data dikirim via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit();
}

// Get data dari POST (form/x-www-form-urlencoded)
$user_id = $_SESSION['user_id'];
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;
$wave = isset($_POST['wave']) ? intval($_POST['wave']) : 0;
$game_time = isset($_POST['game_time']) ? intval($_POST['game_time']) : 0;

// Validate data
if ($score < 0 || $wave < 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid score or wave data'
    ]);
    exit();
}

// Insert score ke database
$user_id_esc = mysqli_real_escape_string($koneksi, $user_id);
$score_esc = mysqli_real_escape_string($koneksi, $score);
$wave_esc = mysqli_real_escape_string($koneksi, $wave);
$time_esc = mysqli_real_escape_string($koneksi, $game_time);

$query = "INSERT INTO game_scores (user_id, score, wave_reached, game_time, created_at) 
          VALUES ('$user_id_esc', '$score_esc', '$wave_esc', '$time_esc', NOW())";

if (mysqli_query($koneksi, $query)) {
    // Get user's rank
    $rank_query = "SELECT COUNT(*) + 1 as rank 
                   FROM game_scores 
                   WHERE score > '$score_esc'";
    $rank_result = mysqli_query($koneksi, $rank_query);
    $rank_data = $rank_result ? mysqli_fetch_assoc($rank_result) : null;
    $rank = ($rank_data && isset($rank_data['rank'])) ? $rank_data['rank'] : 1;

    echo json_encode([
        'success' => true,
        'message' => 'Score saved successfully',
        'score_id' => mysqli_insert_id($koneksi),
        'rank' => $rank,
        'score' => $score,
        'wave' => $wave
    ]);
    exit();
} else {
    $db_error = mysqli_error($koneksi);
    // Log error ke file agar mudah debug
    file_put_contents(__DIR__ . '/debug_log.txt', "DB ERROR: " . $db_error . "\n", FILE_APPEND);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $db_error
    ]);
    exit();
}
?>