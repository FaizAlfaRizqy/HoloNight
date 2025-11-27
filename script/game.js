const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
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

// Camera
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    worldWidth: canvas.width * 2,
    worldHeight: canvas.height,
    smoothness: 0.1,
    deadZone: {
        x: canvas.width * 0.3,
        y: canvas.height * 0.3
    }
};

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.width = canvas.width;
    game.height = canvas.height;
    camera.width = canvas.width;
    camera.height = canvas.height;
    updatePlatformPositions();
});

// Platforms
let platforms = [];

function updatePlatformPositions() {
    const worldWidth = camera.worldWidth;
    platforms = [
        { x: 0, y: game.height - 80, width: worldWidth, height: 80, type: 'floor' },
        { x: worldWidth * 0.1, y: game.height * 0.65, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.22, y: game.height * 0.50, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.34, y: game.height * 0.65, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.46, y: game.height * 0.50, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.58, y: game.height * 0.35, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.70, y: game.height * 0.50, width: 250, height: 30, type: 'platform' },
        { x: worldWidth * 0.82, y: game.height * 0.65, width: 250, height: 30, type: 'platform' }
    ];
}

function updateSpawnLocations() {
    if (platforms.length >= 4) {
        const worldWidth = camera.worldWidth;
        spawnLocations.length = 0;
        
        for (let i = 1; i < platforms.length; i++) {
            const platform = platforms[i];
            if (platform.type === 'platform') {
                spawnLocations.push(
                    { x: platform.x + 50, y: platform.y - 50, platform: i },
                    { x: platform.x + platform.width - 100, y: platform.y - 50, platform: i }
                );
            }
        }
        
        spawnLocations.push(
            { x: worldWidth * 0.2, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.4, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.6, y: platforms[0].y - 50, platform: 0 },
            { x: worldWidth * 0.8, y: platforms[0].y - 50, platform: 0 }
        );
    }
}

updatePlatformPositions();

// Player
const player = {
    x: 100,
    y: 400,
    width: 100,
    height: 100,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 20,
    grounded: false,
    health: 5,
    maxHealth: 5,
    score: 0,
    invulnerable: false,
    invulnerabilityTime: 0,
    currentFrame: 0,
    animationSpeed: 8,
    frameCounter: 0,
    state: 'idle',
    facingRight: true,
    isAttacking: false,
    attackCooldown: 0,
    maxAttackFrames: 2
};

// Enemy spawn
const spawnLocations = [
    { x: 200, y: canvas.height - 150, platform: 0 },
    { x: canvas.width - 300, y: canvas.height - 150, platform: 0 },
];

const enemySpawnSystem = {
    maxEnemies: 4,
    spawnQueue: [],
    spawnTimer: 0,
    spawnDelay: 600
};

function Enemy(x, y, platformIndex = 0) {
    const platform = platforms[platformIndex];
    return {
        x: x,
        y: y,
        width: 60,
        height: 40,
        velocityX: Math.random() > 0.5 ? 1 : -1,
        speed: 0.5 + Math.random() * 1,
        health: 2,
        maxHealth: 2,
        alive: true,
        facingRight: true,
        platformIndex: platformIndex,
        currentFrame: 0,
        animationSpeed: 10 + Math.floor(Math.random() * 6),
        frameCounter: 0,
        maxWalkFrames: 4,
        patrolLeft: platform.x + 20,
        patrolRight: platform.x + platform.width - 68
    };
}

let enemies = [];

// Load sprites
const idleSprites = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `src/game/hero/idle/idle_0${i}.png`;
    idleSprites.push(img);
}

const attackSprites = [];
for (let i = 1; i <= 2; i++) {
    const img = new Image();
    img.src = `src/game/hero/attack/attack_0${i}.png`;
    attackSprites.push(img);
}

const enemyWalkSprites = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `src/game/crawlid/walk/crawlid_0${i}.png`;
    enemyWalkSprites.push(img);
}

// Spawn functions
function getRandomSpawnLocation() {
    return spawnLocations[Math.floor(Math.random() * spawnLocations.length)];
}

function spawnEnemy() {
    if (enemies.filter(e => e.alive).length >= enemySpawnSystem.maxEnemies) {
        return;
    }
    
    const spawnLocation = getRandomSpawnLocation();
    const newEnemy = Enemy(spawnLocation.x, spawnLocation.y, spawnLocation.platform);
    enemies.push(newEnemy);
}

function queueEnemySpawn() {
    enemySpawnSystem.spawnQueue.push({
        timer: enemySpawnSystem.spawnDelay
    });
}

function updateSpawnSystem() {
    for (let i = enemySpawnSystem.spawnQueue.length - 1; i >= 0; i--) {
        enemySpawnSystem.spawnQueue[i].timer--;
        
        if (enemySpawnSystem.spawnQueue[i].timer <= 0) {
            spawnEnemy();
            enemySpawnSystem.spawnQueue.splice(i, 1);
        }
    }
}

// Init game
function initGame() {
    game.isGameOver = false;
    updatePlatformPositions();
    updateSpawnLocations();
    
    player.x = 100;
    player.y = game.height - 200;
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
    
    camera.x = Math.max(0, player.x - camera.width / 2);
    camera.y = 0;
    
    enemies = [];
    enemySpawnSystem.spawnQueue = [];
    
    const initialEnemyCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < initialEnemyCount; i++) {
        spawnEnemy();
    }
    
    // Reset health UI
    updateHealthUI();
    
    document.getElementById('gameOverScreen').style.display = 'none';
}

function restartGame() {
    initGame();
}

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    if (game.isGameOver) return;
    
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
    }
    
    if ((e.key.toLowerCase() === 'x' || e.code === 'Enter') && !player.isAttacking && player.attackCooldown <= 0) {
        startAttack();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.code] = false;
});

function startAttack() {
    player.isAttacking = true;
    player.state = 'attack';
    player.currentFrame = 0;
    player.frameCounter = 0;
    player.animationSpeed = 6;
    player.attackCooldown = 30;
}

function checkAttackCollision() {
    if (!player.isAttacking) return;

    const attackRange = 80;
    const attackHeight = player.height * 0.6;
    const attackY = player.y + player.height * 0.2;
    
    const attackX = player.facingRight ? 
        player.x + player.width * 0.5 : 
        player.x - attackRange + player.width * 0.5;

    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const enemyHitbox = {
            x: enemy.x + enemy.width * 0.15,
            y: enemy.y + enemy.height * 0.15,
            width: enemy.width * 0.7,
            height: enemy.height * 0.7
        };

        if (enemyHitbox.x + enemyHitbox.width > attackX &&
            enemyHitbox.x < attackX + attackRange &&
            enemyHitbox.y + enemyHitbox.height > attackY &&
            enemyHitbox.y < attackY + attackHeight) {
            
            enemy.health--;
            if (enemy.health <= 0) {
                enemy.alive = false;
                player.score += 10;
                queueEnemySpawn();
            }
            
            const knockback = player.facingRight ? 25 : -25;
            enemy.x += knockback;
            enemy.x = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight, enemy.x));
            
            break;
        }
    }
}

function updateEnemy(enemy) {
    if (!enemy.alive) return;

    enemy.frameCounter++;
    if (enemy.frameCounter >= enemy.animationSpeed) {
        enemy.frameCounter = 0;
        enemy.currentFrame = (enemy.currentFrame + 1) % enemy.maxWalkFrames;
    }

    enemy.x += enemy.velocityX * enemy.speed;

    if (enemy.x <= enemy.patrolLeft || enemy.x >= enemy.patrolRight) {
        enemy.velocityX *= -1;
        enemy.facingRight = !enemy.facingRight;
        enemy.x = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight, enemy.x));
    }

    enemy.y += 2;

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

function checkEnemyCollision() {
    if (player.invulnerable) return;

    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const playerHitbox = {
            x: player.x + player.width * 0.15,
            y: player.y + player.height * 0.15,
            width: player.width * 0.7,
            height: player.height * 0.7
        };

        const enemyHitbox = {
            x: enemy.x + enemy.width * 0.15,
            y: enemy.y + enemy.height * 0.15,
            width: enemy.width * 0.7,
            height: enemy.height * 0.7
        };

        if (playerHitbox.x < enemyHitbox.x + enemyHitbox.width &&
            playerHitbox.x + playerHitbox.width > enemyHitbox.x &&
            playerHitbox.y < enemyHitbox.y + enemyHitbox.height &&
            playerHitbox.y + playerHitbox.height > enemyHitbox.y) {
            
            player.health--;
            player.invulnerable = true;
            player.invulnerabilityTime = 120;
            
            const knockbackDistance = 50;
            if (player.x < enemy.x) {
                player.x -= knockbackDistance;
            } else {
                player.x += knockbackDistance;
            }
            
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > camera.worldWidth) player.x = camera.worldWidth - player.width;
            
            if (player.health <= 0) {
                gameOver();
            }
            
            break;
        }
    }
}

function gameOver() {
    game.isGameOver = true;
    document.getElementById('finalScore').textContent = player.score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

function updateAnimation() {
    player.frameCounter++;
    
    if (player.frameCounter >= player.animationSpeed) {
        player.frameCounter = 0;
        
        if (player.isAttacking) {
            player.currentFrame++;
            
            if (player.currentFrame >= player.maxAttackFrames) {
                player.isAttacking = false;
                player.state = 'idle';
                player.currentFrame = 0;
                player.animationSpeed = 8;
            }
        } else {
            player.currentFrame = (player.currentFrame + 1) % idleSprites.length;
        }
    }
    
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    
    if (player.invulnerabilityTime > 0) {
        player.invulnerabilityTime--;
        if (player.invulnerabilityTime <= 0) {
            player.invulnerable = false;
        }
    }
}

function updatePlayer() {
    if (game.isGameOver) return;

    updateSpawnSystem();

    if (!player.isAttacking) {
        if (keys['a'] || keys['arrowleft']) {
            player.velocityX = -player.speed;
            player.facingRight = false;
        } else if (keys['d'] || keys['arrowright']) {
            player.velocityX = player.speed;
            player.facingRight = true;
        } else {
            player.velocityX *= game.friction;
        }

        if ((keys['w'] || keys[' '] || keys['Space']) && player.grounded) {
            player.velocityY = -player.jumpPower;
            player.grounded = false;
        }
    } else {
        player.velocityX *= 0.9;
    }

    player.velocityY += game.gravity;
    player.x += player.velocityX;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > camera.worldWidth) player.x = camera.worldWidth - player.width;

    player.y += player.velocityY;
    player.grounded = false;
    
    for (let platform of platforms) {
        if (player.velocityY >= 0 && 
            player.x + player.width * 0.3 > platform.x &&
            player.x + player.width * 0.7 < platform.x + platform.width) {
            
            const playerFootY = player.y + player.height * 0.85;
            
            if (playerFootY >= platform.y && playerFootY <= platform.y + 10) {
                player.y = platform.y - player.height * 0.85;
                player.velocityY = 0;
                player.grounded = true;
                break;
            }
        }
    }

    const worldBottom = game.height - 80;
    const playerFootY = player.y + player.height * 0.85;
    if (playerFootY >= worldBottom) {
        player.y = worldBottom - player.height * 0.85;
        player.velocityY = 0;
        player.grounded = true;
    }

    if (player.y < 0) player.y = 0;

    updateAnimation();
    checkAttackCollision();
    checkEnemyCollision();

    // Update UI
    updateHealthUI();
    document.getElementById('moneyScore').textContent = player.score;
    document.getElementById('state').textContent = player.state;
    document.getElementById('enemyCount').textContent = enemies.filter(e => e.alive).length;
}

function updateHealthUI() {
    const healthIcons = document.querySelectorAll('.health-icon');
    healthIcons.forEach((icon, index) => {
        if (index < player.health) {
            icon.classList.remove('empty');
        } else {
            icon.classList.add('empty');
        }
    });
}

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
    
    let currentSprites = player.state === 'attack' ? attackSprites : idleSprites;
    
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

function renderEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const screenX = enemy.x - camera.x;
        const screenY = enemy.y - camera.y;
        
        if (screenX + enemy.width > 0 && screenX < camera.width &&
            screenY + enemy.height > 0 && screenY < camera.height) {
            
            ctx.save();
            
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
                ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
                ctx.fillRect(0, screenY, enemy.width, enemy.height);
            }
            
            ctx.restore();
        }
    }
}

function updateCamera() {
    const targetX = player.x + player.width / 2 - camera.width / 2;
    const targetY = player.y + player.height / 2 - camera.height / 2;
    
    camera.x += (targetX - camera.x) * camera.smoothness;
    camera.y += (targetY - camera.y) * camera.smoothness;
    
    camera.x = Math.max(0, Math.min(camera.x, camera.worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, camera.worldHeight - camera.height));
}

function renderPlatforms() {
    for (let platform of platforms) {
        const screenX = platform.x - camera.x;
        const screenY = platform.y - camera.y;
        
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

function renderForeground() {
    if (foregroundImg.complete) {
        const parallaxX = camera.x * 0.5;
        const parallaxY = camera.y * 0.3;
        
        ctx.save();
        ctx.translate(-parallaxX, -parallaxY);
        
        const scale = Math.max(
            camera.worldWidth / foregroundImg.width,
            camera.worldHeight / foregroundImg.height
        );
        
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

function gameLoop() {
    ctx.clearRect(0, 0, game.width, game.height);
    
    updatePlayer();
    updateCamera();
    
    for (let enemy of enemies) {
        updateEnemy(enemy);
    }
    
    renderPlatforms();
    renderEnemies();
    renderPlayer();
    renderForeground();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    initGame();
    gameLoop();
}

startGame();