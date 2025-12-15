<?php
// Database Connection Configuration

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'project_pw');

// Create connection
$koneksi = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if (!$koneksi) {
    die("Connection failed: " . mysqli_connect_error());
}

// Set charset
mysqli_set_charset($koneksi, "utf8mb4");

// Optional: Set timezone
date_default_timezone_set('Asia/Jakarta');
?>