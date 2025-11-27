const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load platform, floor, and foreground images
const platformImg = new Image();
platformImg.src = 'src/game/platform/platform.png';

const floorImg = new Image();
floorImg.src = 'src/game/object/floor_6.png';

const foregroundImg = new Image();
foregroundImg.src = 'src/game/foreground/foreground.png';

// Game state
const game = {
    width: canvas.width,
    height: canvas.height,
    gravity: 0.8,
    friction: 0.8,
    isGameOver: false
};

// Camera object
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    
    // Camera boundaries (world bounds)
    worldWidth: canvas.width * 2, // Make world 2x wider than screen
    worldHeight: canvas.height,
    
    // Camera follow settings
    smoothness: 0.1, // Lower = smoother, higher = more responsive
    deadZone: {
        x: canvas.width * 0.3,
        y: canvas.height * 0.3
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.width = canvas.width;
    game.height = canvas.height;
    camera.width = canvas.width;
    camera.height = canvas.height;
    
    // Update platforms to match new size
    updatePlatformPositions();
});

// Simple platforms - will be positioned dynamically
let platforms = [];

function updatePlatformPositions() {
    const worldWidth = camera.worldWidth;
    platforms = [
        { x: 0, y: game.height - 80, width: worldWidth, height: 80, type: 'floor' }, // Floor spans entire world
        { x: worldWidth * 0.1, y: game.height * 0.65, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.3, y: game.height * 0.50, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.5, y: game.height * 0.65, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.7, y: game.height * 0.50, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.85, y: game.height * 0.35, width: 250, height: 30, type: 'platform' }
    ];
}

// Add this function after updatePlatformPositions()
function updateSpawnLocations() {
    if (platforms.length >= 4) {
        const worldWidth = camera.worldWidth;
        spawnLocations.length = 0; // Clear array
        
        // Add spawn points across the world
        for (let i = 1; i < platforms.length; i++) { // Start from 1 to skip floor
            const platform = platforms[i];
            if (platform.type === 'platform') {
                spawnLocations.push(
                    { x: platform.x + 50, y: platform.y - 50, platform: i },
                    { x: platform.x + platform.width - 100, y: platform.y - 50, platform: i }
                );
            }
        }
        
        // Add floor spawn points
        spawnLocations.push(
            { x: worldWidth * 0.2, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.4, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.6, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.8, y: platforms[0].y - 50, platform: 0 }
        );
    }
}

// Initialize platforms
updatePlatformPositions();

// Player object
const player = {
    x: 100,
    y: 400,
    width: 64,
    height: 64,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    grounded: false,
    health: 5,
    maxHealth: 5,
    score: 0,
    invulnerable: false,
    invulnerabilityTime: 0,
    
    // Animation properties
    currentFrame: 0,
    animationSpeed: 8,
    frameCounter: 0,
    state: 'idle',
    facingRight: true,
    
    // Attack properties
    isAttacking: false,
    attackCooldown: 0,
    maxAttackFrames: 2
};

// Enemy spawn locations (random positions on platforms)
const spawnLocations = [
    { x: 200, y: canvas.height - 150, platform: 0 },   // Floor left
    { x: canvas.width - 300, y: canvas.height - 150, platform: 0 },   // Floor right
];

// Enemy spawn system
const enemySpawnSystem = {
    maxEnemies: 4,
    spawnQueue: [],
    spawnTimer: 0,
    spawnDelay: 600  // 10 seconds at 60fps
};

// Enhanced Enemy constructor
function Enemy(x, y, platformIndex = 0) {
    const platform = platforms[platformIndex];
    return {
        x: x,
        y: y,
        width: 48,
        height: 32,
        velocityX: Math.random() > 0.5 ? 1 : -1, // Random initial direction
        speed: 0.5 + Math.random() * 1, // Random speed between 0.5-1.5
        health: 2,
        maxHealth: 2,
        alive: true,
        facingRight: true,
        platformIndex: platformIndex,
        
        // Animation properties
        currentFrame: 0,
        animationSpeed: 10 + Math.floor(Math.random() * 6), // Random animation speed
        frameCounter: 0,
        maxWalkFrames: 4,
        
        // Movement boundaries based on platform
        patrolLeft: platform.x + 20,
        patrolRight: platform.x + platform.width - 68 // 48 (enemy width) + 20 (margin)
    };
}

// Create enemies array (initially empty)
let enemies = [];

// Load idle animation sprites
const idleSprites = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/game/hero/idle/idle_0${i}.png`;
    idleSprites.push(img);
}

// Load attack animation sprites
const attackSprites = [];
for (let i = 1; i <= 2; i++) {
    const img = new Image();
    img.src = `src/game/hero/attack/attack_0${i}.png`;
    attackSprites.push(img);
}

// Load enemy walk sprites
const enemyWalkSprites = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `src/game/crawlid/walk/crawlid_0${i}.png`;
    enemyWalkSprites.push(img);
}

// Function to get random spawn location
function getRandomSpawnLocation() {
    return spawnLocations[Math.floor(Math.random() * spawnLocations.length)];
}

// Function to spawn enemy
function spawnEnemy() {
    if (enemies.filter(e => e.alive).length >= enemySpawnSystem.maxEnemies) {
        return; // Max enemies reached
    }
    
    const spawnLocation = getRandomSpawnLocation();
    const newEnemy = Enemy(spawnLocation.x, spawnLocation.y, spawnLocation.platform);
    enemies.push(newEnemy);
    
    console.log('Enemy spawned at:', spawnLocation.x, spawnLocation.y);
}

// Function to add enemy to spawn queue
function queueEnemySpawn() {
    enemySpawnSystem.spawnQueue.push({
        timer: enemySpawnSystem.spawnDelay
    });
}

// Update spawn system
function updateSpawnSystem() {
    // Update spawn queue timers
    for (let i = enemySpawnSystem.spawnQueue.length - 1; i >= 0; i--) {
        enemySpawnSystem.spawnQueue[i].timer--;
        
        if (enemySpawnSystem.spawnQueue[i].timer <= 0) {
            spawnEnemy();
            enemySpawnSystem.spawnQueue.splice(i, 1);
        }
    }
}

// Initialize game
function initGame() {
    game.isGameOver = false;
    updatePlatformPositions();
    updateSpawnLocations();
    
    // Player start position - make sure it's visible
    player.x = 100;
    player.y = game.height - 200; // Start above the floor
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = 5;
    player.score = 0;
    player.state = 'idle';
    player.isAttacking = false;
    player.invulnerable = false;
    player.invulnerabilityTime = 0;
    player.currentFrame = 0;
    player.frameCounter = 0;
    
    // Reset camera to player position
    camera.x = Math.max(0, player.x - camera.width / 2);
    camera.y = 0;
    
    // Reset enemies and spawn system
    enemies = [];
    enemySpawnSystem.spawnQueue = [];
    
    // Spawn initial enemies (2-3 enemies)
    const initialEnemyCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < initialEnemyCount; i++) {
        spawnEnemy();
    }
    
    document.getElementById('gameOverScreen').style.display = 'none';
    
    console.log('Game initialized');
    console.log('Player position:', player.x, player.y);
    console.log('Camera position:', camera.x, camera.y);
    console.log('Platforms:', platforms.length);
    console.log('Enemies:', enemies.length);
    console.log('Spawn locations:', spawnLocations.length);
}

// Restart game function
function restartGame() {
    initGame();
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    if (game.isGameOver) return;
    
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true;
    
    // Prevent default for space key to avoid page scrolling
    if (e.code === 'Space') {
        e.preventDefault();
    }
    
    // Attack input (X key or Enter)
    if ((e.key.toLowerCase() === 'x' || e.code === 'Enter') && !player.isAttacking && player.attackCooldown <= 0) {
        startAttack();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.code] = false;
});

// Start attack function
function startAttack() {
    player.isAttacking = true;
    player.state = 'attack';
    player.currentFrame = 0;
    player.frameCounter = 0;
    player.animationSpeed = 6; // Faster attack animation
    player.attackCooldown = 30; // Cooldown after attack
}

// Modified checkAttackCollision to handle enemy death and respawn
function checkAttackCollision() {
    if (!player.isAttacking) return;

    const attackRange = 70;
    const attackX = player.facingRight ? player.x + 10 : player.x - attackRange + 10;

    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        // Attack collision detection
        if (enemy.x + enemy.width > attackX &&
            enemy.x < attackX + attackRange &&
            enemy.y + enemy.height > player.y + 10 &&
            enemy.y < player.y + player.height - 10) {
            
            enemy.health--;
            if (enemy.health <= 0) {
                enemy.alive = false;
                player.score += 10;
                
                // Queue new enemy spawn after 10 seconds
                queueEnemySpawn();
                
                console.log('Enemy killed! New enemy queued for spawn.');
            }
            
            // Knockback effect
            const knockback = player.facingRight ? 25 : -25;
            enemy.x += knockback;
            
            // Keep enemy in bounds of their platform
            enemy.x = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight, enemy.x));
            
            break; // Only hit one enemy per attack
        }
    }
}

// Update enemy
function updateEnemy(enemy) {
    if (!enemy.alive) return;

    // Animation
    enemy.frameCounter++;
    if (enemy.frameCounter >= enemy.animationSpeed) {
        enemy.frameCounter = 0;
        enemy.currentFrame = (enemy.currentFrame + 1) % enemy.maxWalkFrames;
    }

    // Movement AI - patrol back and forth on assigned platform
    enemy.x += enemy.velocityX * enemy.speed;

    // Check boundaries and reverse direction
    if (enemy.x <= enemy.patrolLeft || enemy.x >= enemy.patrolRight) {
        enemy.velocityX *= -1;
        enemy.facingRight = !enemy.facingRight;
        
        // Ensure enemy stays within bounds
        enemy.x = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight, enemy.x));
    }

    // Simple gravity for enemies
    enemy.y += 2;

    // Platform collision for enemies
    const platform = platforms[enemy.platformIndex];
    if (enemy.x + enemy.width > platform.x &&
        enemy.x < platform.x + platform.width &&
        enemy.y + enemy.height > platform.y &&
        enemy.y < platform.y + platform.height) {
        
        if (enemy.y < platform.y) {
            enemy.y = platform.y - enemy.height;
        }
    }
}

// Check collision between player and enemies
function checkEnemyCollision() {
    if (player.invulnerable) return;

    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        // Simple rectangle collision with margin
        const margin = 10;
        if (player.x + margin < enemy.x + enemy.width - margin &&
            player.x + player.width - margin > enemy.x + margin &&
            player.y + margin < enemy.y + enemy.height - margin &&
            player.y + player.height - margin > enemy.y + margin) {
            
            // Player takes damage
            player.health--;
            player.invulnerable = true;
            player.invulnerabilityTime = 120; // 2 seconds of invulnerability
            
            // Knockback player
            const knockbackDistance = 40;
            if (player.x < enemy.x) {
                player.x -= knockbackDistance;
            } else {
                player.x += knockbackDistance;
            }
            
            // Boundary check
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > game.width) player.x = game.width - player.width;
            
            // Check if player is dead
            if (player.health <= 0) {
                gameOver();
            }
            
            break; // Only one collision per frame
        }
    }
}

// Game over function
function gameOver() {
    game.isGameOver = true;
    document.getElementById('finalScore').textContent = player.score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

// Update player animation
function updateAnimation() {
    player.frameCounter++;
    
    if (player.frameCounter >= player.animationSpeed) {
        player.frameCounter = 0;
        
        if (player.isAttacking) {
            player.currentFrame++;
            
            // Check if attack animation is complete
            if (player.currentFrame >= player.maxAttackFrames) {
                player.isAttacking = false;
                player.state = 'idle';
                player.currentFrame = 0;
                player.animationSpeed = 8; // Back to normal speed
            }
        } else {
            // Normal idle animation
            player.currentFrame = (player.currentFrame + 1) % idleSprites.length;
        }
    }
    
    // Reduce attack cooldown
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    
    // Reduce invulnerability time
    if (player.invulnerabilityTime > 0) {
        player.invulnerabilityTime--;
        if (player.invulnerabilityTime <= 0) {
            player.invulnerable = false;
        }
    }
}

// Add pixel-based collision detection function
function getPixelCollision(imgData, x, y, width, height) {
    const pixels = [];
    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const index = ((y + py) * canvas.width + (x + px)) * 4;
            const alpha = imgData.data[index + 3];
            if (alpha > 128) { // Pixel is solid if alpha > 50%
                pixels.push({ x: px, y: py });
            }
        }
    }
    return pixels;
}

// Pixel-perfect collision check between two sprites
function checkPixelCollision(obj1X, obj1Y, obj1Sprite, obj2X, obj2Y, obj2Width, obj2Height) {
    if (!obj1Sprite || !obj1Sprite.complete) return false;
    
    // First do bounding box check for optimization
    if (obj1X + obj1Sprite.width < obj2X || obj1X > obj2X + obj2Width ||
        obj1Y + obj1Sprite.height < obj2Y || obj1Y > obj2Y + obj2Height) {
        return false;
    }
    
    // If bounding boxes overlap, check pixel collision
    const overlapX = Math.max(obj1X, obj2X);
    const overlapY = Math.max(obj1Y, obj2Y);
    const overlapWidth = Math.min(obj1X + obj1Sprite.width, obj2X + obj2Width) - overlapX;
    const overlapHeight = Math.min(obj1Y + obj1Sprite.height, obj2Y + obj2Height) - overlapY;
    
    // Create temporary canvas to check pixels
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = obj1Sprite.width;
    tempCanvas.height = obj1Sprite.height;
    
    // Draw sprite to get pixel data
    tempCtx.drawImage(obj1Sprite, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, obj1Sprite.width, obj1Sprite.height);
    
    // Check overlapping area for solid pixels
    for (let y = 0; y < overlapHeight; y++) {
        for (let x = 0; x < overlapWidth; x++) {
            const spriteX = Math.floor(overlapX - obj1X + x);
            const spriteY = Math.floor(overlapY - obj1Y + y);
            
            if (spriteX >= 0 && spriteX < obj1Sprite.width && 
                spriteY >= 0 && spriteY < obj1Sprite.height) {
                const index = (spriteY * obj1Sprite.width + spriteX) * 4;
                const alpha = imgData.data[index + 3];
                
                if (alpha > 128) { // Solid pixel found
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Update player physics and movement
function updatePlayer() {
    if (game.isGameOver) return;

    // Update spawn system
    updateSpawnSystem();

    // Don't allow movement during attack
    if (!player.isAttacking) {
        // Horizontal movement
        if (keys['a'] || keys['arrowleft']) {
            player.velocityX = -player.speed;
            player.facingRight = false;
        } else if (keys['d'] || keys['arrowright']) {
            player.velocityX = player.speed;
            player.facingRight = true;
        } else {
            player.velocityX *= game.friction;
        }

        // Jumping
        if ((keys['w'] || keys[' '] || keys['Space']) && player.grounded) {
            player.velocityY = -player.jumpPower;
            player.grounded = false;
        }
    } else {
        // Slight movement during attack
        player.velocityX *= 0.9;
    }

    // Apply gravity
    player.velocityY += game.gravity;

    // Update horizontal position
    player.x += player.velocityX;

    // Boundary checking with world bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > camera.worldWidth) player.x = camera.worldWidth - player.width;

    // Update vertical position
    player.y += player.velocityY;

    // Platform collision - simplified and more reliable
    player.grounded = false;
    
    for (let platform of platforms) {
        // Check if player is above platform and falling
        if (player.velocityY >= 0 && 
            player.x + player.width - 5 > platform.x &&
            player.x + 5 < platform.x + platform.width) {
            
            const playerBottom = player.y + player.height;
            
            // Check if player's bottom is touching or passing through platform top
            if (playerBottom >= platform.y && playerBottom <= platform.y + platform.height) {
                // Snap player to top of platform
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                break;
            }
        }
    }

    // Prevent falling through bottom of world
    const worldBottom = game.height - 80; // Floor position
    if (player.y + player.height >= worldBottom) {
        player.y = worldBottom - player.height;
        player.velocityY = 0;
        player.grounded = true;
    }

    // Safety check - keep player within visible area
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > game.height) {
        player.y = game.height - player.height;
        player.velocityY = 0;
        player.grounded = true;
    }

    // Update animation
    updateAnimation();

    // Check collisions
    checkAttackCollision();
    checkEnemyCollision();

    // Update UI
    document.getElementById('health').textContent = player.health;
    document.getElementById('score').textContent = player.score;
    document.getElementById('state').textContent = player.state;
    document.getElementById('enemyCount').textContent = enemies.filter(e => e.alive).length;
}

// Improve the renderPlayer function with debug info
function renderPlayer() {
    if (game.isGameOver) return;

    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;

    ctx.save();
    
    // Debug: Draw player hitbox
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, player.width, player.height);
    
    if (player.invulnerable && Math.floor(player.invulnerabilityTime / 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.translate(-screenX - player.width, 0);
    } else {
        ctx.translate(screenX, 0);
    }
    
    let currentSprites = idleSprites;
    if (player.state === 'attack') {
        currentSprites = attackSprites;
    }
    
    // Draw sprite or fallback
    if (currentSprites[player.currentFrame] && currentSprites[player.currentFrame].complete) {
        ctx.drawImage(
            currentSprites[player.currentFrame],
            0,
            screenY,
            player.width,
            player.height
        );
    } else {
        // Fallback with visible color
        let color = player.state === 'attack' ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillStyle = color;
        ctx.fillRect(0, screenY, player.width, player.height);
        
        // Draw a simple face for debug
        ctx.fillStyle = 'black';
        ctx.fillRect(10, screenY + 15, 5, 5); // Left eye
        ctx.fillRect(player.width - 15, screenY + 15, 5, 5); // Right eye
    }
    
    ctx.restore();
}

// Update the renderPlatforms function
function renderPlatforms() {
    for (let platform of platforms) {
        const screenX = platform.x - camera.x;
        const screenY = platform.y - camera.y;
        
        // Only render if platform is visible on screen
        if (screenX + platform.width > 0 && screenX < camera.width &&
            screenY + platform.height > 0 && screenY < camera.height) {
            
            if (platform.type === 'floor') {
                if (floorImg.complete) {
                    ctx.save();
                    
                    const scale = 3;
                    const tileWidth = floorImg.width * scale;
                    const tileHeight = floorImg.height * scale;
                    
                    const startWorldX = Math.max(platform.x, camera.x - tileWidth);
                    const endWorldX = Math.min(platform.x + platform.width, camera.x + camera.width + tileWidth);
                    
                    const startTileX = Math.floor(startWorldX / tileWidth) * tileWidth - tileWidth;
                    
                    for (let x = startTileX; x < endWorldX + tileWidth; x += tileWidth * 0.98) {
                        const drawX = x - camera.x;
                        const drawY = platform.y - camera.y;
                        
                        ctx.drawImage(
                            floorImg,
                            0, 0, 
                            floorImg.width, 
                            floorImg.height,
                            drawX, 
                            drawY, 
                            tileWidth, 
                            platform.height + 10
                        );
                    }
                    
                    ctx.restore();
                } else {
                    ctx.fillStyle = 'rgba(100, 50, 50, 0.9)';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                }
            } else {
                if (platformImg.complete) {
                    ctx.drawImage(
                        platformImg, 
                        screenX, 
                        screenY, 
                        platform.width, 
                        platform.height + 10
                    );
                } else {
                    ctx.fillStyle = 'rgba(80, 80, 80, 0.9)';
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(screenX, screenY, platform.width, platform.height);
                }
            }
        }
    }
}

// Modify renderEnemies to use camera offset
function renderEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const screenX = enemy.x - camera.x;
        const screenY = enemy.y - camera.y;
        
        // Only render if enemy is visible on screen
        if (screenX + enemy.width > 0 && screenX < camera.width &&
            screenY + enemy.height > 0 && screenY < camera.height) {
            
            ctx.save();
            
            // Debug: Draw enemy hitbox
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, enemy.width, enemy.height);
            
            if (!enemy.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-screenX - enemy.width, 0);
            } else {
                ctx.translate(screenX, 0);
            }
            
            if (enemyWalkSprites[enemy.currentFrame] && enemyWalkSprites[enemy.currentFrame].complete) {
                ctx.drawImage(
                    enemyWalkSprites[enemy.currentFrame],
                    0,
                    screenY,
                    enemy.width,
                    enemy.height
                );
            } else {
                // Fallback enemy
                ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
                ctx.fillRect(0, screenY, enemy.width, enemy.height);
            }
            
            ctx.restore();
        }
    }
}

// Modify renderPlayer to use camera offset
function renderPlayer() {
    if (game.isGameOver) return;

    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;

    ctx.save();
    
    if (player.invulnerable && Math.floor(player.invulnerabilityTime / 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.translate(-screenX - player.width, 0);
    } else {
        ctx.translate(screenX, 0);
    }
    
    let currentSprites = idleSprites;
    if (player.state === 'attack') {
        currentSprites = attackSprites;
    }
    
    if (currentSprites[player.currentFrame] && currentSprites[player.currentFrame].complete) {
        ctx.drawImage(
            currentSprites[player.currentFrame],
            0,
            screenY,
            player.width,
            player.height
        );
    } else {
        let color = player.state === 'attack' ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fillStyle = color;
        ctx.fillRect(0, screenY, player.width, player.height);
    }
    
    ctx.restore();
}

// Modify renderForeground to render relative to camera (parallax effect)
function renderForeground() {
    if (foregroundImg.complete) {
        // Parallax effect - foreground moves slower than camera
        const parallaxX = camera.x * 0.5;
        const parallaxY = camera.y * 0.3;
        
        ctx.save();
        ctx.translate(-parallaxX, -parallaxY);
        
        // Draw foreground covering the whole world
        const scale = Math.max(
            camera.worldWidth / foregroundImg.width,
            camera.worldHeight / foregroundImg.height
        );
        
        // Geser foreground ke bawah dengan offset 150px
        const offsetY = 30;
        
        ctx.drawImage(
            foregroundImg,
            0,
            offsetY,
            foregroundImg.width * scale,
            foregroundImg.height * scale
        );
        
        ctx.restore();
    }
}

// Update camera
function updateCamera() {
    // Target camera position (center on player)
    const targetX = player.x + player.width / 2 - camera.width / 2;
    const targetY = player.y + player.height / 2 - camera.height / 2;
    
    // Smooth camera movement (lerp)
    camera.x += (targetX - camera.x) * camera.smoothness;
    camera.y += (targetY - camera.y) * camera.smoothness;
    
    // Keep camera within world bounds
    camera.x = Math.max(0, Math.min(camera.x, camera.worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, camera.worldHeight - camera.height));
}

// Update gameLoop to include camera update
function gameLoop() {
    // Clear entire canvas
    ctx.clearRect(0, 0, game.width, game.height);
    
    // Update game logic
    updatePlayer();
    updateCamera();
    
    for (let enemy of enemies) {
        updateEnemy(enemy);
    }
    
    // Render in correct order
    renderPlatforms();
    renderEnemies();
    renderPlayer(); // Make sure player renders after platforms
    renderForeground();
    
    // Debug info
    ctx.fillStyle = 'yellow';
    ctx.font = '12px Arial';
    ctx.fillText(`Player: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 10, game.height - 50);
    ctx.fillText(`Camera: (${Math.floor(camera.x)}, ${Math.floor(camera.y)})`, 10, game.height - 35);
    ctx.fillText(`Screen: (${Math.floor(player.x - camera.x)}, ${Math.floor(player.y - camera.y)})`, 10, game.height - 20);
    
    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    console.log('Starting game...');
    initGame();
    gameLoop();
}

// Initialize game
startGame();