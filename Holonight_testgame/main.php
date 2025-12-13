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
    <!-- Navbar -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="main.php" class="nav-link active">HOME</a>
            <a href="leaderboard.php" class="nav-link">LEADERBOARD</a>
            <a href="#" class="nav-link">HOW TO PLAY</a>
            <a href="game/game.php" class="nav-link">PLAY GAME</a>
        </div>
    </nav>

    <!-- Auth Buttons -->
    <div class="auth-buttons">
        <span class="user-info"><?php echo htmlspecialchars($user['username']); ?></span>
        <a href="auth/logout.php" class="auth-btn">LOGOUT</a>
    </div>

    <div class="hero-container">
        <video class="video-background" autoplay loop muted playsinline>
            <source src="src/background/FanmadeAnim.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        <div class="hero-content">
            <img src="src/img/logo.png" alt="Hollow Knight Logo" class="hero-logo">
        </div>
    </div>

    <!-- Content Section -->
    <section class="content-section">
        <!-- Hallownest Card -->
        <div class="story-card">
            <img src="src/img/Halonest.png" alt="Hallownest Map" class="story-image">
            <div class="story-content">
                <h2>Hallownest</h2>
                <p>The land of Hallownest covers a vast network of caves and tunnels in the middle of a wasteland. They are inhabited by both sentient and wild bugs, among other creatures.</p>
            </div>
        </div>

        <!-- Carousel Story Cards -->
        <div class="story-card carousel-card">
            <button class="carousel-arrow left-arrow">
                <img src="src/img/right.png" alt="Next">
            </button>
            
            <div class="carousel-slides">
                <!-- Slide 1: Before The Wyrm -->
                <div class="carousel-slide active">
                    <img src="src/img/carou1.png" alt="Before The Wyrm" class="story-image">
                    <div class="story-content">
                        <h2>Before The Wyrm</h2>
                        <p>Before Hallownest was founded, an ancient civilisation lived in the area and worshipped the Void, a mysterious substance found in the Abyss. This civilisation eventually vanished for unknown reasons. The Void's ancient enemy was the Radiance, a powerful Higher Being of intense light who influenced the Dream Realm and was worshipped by the Moth Tribe. Other tribes such as the Mosskin, the Mantis Tribe, and the Spider Tribe also existed during this era.</p>
                    </div>
                </div>

                <!-- Slide 2: The Kingdom of Hallownest -->
                <div class="carousel-slide">
                    <img src="src/img/carou2.png" alt="The Kingdom of Hallownest" class="story-image">
                    <div class="story-content">
                        <h2>The Kingdom of Hallownest</h2>
                        <p>The Kingdom of Hallownest was founded by the Pale King, a higher being who arrived from outside. He used his power to expand the minds of bugs, granting them sapience and free will. Under his rule, Hallownest became a prosperous kingdom with grand architecture and complex societies. The White Palace stood as a testament to the kingdom's glory, and the city thrived with culture and knowledge.</p>
                    </div>
                </div>

                <!-- Slide 3: The Infection and the Hollow Knight -->
                <div class="carousel-slide">
                    <img src="src/img/carou3.png" alt="The Infection" class="story-image">
                    <div class="story-content">
                        <h2>The Infection and the Hollow Knight</h2>
                        <p>When the Radiance was forgotten by her worshippers, she struck back at those who forsook her by afflicting them with the Infection, a plague that turned bugs into mindless husks. The Pale King created the Hollow Knight, a vessel born of Void, to contain the Radiance. However, the plan was imperfect, and the Infection eventually spread throughout the kingdom, bringing about its downfall.</p>
                    </div>
                </div>

                <!-- Slide 4: The Fall of the Kingdom -->
                <div class="carousel-slide">
                    <img src="src/img/carou4.png" alt="The Fall" class="story-image">
                    <div class="story-content">
                        <h2>The Fall of the Kingdom</h2>
                        <p>As the Infection spread, Hallownest fell into ruin. Citizens became hostile creatures driven by rage and madness. The kingdom's once-great structures crumbled, and its inhabitants were lost to the plague. The Pale King and his White Palace vanished, leaving behind only memories and ruins. The kingdom became a haunting reminder of its former glory, waiting for a hero to discover its secrets.</p>
                    </div>
                </div>
            </div>

            <button class="carousel-arrow right-arrow">
                <img src="src/img/left.png" alt="Previous">
            </button>
        </div>
    </section>

    <!-- Auto Slider Section -->
    <section class="slider-section">
        <div class="slider-container">
            <div class="slider-track">
                <img src="src/img/slider1.png" alt="Slider 1" class="slider-image">
                <img src="src/img/slider2.png" alt="Slider 2" class="slider-image">
                <img src="src/img/slider3.png" alt="Slider 3" class="slider-image">
                <img src="src/img/slider4.png" alt="Slider 4" class="slider-image">
                <img src="src/img/slider5.png" alt="Slider 5" class="slider-image">
                <img src="src/img/slider6.png" alt="Slider 6" class="slider-image">
                <img src="src/img/slider7.png" alt="Slider 7" class="slider-image">
                <!-- Duplicate untuk loop seamless -->
                <img src="src/img/slider1.png" alt="Slider 1" class="slider-image">
                <img src="src/img/slider2.png" alt="Slider 2" class="slider-image">
                <img src="src/img/slider3.png" alt="Slider 3" class="slider-image">
                <img src="src/img/slider4.png" alt="Slider 4" class="slider-image">
                <img src="src/img/slider5.png" alt="Slider 5" class="slider-image">
                <img src="src/img/slider6.png" alt="Slider 6" class="slider-image">
                <img src="src/img/slider7.png" alt="Slider 7" class="slider-image">
            </div>
        </div>
    </section>

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

        // Carousel functionality
        const carouselSlides = document.querySelectorAll('.carousel-slide');
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        let currentIndex = 0;

        function showSlide(index) {
            carouselSlides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        }

        leftArrow.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % carouselSlides.length;
            showSlide(currentIndex);
        });

        rightArrow.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
            showSlide(currentIndex);
        });
    </script>
</body>
</html>