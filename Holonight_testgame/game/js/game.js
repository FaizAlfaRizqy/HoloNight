// =============================================================================
// HOLLOW KNIGHT - WAVE SURVIVAL GAME
// Main Game Engine dengan Wave System & Asset Integration
// =============================================================================

console.log("🎮 Loading Hollow Knight Wave Survival.. .");

// =============================================================================
// CANVAS & CONTEXT SETUP
// =============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas. getContext('2d');

canvas.width = CONFIG.CANVAS. WIDTH;
canvas.height = CONFIG.CANVAS.HEIGHT;

// =============================================================================
// ASSET LOADING SYSTEM
// =============================================================================
const Assets = {
    // Hero Sprites
    hero: {
        idle: [],
        attack: []
    },
    
    // Enemy Sprites
    enemies: {
        crawlid:  {
            walk: [],
            die: []
        },
        boofly: {
            fly: [],
            die: []
        },
        boss: []
    },
    
    // Environment
    environment: {
        background: null,
        foreground:  null,
        platform: null,
        floor: null
    },
    
    // Loading state
    loaded: 0,
    total: 0,
    isReady: false
};

// Load Image Helper
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            Assets.loaded++;
            updateLoadingProgress();
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`⚠️ Failed to load:  ${src}`);
            Assets.loaded++;
            updateLoadingProgress();
            resolve(null); // Continue even if image fails
        };
        img.src = src;
        Assets.total++;
    });
}

// Update Loading Progress
function updateLoadingProgress() {
    const progress = Math.floor((Assets.loaded / Assets.total) * 100);
    console.log(`📦 Loading assets...  ${progress}%`);
    
    if (Assets.loaded === Assets.total) {
        Assets.isReady = true;
        console.log("✅ All assets loaded!");
        initGame();
    }
}

// Load All Assets
async function loadAssets() {
    console.log("📦 Starting asset loading...");
    
    // Hero Idle Animation (5 frames)
    for (let i = 1; i <= 5; i++) {
        const img = await loadImage(`../src/game/hero/idle/idle_0${i}.png`);
        Assets.hero.idle.push(img);
    }
    
    // Hero Attack Animation (2 frames)
    for (let i = 1; i <= 2; i++) {
        const img = await loadImage(`../src/game/hero/attack/attack_0${i}.png`);
        Assets.hero.attack.push(img);
    }
    
    // Crawlid Walk Animation (4 frames)
    for (let i = 1; i <= 4; i++) {
        const img = await loadImage(`../src/game/crawlid/walk/crawlid_0${i}.png`);
        Assets.enemies.crawlid.walk.push(img);
    }
    
    // Crawlid Die Animation (check how many frames exist)
    for (let i = 1; i <= 3; i++) {
        const img = await loadImage(`../src/game/crawlid/die/die_0${i}.png`);
        if (img) Assets.enemies.crawlid.die.push(img);
    }
    
    // Environment
    Assets.environment.background = await loadImage(`../src/game/background.webp`);
    Assets.environment.foreground = await loadImage(`../src/game/foreground/foreground.png`);
    Assets.environment.platform = await loadImage(`../src/game/platform/platform.png`);
    Assets.environment.floor = await loadImage(`../src/game/object/floor_6.png`);
}

// =============================================================================
// GAME STATE VARIABLES
// =============================================================================
let player;
let enemies = [];
let currentWave = 1;
let enemiesKilledThisWave = 0;
let score = 0;
let gameState = CONFIG.STATES.PLAYING;
let lastTime = Date.now();

// Wave Management
const waveManager = {
    currentWave: 1,
    enemiesSpawned: 0,
    enemiesRequired: 0,
    enemiesKilled:  0,
    isTransitioning: false,
    transitionTimer: 0,
    spawnTimer: 0,
    spawnDelay: CONFIG.WAVE.SPAWN_DELAY
};

// =============================================================================
// PLATFORM SYSTEM
// =============================================================================
const platforms = [
    // Ground (full width)
    { 
        x: 0, 
        y: CONFIG.PHYSICS.GROUND_Y, 
        width: CONFIG.CANVAS.WIDTH, 
        height: CONFIG.PHYSICS.GROUND_HEIGHT,
        type: 'ground'
    },
    // Floating platforms
    { x: 150, y: 400, width: 200, height: 20, type: 'platform' },
    { x:  400, y: 350, width: 200, height:  20, type: 'platform' },
    { x: 650, y: 400, width: 200, height:  20, type: 'platform' }
];

// =============================================================================
// GAME INITIALIZATION
// =============================================================================
function initGame() {
    console.log("🎮 Initializing game...");
    
    // Reset game state
    gameState = CONFIG.STATES.PLAYING;
    currentWave = 1;
    score = 0;
    enemies = [];
    
    // Create player
    player = new Player(100, 300);
    
    // Initialize wave
    waveManager.currentWave = 1;
    waveManager.enemiesKilled = 0;
    startWave(1);
    
    // Hide game over screen
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Update UI
    updateUI();
    
    console.log("✅ Game initialized!");
}

// =============================================================================
// WAVE SYSTEM
// =============================================================================
function startWave(waveNumber) {
    console.log(`🌊 Starting Wave ${waveNumber}`);
    
    waveManager.currentWave = waveNumber;
    waveManager.enemiesKilled = 0;
    waveManager.enemiesSpawned = 0;
    
    // Calculate enemies for this wave
    const baseCount = CONFIG.WAVE. BASE_ENEMY_COUNT;
    const increment = CONFIG.WAVE. ENEMY_INCREMENT;
    waveManager.enemiesRequired = Math.min(
        baseCount + (waveNumber - 1) * increment,
        CONFIG.WAVE.MAX_ENEMIES_PER_WAVE
    );
    
    // Check if boss wave
    const isBossWave = (waveNumber % 5 === 0);
    
    if (isBossWave) {
        console.log("💀 BOSS WAVE!");
        // TODO: Spawn boss when boss assets ready
        // For now, spawn stronger enemies
        waveManager.enemiesRequired = Math.ceil(waveManager.enemiesRequired / 2);
    }
    
    console.log(`👾 Enemies to spawn: ${waveManager.enemiesRequired}`);
    
    // Reset spawn timer
    waveManager. spawnTimer = 0;
    waveManager.isTransitioning = false;
    
    // Update UI
    updateUI();
}

function spawnEnemy() {
    if (waveManager.enemiesSpawned >= waveManager.enemiesRequired) {
        return;
    }
    
    // Random spawn position
    const spawnMargin = CONFIG.ENEMY.SPAWN_MARGIN;
    const spawnX = spawnMargin + Math.random() * (CONFIG.CANVAS.WIDTH - spawnMargin * 2);
    const spawnY = 200; // Will fall to ground
    
    // Create enemy
    const enemy = new Enemy(spawnX, spawnY, waveManager.currentWave);
    enemies.push(enemy);
    
    waveManager.enemiesSpawned++;
    
    console.log(`👾 Spawned enemy ${waveManager.enemiesSpawned}/${waveManager.enemiesRequired}`);
}

function checkWaveComplete() {
    // Check if all enemies spawned and killed
    const allSpawned = waveManager.enemiesSpawned >= waveManager.enemiesRequired;
    const allKilled = enemies.filter(e => ! e.isDead).length === 0;
    
    if (allSpawned && allKilled && ! waveManager.isTransitioning) {
        waveComplete();
    }
}

function waveComplete() {
    console.log(`✅ Wave ${waveManager. currentWave} Complete!`);
    
    // Add wave bonus
    const waveBonus = CONFIG.SCORE.WAVE_COMPLETE;
    score += waveBonus;
    
    // Start transition
    waveManager.isTransitioning = true;
    waveManager.transitionTimer = 120; // 2 seconds at 60fps
    
    // Show wave complete message
    showWaveTransition();
}

function showWaveTransition() {
    console.log("🎉 Wave Complete!");
    // You can add visual feedback here
}

function updateWaveTransition(deltaTime) {
    if (!waveManager.isTransitioning) return;
    
    waveManager.transitionTimer -= deltaTime;
    
    if (waveManager.transitionTimer <= 0) {
        // Start next wave
        startWave(waveManager.currentWave + 1);
    }
}

// =============================================================================
// ENEMY SPAWNING SYSTEM
// =============================================================================
function updateSpawning(deltaTime) {
    if (waveManager.isTransitioning) return;
    if (waveManager.enemiesSpawned >= waveManager.enemiesRequired) return;
    
    waveManager.spawnTimer += deltaTime;
    
    if (waveManager.spawnTimer >= waveManager.spawnDelay) {
        spawnEnemy();
        waveManager.spawnTimer = 0;
    }
}

// =============================================================================
// COLLISION DETECTION
// =============================================================================
function checkPlayerAttackCollisions() {
    if (! player.isAttacking) return;
    
    const hitbox = player.getAttackHitbox();
    if (!hitbox) return;
    
    for (let enemy of enemies) {
        if (enemy.isDead) continue;
        
        // Simple AABB collision
        if (hitbox.x < enemy.x + enemy.width &&
            hitbox.x + hitbox.width > enemy.x &&
            hitbox.y < enemy.y + enemy.height &&
            hitbox. y + hitbox.height > enemy.y) {
            
            // Hit enemy
            const killed = enemy.takeDamage(player.attackDamage);
            
            if (killed) {
                score += CONFIG.SCORE.ENEMY_KILL;
                waveManager.enemiesKilled++;
                console.log(`💀 Enemy killed! (${waveManager.enemiesKilled}/${waveManager.enemiesRequired})`);
            }
            
            // Only hit one enemy per attack frame
            break;
        }
    }
}

function checkEnemyPlayerCollisions() {
    for (let enemy of enemies) {
        if (enemy.isDead) continue;
        
        // Check collision with player
        // This is handled in enemy.update() -> enemy.checkPlayerCollision()
    }
}

// =============================================================================
// GAME UPDATE LOOP
// =============================================================================
function update(deltaTime) {
    if (gameState !== CONFIG.STATES.PLAYING) return;
    
    // Update player
    player.update(deltaTime);
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(deltaTime, player);
        
        // Remove dead enemies after animation (optional cleanup)
        // For now keep them for visual feedback
    }
    
    // Check collisions
    checkPlayerAttackCollisions();
    
    // Update wave system
    updateSpawning(deltaTime);
    updateWaveTransition(deltaTime);
    checkWaveComplete();
    
    // Check game over
    if (! player.isAlive()) {
        gameOver();
    }
    
    // Update UI
    updateUI();
}

// =============================================================================
// RENDERING
// =============================================================================
function draw() {
    // Clear canvas
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (Assets.environment.background && Assets.environment.background.complete) {
        ctx.drawImage(Assets.environment.background, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw platforms
    drawPlatforms();
    
    // Draw enemies (behind player)
    for (let enemy of enemies) {
        enemy.draw(ctx);
    }
    
    // Draw player
    player. draw(ctx, Assets);
    
    // Draw foreground
    if (Assets.environment.foreground && Assets.environment. foreground.complete) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(Assets.environment.foreground, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }
    
    // Draw wave transition overlay
    if (waveManager. isTransitioning) {
        drawWaveTransition();
    }
}

function drawPlatforms() {
    for (let platform of platforms) {
        if (platform.type === 'ground') {
            // Draw floor tile
            if (Assets.environment.floor && Assets.environment.floor.complete) {
                const tileWidth = Assets.environment.floor.width * 2;
                const tileHeight = Assets.environment.floor.height * 2;
                
                for (let x = platform.x; x < platform.x + platform.width; x += tileWidth) {
                    ctx.drawImage(
                        Assets.environment.floor,
                        x, platform.y,
                        tileWidth, platform.height
                    );
                }
            } else {
                // Fallback
                ctx.fillStyle = CONFIG.COLORS. GROUND;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.strokeStyle = CONFIG.COLORS. GROUND_BORDER;
                ctx.lineWidth = 3;
                ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        } else {
            // Draw platform
            if (Assets.environment.platform && Assets.environment.platform.complete) {
                ctx.drawImage(
                    Assets.environment.platform,
                    platform.x, platform.y,
                    platform. width, platform.height
                );
            } else {
                // Fallback
                ctx.fillStyle = CONFIG.COLORS. GROUND;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.strokeStyle = CONFIG.COLORS.GROUND_BORDER;
                ctx.lineWidth = 2;
                ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        }
    }
}

function drawWaveTransition() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas. width, canvas.height);
    
    // Wave complete text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const alpha = Math.sin((waveManager.transitionTimer / 120) * Math.PI);
    ctx.globalAlpha = alpha;
    
    ctx.fillText(`WAVE ${waveManager.currentWave} COMPLETE! `, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`+${CONFIG.SCORE.WAVE_COMPLETE} BONUS`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Next wave starting... `, canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'left';
}

// =============================================================================
// UI UPDATE
// =============================================================================
function updateUI() {
    // Update health bar
    const healthBar = document.getElementById('playerHealthBar');
    const healthText = document.getElementById('playerHpText');
    if (healthBar && healthText) {
        const healthPercent = (player.hp / player.maxHp) * 100;
        healthBar. style.width = healthPercent + '%';
        healthText.textContent = `${player.hp} / ${player.maxHp}`;
    }
    
    // Update wave number
    const waveNumber = document.getElementById('waveNumber');
    if (waveNumber) {
        waveNumber.textContent = waveManager.currentWave;
    }
    
    // Update score
    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        scoreValue.textContent = score. toLocaleString();
    }
    
    // Update enemy count
    const enemyCount = document.getElementById('enemyCount');
    if (enemyCount) {
        const aliveCount = enemies.filter(e => !e.isDead).length;
        enemyCount.textContent = `${aliveCount} / ${waveManager.enemiesRequired}`;
    }
}

// =============================================================================
// GAME OVER
// =============================================================================
function gameOver() {
    console.log("💀 GAME OVER!");
    
    gameState = CONFIG.STATES. GAME_OVER;
    
    // Update final stats
    document.getElementById('finalWave').textContent = waveManager. currentWave;
    document. getElementById('finalScore').textContent = score.toLocaleString();
    
    // Show game over screen
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// =============================================================================
// GAME CONTROLS
// =============================================================================
function restartGame() {
    console.log("🔄 Restarting game.. .");
    
    // Clear enemies
    enemies = [];
    
    // Reset wave manager
    waveManager.currentWave = 1;
    waveManager.enemiesSpawned = 0;
    waveManager.enemiesKilled = 0;
    waveManager.isTransitioning = false;
    
    // Reinitialize
    initGame();
}

// Save Score (INTEGRATED dengan database)
function saveScore() {
    const hpBonus = Math.floor(player.hp * CONFIG.SCORE.REMAINING_HP_MULTIPLIER);
    const finalScore = score + hpBonus;
    
    console.log("💾 Saving score:", finalScore, "Wave:", waveManager.currentWave);
    
    // Show loading state
    const saveBtn = document.querySelector('[onclick="saveScore()"]');
    if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn. disabled = true;
    }
    
    // Send to server
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body:  `score=${finalScore}&wave=${waveManager.currentWave}&game_time=0`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Score Saved Successfully!\n\nScore: ${data.score. toLocaleString()}\nWave: ${data.wave}\nYour Rank: #${data.rank}\n\nRedirecting to leaderboard...`);
            window.location.href = '../leaderboard.php';
        } else {
            alert('❌ Failed to save score:\n' + data.message);
            if (saveBtn) {
                saveBtn.textContent = 'Save Score';
                saveBtn. disabled = false;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('❌ Error saving score:\n' + error.message);
        if (saveBtn) {
            saveBtn.textContent = 'Save Score';
            saveBtn. disabled = false;
        }
    });
}

// =============================================================================
// MAIN GAME LOOP
// =============================================================================
function gameLoop() {
    // Gunakan deltaTime = 1 per frame agar kecepatan game normal
    const deltaTime = 1;

    // Update
    update(deltaTime);

    // Draw
    draw();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// =============================================================================
// START GAME
// =============================================================================
console.log("🎮 Hollow Knight Wave Survival loaded!");
console.log("📦 Loading assets...");

// Start loading assets
loadAssets().then(() => {
    console.log("✅ Assets loaded!  Starting game...");
    gameLoop();
});

// Expose functions to global scope for HTML onclick
window.restartGame = restartGame;
window.saveScore = saveScore;

console.log("✅ Game. js loaded successfully!");