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
    <script>
        // Mobile OS Detection
        (function() {
            // Check if user already accepted the warning
            if (sessionStorage.getItem('mobile_warning_accepted') === 'true') {
                return;
            }
            
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            let mobileOS = null;
            
            // Detect Android
            if (/android/i.test(userAgent)) {
                mobileOS = 'Android';
            }
            // Detect iOS
            else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                mobileOS = 'iOS';
            }
            
            // Redirect to mobile warning page if mobile OS detected
            if (mobileOS) {
                const currentPage = window.location.pathname.split('/').pop() || 'index.php';
                window.location.href = 'mobile.html?os=' + mobileOS + '&return=' + encodeURIComponent(currentPage);
            }
        })();
    </script>
    <!-- Navbar -->
    <nav class="navbar">
        <button class="hamburger-menu" id="hamburgerMenu">
            <img src="src/img/hamburger.jpg" alt="Menu">
        </button>
        <div class="nav-container" id="navContainer">
            <a href="index.php" class="nav-link active">HOME</a>
            <a href="leaderboard.php" class="nav-link">LEADERBOARD</a>
            <a href="howtoplay.php" class="nav-link">HOW TO PLAY</a>
            <a href="game/game.php" class="nav-link">PLAY GAME</a>
        </div>
    </nav>
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

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
        <div class="story-card scroll-animate-left">
            <img src="src/img/Halonest.png" alt="Hallownest Map" class="story-image">
            <div class="story-content">
                <h2>Hallownest</h2>
                <p>The land of Hallownest covers a vast network of caves and tunnels in the middle of a wasteland. They are inhabited by both sentient and wild bugs, among other creatures.</p>
            </div>
        </div>

        <!-- Carousel Story Cards -->
        <div class="story-card carousel-card scroll-animate-right">
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
            
            <button class="carousel-arrow left-arrow">
                <img src="src/img/left.png" alt="Previous">
            </button>
            <button class="carousel-arrow right-arrow">
                <img src="src/img/right.png" alt="Next">
            </button>
        </div>
    </section>

    <!-- Auto Slider Section -->
    <section class="slider-section scroll-animate">
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

    <!-- Heroes Section -->
    <section class="heroes-section scroll-animate-scale">
        <img src="src/img/heroes.png" alt="Heroes" class="heroes-image">
    </section>

    <!-- Character Info Section -->
    <section class="character-info-section scroll-animate">
        <img src="src/img/CharIntro.png" alt="Character Intro Background" class="char-intro-bg">
        
        <div class="character-content">
            <div class="textbox-wrapper">
                <video src="src/vid/HorNeitPrev.mp4" autoplay loop muted playsinline class="character-preview" id="charPreview"></video>
                <img src="src/img/textboox.png" alt="Text Box" class="textbox-bg">
                <div class="character-text" id="charText">
                </div>
            </div>
            
            <div class="character-bottom">
                <img src="src/img/ZaHornet.gif" alt="Character" class="character-main" id="charMain">
                
                <!-- Character Attributes -->
                <div class="character-attributes">
                    <button class="attr-arrow attr-left" id="charPrevBtn">
                        <img src="src/img/left.png" alt="Previous">
                    </button>
                    <div class="attr-logo" data-char="0">
                        <img src="src/img/HorNaitLgo.png" alt="Hornet Logo">
                    </div>
                    <div class="attr-logo" data-char="1">
                        <img src="src/img/NaitLgo.png" alt="Knight Logo">
                    </div>
                    <button class="attr-arrow attr-right" id="charNextBtn">
                        <img src="src/img/right.png" alt="Next">
                    </button>
                </div>
            </div>
        </div>
    </section>
    
    <!-- All Characters Title Section -->
    <section class="all-characters-section scroll-animate">
        <h2 class="diagonal-title">All Characters</h2>
        <img src="src/img/line1.png" alt="Separator" class="diagonal-separator">
    </section>

    <!-- Diagonal Slider Section -->
    <section class="diagonal-slider-section scroll-animate-scale">
        <div class="diagonal-slider-container">
            <!-- Slider 1 -->
            <div class="diagonal-column" data-direction="down">
                <img src="src/img/diagonal1.png" alt="Character 1" class="diagonal-image">
                <img src="src/img/diagonal2.png" alt="Character 2" class="diagonal-image">
                <img src="src/img/diagonal3.png" alt="Character 3" class="diagonal-image">
                <img src="src/img/diagonal4.png" alt="Character 4" class="diagonal-image">
                <img src="src/img/diagonal1.png" alt="Character 1" class="diagonal-image">
                <img src="src/img/diagonal2.png" alt="Character 2" class="diagonal-image">
                <img src="src/img/diagonal3.png" alt="Character 3" class="diagonal-image">
                <img src="src/img/diagonal4.png" alt="Character 4" class="diagonal-image">
            </div>
            <!-- Slider 2 -->
            <div class="diagonal-column" data-direction="up">
                <img src="src/img/diagonal4.png" alt="Character 4" class="diagonal-image">
                <img src="src/img/diagonal5.png" alt="Character 5" class="diagonal-image">
                <img src="src/img/diagonal6.png" alt="Character 6" class="diagonal-image">
                <img src="src/img/diagonal7.png" alt="Character 7" class="diagonal-image">
                <img src="src/img/diagonal4.png" alt="Character 4" class="diagonal-image">
                <img src="src/img/diagonal5.png" alt="Character 5" class="diagonal-image">
                <img src="src/img/diagonal6.png" alt="Character 6" class="diagonal-image">
                <img src="src/img/diagonal7.png" alt="Character 7" class="diagonal-image">
            </div>
            <!-- Slider 3 -->
            <div class="diagonal-column" data-direction="down">
                <img src="src/img/diagonal7.png" alt="Character 7" class="diagonal-image">
                <img src="src/img/diagonal8.png" alt="Character 8" class="diagonal-image">
                <img src="src/img/diagonal9.png" alt="Character 9" class="diagonal-image">
                <img src="src/img/diagonal10.png" alt="Character 10" class="diagonal-image">
                <img src="src/img/diagonal7.png" alt="Character 7" class="diagonal-image">
                <img src="src/img/diagonal8.png" alt="Character 8" class="diagonal-image">
                <img src="src/img/diagonal9.png" alt="Character 9" class="diagonal-image">
                <img src="src/img/diagonal10.png" alt="Character 10" class="diagonal-image">
            </div>
            <!-- Slider 4 -->
            <div class="diagonal-column" data-direction="up">
                <img src="src/img/diagonal10.png" alt="Character 10" class="diagonal-image">
                <img src="src/img/diagonal11.png" alt="Character 11" class="diagonal-image">
                <img src="src/img/diagonal12.png" alt="Character 12" class="diagonal-image">
                <img src="src/img/diagonal13.png" alt="Character 13" class="diagonal-image">
                <img src="src/img/diagonal10.png" alt="Character 10" class="diagonal-image">
                <img src="src/img/diagonal11.png" alt="Character 11" class="diagonal-image">
                <img src="src/img/diagonal12.png" alt="Character 12" class="diagonal-image">
                <img src="src/img/diagonal13.png" alt="Character 13" class="diagonal-image">
            </div>
            <!-- Slider 5 -->
            <div class="diagonal-column" data-direction="down">
                <img src="src/img/diagonal13.png" alt="Character 13" class="diagonal-image">
                <img src="src/img/diagonal14.png" alt="Character 14" class="diagonal-image">
                <img src="src/img/diagonal15.png" alt="Character 15" class="diagonal-image">
                <img src="src/img/diagonal16.png" alt="Character 16" class="diagonal-image">
                <img src="src/img/diagonal13.png" alt="Character 13" class="diagonal-image">
                <img src="src/img/diagonal14.png" alt="Character 14" class="diagonal-image">
                <img src="src/img/diagonal15.png" alt="Character 15" class="diagonal-image">
                <img src="src/img/diagonal16.png" alt="Character 16" class="diagonal-image">
            </div>
            <!-- Slider 6 -->
            <div class="diagonal-column" data-direction="up">
                <img src="src/img/diagonal16.png" alt="Character 16" class="diagonal-image">
                <img src="src/img/diagonal17.png" alt="Character 17" class="diagonal-image">
                <img src="src/img/diagonal18.png" alt="Character 18" class="diagonal-image">
                <img src="src/img/diagonal19.png" alt="Character 19" class="diagonal-image">
                <img src="src/img/diagonal16.png" alt="Character 16" class="diagonal-image">
                <img src="src/img/diagonal17.png" alt="Character 17" class="diagonal-image">
                <img src="src/img/diagonal18.png" alt="Character 18" class="diagonal-image">
                <img src="src/img/diagonal19.png" alt="Character 19" class="diagonal-image">
            </div>
            <!-- Slider 7 -->
            <div class="diagonal-column" data-direction="down">
                <img src="src/img/diagonal19.png" alt="Character 19" class="diagonal-image">
                <img src="src/img/diagonal20.png" alt="Character 20" class="diagonal-image">
                <img src="src/img/diagonal21.png" alt="Character 21" class="diagonal-image">
                <img src="src/img/diagonal22.png" alt="Character 22" class="diagonal-image">
                <img src="src/img/diagonal19.png" alt="Character 19" class="diagonal-image">
                <img src="src/img/diagonal20.png" alt="Character 20" class="diagonal-image">
                <img src="src/img/diagonal21.png" alt="Character 21" class="diagonal-image">
                <img src="src/img/diagonal22.png" alt="Character 22" class="diagonal-image">
            </div>
            <!-- Slider 8 -->
            <div class="diagonal-column" data-direction="up">
                <img src="src/img/diagonal22.png" alt="Character 22" class="diagonal-image">
                <img src="src/img/diagonal23.png" alt="Character 23" class="diagonal-image">
                <img src="src/img/diagonal24.png" alt="Character 24" class="diagonal-image">
                <img src="src/img/diagonal1.png" alt="Character 1" class="diagonal-image">
                <img src="src/img/diagonal22.png" alt="Character 22" class="diagonal-image">
                <img src="src/img/diagonal23.png" alt="Character 23" class="diagonal-image">
                <img src="src/img/diagonal24.png" alt="Character 24" class="diagonal-image">
                <img src="src/img/diagonal1.png" alt="Character 1" class="diagonal-image">
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer scroll-animate">
        <div class="footer-content">
            <div class="footer-left">
                <h3>Hollow Knight</h3>
                <p>A fanmade web for web development project</p>
                <p>Created by:</p>
                <p>- M. Umar Faiz Alfa Rizqy</p>
                <p>- Nathanael Jovan Wahyudi</p> 
            </div>
        </div>
    </footer>

    <audio id="bgMusic" loop>
        <source src="src/music/CityOfTears.mp3" type="audio/mpeg">
    </audio>
    
    <button id="musicToggle" class="music-toggle">🔊</button>

    <script>
        // Hamburger Menu Toggle
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navContainer = document.getElementById('navContainer');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navContainer.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenuOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            navContainer.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when nav link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navContainer.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Music Controls
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
            currentIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
            showSlide(currentIndex);
        });

        rightArrow.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % carouselSlides.length;
            showSlide(currentIndex);
        });

        // Character carousel data
        const characterData = [
            {
                preview: 'src/vid/HorNeitPrev.mp4',
                main: 'src/img/ZaHornet.gif'
            },
            {
                preview: 'src/vid/NaitPrev.mp4',
                main: 'src/img/NightSit.gif'
            }
        ];

        let currentCharIndex = 0;

        // Update character display
        function updateCharacter(index) {
            const char = characterData[index];
            
            // Update images with fade effect
            const charPreview = document.getElementById('charPreview');
            const charMain = document.getElementById('charMain');
            const textboxBg = document.querySelector('.textbox-bg');
            
            charPreview.style.opacity = '0';
            charMain.style.opacity = '0';
            textboxBg.style.opacity = '0';
            
            setTimeout(() => {
                charPreview.src = char.preview;
                charMain.src = char.main;
                charPreview.alt = char.title + ' Preview';
                charMain.alt = char.title;
                
                // Change textbox based on character
                if (index === 1) {
                    textboxBg.src = 'src/img/textboox-2.png';
                } else {
                    textboxBg.src = 'src/img/textboox.png';
                }
                
                charPreview.style.opacity = '1';
                charMain.style.opacity = '1';
                textboxBg.style.opacity = '1';
            }, 300);
            
            // Update active logo
            document.querySelectorAll('.attr-logo').forEach((logo, i) => {
                logo.classList.toggle('active', i === index);
            });
        }

        // Character navigation buttons
        document.getElementById('charPrevBtn').addEventListener('click', () => {
            currentCharIndex = (currentCharIndex - 1 + characterData.length) % characterData.length;
            updateCharacter(currentCharIndex);
        });

        document.getElementById('charNextBtn').addEventListener('click', () => {
            currentCharIndex = (currentCharIndex + 1) % characterData.length;
            updateCharacter(currentCharIndex);
        });

        // Logo click navigation
        document.querySelectorAll('.attr-logo').forEach((logo, index) => {
            logo.addEventListener('click', () => {
                currentCharIndex = index;
                updateCharacter(currentCharIndex);
            });
        });

        // Initialize first character
        updateCharacter(0);

        // ============================================================================
        // SCROLL ENTRANCE ANIMATIONS
        // ============================================================================
        const scrollAnimateElements = document.querySelectorAll(
            '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale'
        );

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation to improve performance
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: '0px 0px -100px 0px' // Trigger slightly before element enters viewport
        });

        scrollAnimateElements.forEach(element => {
            scrollObserver.observe(element);
        });
    </script>
</body>
</html>