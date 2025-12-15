// =============================================================================
// PIXEL PERFECT COLLISION UTILITY
// =============================================================================
// spriteA, xA, yA, spriteB, xB, yB, width, height
function pixelPerfectCollision(spriteA, xA, yA, spriteB, xB, yB, width, height) {
    // Buat offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw spriteA
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(spriteA, xA < xB ? 0 : xA - xB, yA < yB ? 0 : yA - yB);
    const imageDataA = ctx.getImageData(0, 0, width, height).data;

    // Draw spriteB with 'destination-in' to get overlap
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(spriteB, xB < xA ? 0 : xB - xA, yB < yA ? 0 : yB - yA);
    const imageDataB = ctx.getImageData(0, 0, width, height).data;

    // Cek overlap pixel alpha > 0 di kedua image
    for (let i = 0; i < width * height; i++) {
        if (imageDataA[i * 4 + 3] > 0 && imageDataB[i * 4 + 3] > 0) {
            return true;
        }
    }
    return false;
}
// =============================================================================
// HOLLOW KNIGHT - WAVE SURVIVAL GAME
// Main Game Engine dengan Wave System & Asset Integration
// =============================================================================

console.log("🎮 Loading Hollow Knight Wave Survival...");

// =============================================================================
// CANVAS & CONTEXT SETUP
// =============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CONFIG.CANVAS.WIDTH;
canvas.height = CONFIG.CANVAS.HEIGHT;

// =============================================================================
// ASSET LOADING SYSTEM
// =============================================================================
// AUDIO SYSTEM
const Sounds = {
    bgm: new Audio('../src/game/audio/bgm.mp3'),
    hero_hit: new Audio('../src/game/audio/hero_hit.wav'),
    hero_jump: new Audio('../src/game/audio/hero_jump.mp3'),
    sword: new Audio('../src/game/audio/hit.wav'),
    hit: new Audio('../src/game/audio/hit.wav'),
    crawlid_death: new Audio('../src/game/audio/crawlid_death.wav')
};
Sounds.bgm.loop = true;
Sounds.bgm.volume = 0.3;
for (const key of Object.keys(Sounds)) {
    if (key !== 'bgm') Sounds[key].volume = 0.7;
}
function playSound(sound) {
    if (!sound) return;
    // Special handling for BGM: only play if not already playing
    if (sound === Sounds.bgm) {
        // If already playing, do nothing
        if (!sound.paused && !sound.ended) return;
        // Reset to start if ended
        if (sound.ended) sound.currentTime = 0;
        // Try to play
        sound.play().catch(() => {});
    } else {
        // For SFX, always clone for overlap
        const sfx = sound.cloneNode();
        sfx.volume = sound.volume;
        sfx.play();
    }
}

// Expose to global scope for use in player.js/enemy.js
window.Sounds = Sounds;
window.playSound = playSound;

const Assets = {
    // Hero Sprites
    hero: {
        idle: [],
        attack: [],
        splash: []
    },
    
    // Enemy Sprites
    enemies: {
        crawlid: {
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
        foreground: null,
        platform: null,
        floor: null,
        barrel: null
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
            console.warn(`⚠️ Failed to load: ${src}`);
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
    console.log(`📦 Loading assets... ${progress}%`);
    
    if (Assets.loaded === Assets.total) {
        Assets.isReady = true;
        console.log("✅ All assets loaded!");
        console.log(`   - Hero idle: ${Assets.hero.idle.length} frames`);
        console.log(`   - Hero attack: ${Assets.hero.attack.length} frames`);
        console.log(`   - Hero splash: ${Assets.hero.splash.length} frames`);
        initGame();
    }
}

// Load All Assets
async function loadAssets() {
    console.log("📦 Starting asset loading...");

    // Start BGM after user interaction (browser policy)
    function tryPlayBGM() {
        playSound(Sounds.bgm);
        document.removeEventListener('keydown', tryPlayBGM);
        document.removeEventListener('click', tryPlayBGM);
    }
    document.addEventListener('keydown', tryPlayBGM, { once: true });
    document.addEventListener('click', tryPlayBGM, { once: true });

    // Hero Idle Animation (5 frames)
    for (let i = 1; i <= 5; i++) {
        const img = await loadImage(`../src/game/hero/idle/idle_0${i}.png`);
        Assets.hero.idle.push(img);
    }

    // Hero Walk Animation (5 frames)
    for (let i = 1; i <= 5; i++) {
        const img = await loadImage(`../src/game/hero/walk/walk_0${i}.png`);
        Assets.hero.walk = Assets.hero.walk || [];
        Assets.hero.walk.push(img);
    }

    // Hero Attack Animation (2 frames)
    for (let i = 1; i <= 2; i++) {
        const img = await loadImage(`../src/game/hero/attack/attack_0${i}.png`);
        Assets.hero.attack.push(img);
    }
    
    // Hero Splash Attack Effect (2 frames)
    console.log('📦 Loading splash animations...');
    const splash1 = await loadImage(`../src/game/hero/splash_2/splash-2_01.png`);
    if (splash1) {
        Assets.hero.splash.push(splash1);
        console.log('✅ Splash frame 1 loaded');
    }
    const splash2 = await loadImage(`../src/game/hero/splash_2/splash-2_02.png`);
    if (splash2) {
        Assets.hero.splash.push(splash2);
        console.log('✅ Splash frame 2 loaded');
    }
    console.log('📦 Total splash frames loaded:', Assets.hero.splash.length);
    
    // Crawlid Walk Animation (4 frames)
    for (let i = 1; i <= 4; i++) {
        const img = await loadImage(`../src/game/crawlid/walk/crawlid_0${i}.png`);
        Assets.enemies.crawlid.walk.push(img);
    }

    // Crawlid Die Animation (3 frames)
    for (let i = 1; i <= 3; i++) {
        const img = await loadImage(`../src/game/crawlid/die/die_0${i}.png`);
        if (img) Assets.enemies.crawlid.die.push(img);
    }

    // Boofly Fly Animation (5 frames)
    for (let i = 1; i <= 5; i++) {
        const img = await loadImage(`../src/game/boofly/fly/fly_0${i}.png`);
        Assets.enemies.boofly.fly.push(img);
    }

    // Boofly Die Animation (3 frames)
    for (let i = 1; i <= 3; i++) {
        const img = await loadImage(`../src/game/boofly/die/die_0${i}.png`);
        if (img) Assets.enemies.boofly.die.push(img);
    }

    // Boss Idle Animation (5 frames)
    Assets.enemies.boss = { idle: [], attack: [], die: [], jump: [] };
    for (let i = 1; i <= 5; i++) {
        const img = await loadImage(`../src/game/boss/idle/idle_0${i}.png`);
        Assets.enemies.boss.idle.push(img);
    }

    // Boss Attack Animation (3 frames, misal)
    for (let i = 1; i <= 3; i++) {
        const img = await loadImage(`../src/game/boss/attack/attack_0${i}.png`);
        Assets.enemies.boss.attack.push(img);
    }

    // Boss Jump Animation (7 frames)
    for (let i = 1; i <= 7; i++) {
        const img = await loadImage(`../src/game/boss/jump/jump_0${i}.png`);
        if (img) Assets.enemies.boss.jump.push(img);
    }

    // Boss Die Animation (1 frame, fallback)
    const bossDie = await loadImage(`../src/game/boss/die/die_01.png`);
    if (bossDie) Assets.enemies.boss.die.push(bossDie);

    // Environment
    Assets.environment.background = await loadImage(`../src/game/object/background_2.png`);
    Assets.environment.foreground = await loadImage(`../src/game/foreground/foreground.png`);
    Assets.environment.platform = await loadImage(`../src/game/platform/platform.png`);
    Assets.environment.floor = await loadImage(`../src/game/object/floor_6.png`);
    Assets.environment.barrel = await loadImage(`../src/game/object/barrel.png`);
}

// =============================================================================
// GAME STATE VARIABLES
// =============================================================================
let player;
let enemies = [];
let barrels = []; // Barrel objects for boss wave
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
    enemiesKilled: 0,
    isTransitioning: false,
    transitionTimer: 0,
    spawnTimer: 0,
    spawnDelay: CONFIG.WAVE.SPAWN_DELAY
};

// Barrel Spawn System (for boss waves)
const barrelSpawner = {
    isActive: false,
    spawnTimer: 0,
    spawnInterval: 90, // Spawn 3 barrels every 1.5 seconds (90 frames at 60fps)
    minX: 100, // Minimum x position for spawn
    maxX: 800, // Maximum x position for spawn
    barrelCount: 3 // Number of barrels to spawn at once
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
    { x: 400, y: 350, width: 200, height: 20, type: 'platform' },
    { x: 650, y: 400, width: 200, height: 20, type: 'platform' }
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
    const baseCount = CONFIG.WAVE.BASE_ENEMY_COUNT;
    const increment = CONFIG.WAVE.ENEMY_INCREMENT;
    waveManager.enemiesRequired = Math.min(
        baseCount + (waveNumber - 1) * increment,
        CONFIG.WAVE.MAX_ENEMIES_PER_WAVE
    );
    
    // Check if boss wave
    const isBossWave = (waveNumber % CONFIG.WAVE.BOSS_WAVE_INTERVAL === 0);
    if (isBossWave) {
        console.log("👑 BOSS WAVE!");
        waveManager.enemiesRequired = 1; // Only 1 boss
        
        // Activate barrel spawner for boss wave
        barrelSpawner.isActive = true;
        barrelSpawner.spawnTimer = 0;
        console.log("🛢️ Barrel spawner activated!");
    } else {
        // Deactivate barrel spawner for normal waves
        barrelSpawner.isActive = false;
        barrels = []; // Clear existing barrels
    }
    
    console.log(`👾 Enemies to spawn: ${waveManager.enemiesRequired}`);
    
    // Reset spawn timer
    waveManager.spawnTimer = 0;
    waveManager.isTransitioning = false;

    // Staged enemy spawning: 3-second delay, then spawn 3 at a time every 3 seconds
    waveManager.stagedSpawn = {
        initialDelay: 180, // 3 seconds at 60fps
        batchDelay: 180,   // 3 seconds at 60fps
        batchSize: 3,
        timer: 0,
        state: 'waiting', // 'waiting', 'spawning', 'done'
    };
    waveManager.stagedSpawn.timer = waveManager.stagedSpawn.initialDelay;

    // No enemies spawned at start
    // Enemies will be spawned in update loop

    // Update UI
    updateUI();
}

function spawnEnemy() {
    if (waveManager.enemiesSpawned >= waveManager.enemiesRequired) {
        return;
    }
    // Random spawn position, not near player
    const minDistanceFromPlayer = 120;
    let spawnX;
    let attempts = 0;
    do {
        const spawnMargin = CONFIG.ENEMY.SPAWN_MARGIN;
        spawnX = spawnMargin + Math.random() * (CONFIG.CANVAS.WIDTH - spawnMargin * 2);
        attempts++;
    } while (Math.abs(spawnX - player.x) < minDistanceFromPlayer && attempts < 20);
    const spawnY = 200;
    // Tentukan tipe musuh sesuai wave
    let enemyType = CONFIG.ENEMY_TYPES.getTypeForWave(waveManager.currentWave);
    // Paksa boss jika boss wave
    if (waveManager.currentWave % CONFIG.WAVE.BOSS_WAVE_INTERVAL === 0) {
        enemyType = 'boss';
    }
    const enemy = new Enemy(spawnX, spawnY, waveManager.currentWave, enemyType);
    enemies.push(enemy);
    waveManager.enemiesSpawned++;
    if (enemyType === 'boss') {
        console.log('👑 Boss spawned!');
    } else {
        console.log(`👾 Spawned enemy ${waveManager.enemiesSpawned}/${waveManager.enemiesRequired}`);
    }
}

function checkWaveComplete() {
    // Check if all enemies spawned and killed
    const allSpawned = waveManager.enemiesSpawned >= waveManager.enemiesRequired;
    const allKilled = enemies.filter(e => !e.isDead).length === 0;
    
    if (allSpawned && allKilled && !waveManager.isTransitioning) {
        waveComplete();
    }
}

function waveComplete() {
    console.log(`✅ Wave ${waveManager.currentWave} Complete!`);

    // Add wave bonus
    const waveBonus = CONFIG.SCORE.WAVE_COMPLETE;
    score += waveBonus;

    // Hapus semua musuh yang sudah mati dari array enemies
    enemies = enemies.filter(enemy => !enemy.isDead);

    // Jika boss wave, reward: reset hits (full heal)
    if (waveManager.currentWave % CONFIG.WAVE.BOSS_WAVE_INTERVAL === 0) {
        player.hits = 0;
        console.log('🎁 Boss defeated! Player fully healed!');
    }

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
// COLLISION DETECTION
// =============================================================================
// ✅ FIX v3: Access global player variable
function checkPlayerAttackCollisions() {
    // Player is global, so we can access it directly
    if (!player || !player.isAttacking) return;

    const hitbox = player.getAttackHitbox();
    if (!hitbox) return;

    for (let enemy of enemies) {
        if (!enemy || enemy.isDead) continue;

        // Only skip if enemiesHitThisAttack is a Set and enemy.id exists and already hit
        if (
            player.enemiesHitThisAttack &&
            typeof player.enemiesHitThisAttack.has === 'function' &&
            enemy.id &&
            player.enemiesHitThisAttack.has(enemy.id)
        ) {
            continue;
        }

        // Simple AABB collision
        if (hitbox.x < enemy.x + enemy.width &&
            hitbox.x + hitbox.width > enemy.x &&
            hitbox.y < enemy.y + enemy.height &&
            hitbox.y + hitbox.height > enemy.y) {

            // Try to hit enemy (enemy will check its own cooldown)
            const hitResult = enemy.takeDamage(player.attackDamage, player.x);

            if (hitResult !== false) {
                // Play hit SFX
                playSound(Sounds.hit);
                // Hit was successful - add to set if id exists and Set available
                if (
                    player.enemiesHitThisAttack &&
                    typeof player.enemiesHitThisAttack.add === 'function' &&
                    enemy.id
                ) {
                    player.enemiesHitThisAttack.add(enemy.id);
                }
                console.log(`✅ Hit ${enemy.type}! Enemies hit this attack: ${player.enemiesHitThisAttack.size}`);
                
                // Check if enemy died
                if (enemy.isDead) {
                    score += CONFIG.SCORE.ENEMY_KILL;
                    waveManager.enemiesKilled++;
                    console.log(`💀 Enemy killed! (${waveManager.enemiesKilled}/${waveManager.enemiesRequired})`);
                }
            }
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
    
    // Update barrels (boss wave hazard)
    if (barrelSpawner.isActive) {
        // Spawn new barrels
        barrelSpawner.spawnTimer += deltaTime;
        if (barrelSpawner.spawnTimer >= barrelSpawner.spawnInterval) {
            barrelSpawner.spawnTimer = 0;
            
            // Spawn 3 barrels at random locations simultaneously
            const spawnedPositions = [];
            for (let i = 0; i < barrelSpawner.barrelCount; i++) {
                // Generate random x position within bounds
                let spawnX;
                let attempts = 0;
                do {
                    spawnX = Math.floor(Math.random() * (barrelSpawner.maxX - barrelSpawner.minX)) + barrelSpawner.minX;
                    attempts++;
                } while (spawnedPositions.some(pos => Math.abs(pos - spawnX) < 80) && attempts < 10); // Ensure barrels aren't too close (min 80px apart)
                
                spawnedPositions.push(spawnX);
                const barrel = new Barrel(spawnX);
                barrels.push(barrel);
            }
            console.log('🛢️×3 Barrels spawned at:', spawnedPositions);
        }
    }
    
    // Update all barrels
    for (let i = barrels.length - 1; i >= 0; i--) {
        const barrel = barrels[i];
        barrel.update(deltaTime);
        barrel.checkPlayerCollision(player);
        
        // Remove inactive barrels
        if (!barrel.isActive) {
            barrels.splice(i, 1);
        }
    }
    
    // Check collisions
    checkPlayerAttackCollisions();
    
    // Update wave system
    updateWaveTransition(deltaTime);

    // Handle staged enemy spawning
    if (typeof waveManager.stagedSpawn !== 'undefined' && waveManager.stagedSpawn) {
        const s = waveManager.stagedSpawn;
        if (s.state === 'waiting') {
            s.timer -= deltaTime;
            if (s.timer <= 0) {
                s.state = 'spawning';
                s.timer = 0;
            }
        }
        if (s.state === 'spawning') {
            // Spawn up to batchSize enemies
            let toSpawn = Math.min(s.batchSize, waveManager.enemiesRequired - waveManager.enemiesSpawned);
            for (let i = 0; i < toSpawn; i++) {
                spawnEnemy();
            }
            if (waveManager.enemiesSpawned >= waveManager.enemiesRequired) {
                s.state = 'done';
            } else {
                s.state = 'waiting';
                s.timer = s.batchDelay;
            }
        }
    }

    checkWaveComplete();
    
    // Check game over
    if (!player.isAlive()) {
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
    
    // Draw barrels (falling hazards)
    for (let barrel of barrels) {
        barrel.draw(ctx, Assets);
    }
    
    // Draw player
    player.draw(ctx, Assets);
    
    // Draw foreground
    if (Assets.environment.foreground && Assets.environment.foreground.complete) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(Assets.environment.foreground, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }
    
    // Draw wave transition overlay
    if (waveManager.isTransitioning) {
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
                ctx.fillStyle = CONFIG.COLORS.GROUND;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.strokeStyle = CONFIG.COLORS.GROUND_BORDER;
                ctx.lineWidth = 3;
                ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        } else {
            // Draw platform
            if (Assets.environment.platform && Assets.environment.platform.complete) {
                ctx.drawImage(
                    Assets.environment.platform,
                    platform.x, platform.y,
                    platform.width, platform.height
                );
            } else {
                // Fallback
                ctx.fillStyle = CONFIG.COLORS.GROUND;
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wave complete text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const alpha = Math.sin((waveManager.transitionTimer / 120) * Math.PI);
    ctx.globalAlpha = alpha;
    
    ctx.fillText(`WAVE ${waveManager.currentWave} COMPLETE!`, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`+${CONFIG.SCORE.WAVE_COMPLETE} BONUS`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Next wave starting...`, canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'left';
}

// =============================================================================
// UI UPDATE
// =============================================================================
function updateUI() {
    // Update health icons
    const healthIcons = document.querySelectorAll('.health-icon');
    if (healthIcons && player) {
        const currentHits = player.hits || 0;
        const maxHits = player.maxHits || 5;
        const remainingHealth = maxHits - currentHits;
        
        healthIcons.forEach((icon, index) => {
            if (index < remainingHealth) {
                icon.classList.remove('empty');
            } else {
                icon.classList.add('empty');
            }
        });
    }
    
    // Update wave number
    const waveDisplay = document.getElementById('waveDisplay');
    if (waveDisplay) {
        waveDisplay.textContent = waveManager.currentWave;
    }
    
    // Update score
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.textContent = score.toLocaleString();
    }
    
    // Update enemy count
    const enemiesDisplay = document.getElementById('enemiesDisplay');
    if (enemiesDisplay) {
        const aliveCount = enemies.filter(e => !e.isDead).length;
        enemiesDisplay.textContent = `${aliveCount} / ${waveManager.enemiesRequired}`;
    }
}

// =============================================================================
// GAME OVER
// =============================================================================
let scoreSaved = false;
function gameOver() {
    console.log("💀 GAME OVER!");
    gameState = CONFIG.STATES.GAME_OVER;
    const remainingHealth = player.maxHits - player.hits;
    const healthBonus = remainingHealth * 100;
    const finalScore = score + healthBonus;
    document.getElementById('finalWaveDisplay').textContent = waveManager.currentWave;
    document.getElementById('finalScoreDisplay').textContent = finalScore.toLocaleString();
    document.getElementById('gameOverScreen').style.display = 'flex';
    scoreSaved = false;
    autoSaveScore();
}

// =============================================================================
// GAME CONTROLS
// =============================================================================
function restartGame() {
    console.log("🔄 Restarting game...");
    
    // Clear enemies and barrels
    enemies = [];
    barrels = [];
    
    // Reset wave manager
    waveManager.currentWave = 1;
    waveManager.enemiesSpawned = 0;
    waveManager.enemiesKilled = 0;
    waveManager.isTransitioning = false;
    
    // Reset barrel spawner
    barrelSpawner.isActive = false;
    barrelSpawner.spawnTimer = 0;
    
    // Reinitialize
    initGame();
}

// Auto Save Score (dipanggil otomatis saat game over)
function autoSaveScore() {
    if (scoreSaved) return;
    scoreSaved = true;
    const remainingHealth = player.maxHits - player.hits;
    const healthBonus = remainingHealth * 100;
    const finalScore = score + healthBonus;
    console.log("💾 Auto saving score:", finalScore, "Wave:", waveManager.currentWave);
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `score=${finalScore}&wave=${waveManager.currentWave}&game_time=0`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("✅ Score saved! Rank: #" + data.rank);
            const rankElement = document.getElementById('playerRank');
            if (rankElement) {
                rankElement.textContent = '#' + data.rank;
            }
        } else {
            console.error('❌ Failed to save score:', data.message);
        }
    })
    .catch(error => {
        console.error('❌ Error saving score:', error);
    });
}

// Save Score (INTEGRATED dengan database) - untuk manual save jika diperlukan
function saveScore() {
    if (scoreSaved) return;
    scoreSaved = true;
    const remainingHealth = player.maxHits - player.hits;
    const healthBonus = remainingHealth * 100;
    const finalScore = score + healthBonus;
    console.log("💾 Saving score:", finalScore, "Wave:", waveManager.currentWave);
    const saveBtn = document.querySelector('[onclick="saveScore()"]');
    if (saveBtn) {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
    }
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `score=${finalScore}&wave=${waveManager.currentWave}&game_time=0`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Score Saved Successfully!\n\nScore: ${data.score.toLocaleString()}\nWave: ${data.wave}\nYour Rank: #${data.rank}\n\nRedirecting to leaderboard...`);
            window.location.href = '../leaderboard.php';
        } else {
            alert('❌ Failed to save score:\n' + data.message);
            if (saveBtn) {
                saveBtn.textContent = 'Save Score';
                saveBtn.disabled = false;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('❌ Error saving score:\n' + error.message);
        if (saveBtn) {
            saveBtn.textContent = 'Save Score';
            saveBtn.disabled = false;
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
    console.log("✅ Assets loaded! Starting game...");
    gameLoop();
});

// Expose functions to global scope for HTML onclick
window.restartGame = restartGame;
window.saveScore = saveScore;

console.log("✅ Game.js loaded successfully (FIXED v2 - Set-based enemy tracking)!");