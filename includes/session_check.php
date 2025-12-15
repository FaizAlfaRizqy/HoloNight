<?php
// Session Check & Protection
// Include this file in pages yang perlu login

// Start session kalau belum
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

// Function to require login (redirect jika belum login)
function requireLogin() {
    if (!isLoggedIn()) {
        // Cek dari mana file dipanggil
        $request_uri = $_SERVER['REQUEST_URI'];
        
        // Kalau dipanggil dari subfolder, redirect ke ../auth/login.php
        // Kalau dari root, redirect ke auth/login.php
        if (strpos($request_uri, '/auth/') !== false || 
            strpos($request_uri, '/includes/') !== false || 
            strpos($request_uri, '/config/') !== false) {
            header('Location: ../auth/login.php');
        } else {
            header('Location: auth/login.php');
        }
        exit();
    }
}

// Function to get current user data
function getCurrentUser() {
    if (! isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'] ??  null
    ];
}

// Function to prevent logged-in users from accessing login/register
function preventLoggedInAccess() {
    if (isLoggedIn()) {
        // Kalau sudah login, redirect ke main.php
        $request_uri = $_SERVER['REQUEST_URI'];
        
        if (strpos($request_uri, '/auth/') !== false) {
            // Dipanggil dari folder auth/, jadi pakai ../
            header('Location: ../main.php');
        } else {
            header('Location: main.php');
        }
        exit();
    }
}
?>