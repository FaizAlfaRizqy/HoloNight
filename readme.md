# 🎮 HoloNight - Hollow Knight Web Game

![Hollow Knight](https://img.shields.io/badge/Game-Hollow%20Knight-blue)
![PHP](https://img.shields.io/badge/PHP-7.4+-purple)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

A fan-made web-based Hollow Knight game developed as a Web Programming project. Experience the atmospheric world of Hallownest through your browser with custom gameplay mechanics, leaderboard system, and authentic game assets.

## 📋 Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Game Features](#game-features)
- [Screenshots](#screenshots)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

## ✨ Features

### Core Features
- 🎯 **Playable Web Game** - Browser-based Hollow Knight gameplay experience
- 👤 **User Authentication** - Secure registration and login system
- 🏆 **Leaderboard System** - Global score tracking and rankings
- 📱 **Responsive Design** - Optimized for various screen sizes with mobile detection
- 🎵 **Audio Integration** - Background music and sound effects
- 📖 **Lore & Story** - Interactive story carousel showcasing Hallownest's history
- 🎨 **Character Gallery** - Detailed character information and animations

### Technical Features
- Session management for user authentication
- Real-time score saving to database
- Dynamic content loading with AJAX
- Smooth animations and transitions
- Video background integration
- Auto-playing image sliders

## 🛠️ Technologies Used

### Backend
- **PHP 7.4+** - Server-side logic and database operations
- **MySQL** - Database management for users and scores

### Frontend
- **HTML5** - Structure and Canvas for game rendering
- **CSS3** - Styling, animations, and responsive design
- **JavaScript (ES6+)** - Game logic and interactivity

### Game Development
- **HTML5 Canvas** - Game rendering engine
- **Custom Game Engine** - Built with vanilla JavaScript
- **Sprite Animation System** - Character and enemy animations

### Assets
- Game sprites and animations
- Background music and sound effects
- Video backgrounds
- Custom UI elements

## 📦 Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Modern web browser (Chrome, Firefox, Edge)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/holonight.git
   cd holonight
   ```

2. **Set Up Web Server**
   
   - Place project files in your web server directory (e.g., `htdocs`, `www`)
   - Ensure PHP is enabled on your server
   - Configure virtual host if needed

3. **Access the Application**
   
   Open your browser and navigate to:
   ```
   http://localhost/holonight
   ```

## 🎮 Usage

### Registration & Login
1. Navigate to the homepage
2. Click "Register" to create a new account
3. Login with your credentials
4. You'll be redirected to the main page

### Playing the Game
1. From the main menu, click "PLAY GAME"
2. Use keyboard controls to play:
   - **Arrow Keys / WASD** - Movement
   - **Space / Z** - Attack
   - **X** - Special ability
   - **C** - Dash

3. Your score will be automatically saved to the leaderboard

### Viewing Leaderboard
1. Click "LEADERBOARD" from the navigation menu
2. View top players and their scores
3. See your ranking among other players

## 📁 Project Structure

```
HoloNight/
├── auth/                   # Authentication pages
│   ├── login.php
│   ├── register.php
│   └── logout.php
├── config/                 # Configuration files
│   └── koneksi.php        # Database connection
├── game/                   # Game files
│   ├── game.php           # Main game page
│   ├── save_score.php     # Score saving endpoint
│   ├── css/               # Game stylesheets
│   └── js/                # Game JavaScript files
│       ├── game.js        # Main game logic
│       ├── player.js      # Player mechanics
│       ├── enemy.js       # Enemy AI
│       ├── barrel.js      # Object interactions
│       └── config.js      # Game configuration
├── includes/              # Shared PHP includes
│   └── session_check.php  # Session management
├── src/                   # Assets directory
│   ├── background/        # Background images/videos
│   ├── game/              # Game sprites and assets
│   ├── img/               # UI images
│   ├── music/             # Background music
│   └── vid/               # Video assets
├── style/                 # Global stylesheets
│   ├── main.css
│   ├── game.css
│   ├── login.css
│   └── leaderboard.css
├── index.php              # Main landing page
├── leaderboard.php        # Leaderboard page
├── howtoplay.php          # Game instructions
└── mobile.html            # Mobile device warning
```

## 🎯 Game Features

### Playable Characters
- **The Knight** - The silent protagonist with agile movements
- **Hornet** - Fast-paced combat style with unique abilities

### Enemies
- **Crawlid** - Basic crawling enemy
- **Boofly** - Flying insect enemy
- **Boss Encounters** - Challenging boss fights with unique patterns

### Game Mechanics
- Smooth platforming controls
- Combat system with attack combos
- Dash ability for quick movement
- Health management system
- Score and progression tracking
- Particle effects for enhanced gameplay

### Visual Features
- Sprite-based animations
- Parallax scrolling backgrounds
- Dynamic camera system
- Screen shake effects
- Smooth transitions and effects


## Demo Gameplay
[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)]([https://www.youtube.com/watch?v=ge8Ze9Tht-Q]


## 👥 Authors

<table>
  <tr>
    <td align="center">
      <strong>M. Umar Faiz Alfa Rizqy</strong><br/>
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <strong>Nathanael Jovan Wahyudi</strong><br/>
      <sub>Backend Developer</sub>
    </td>
  </tr>
</table>

### Contributions
- **M. Umar Faiz Alfa Rizqy** - Frontend design, UI/UX, game assets integration
- **Nathanael Jovan Wahyudi** - Backend development, database design, game mechanics

## 🙏 Acknowledgments

- **Team Cherry** - Original Hollow Knight game creators
- **Hollow Knight Community** - For inspiration and assets

## ⚖️ Disclaimer

This is a fan-made project created for educational purposes as part of a Web Programming course. Hollow Knight and all related assets are property of Team Cherry. This project is not affiliated with or endorsed by Team Cherry.

## 📝 License

This project is created for educational purposes. All Hollow Knight intellectual property rights belong to Team Cherry.

---

<div align="center">
  <p>Made with ❤️ for Web Programming Course</p>
  <p>© 2024 HoloNight Project Team</p>
</div>
