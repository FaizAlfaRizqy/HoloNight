// Player Class
// Menghandle semua behavior player dengan SPRITE INTEGRATION

class Player {
    constructor(x, y) {
        // Position & Dimensions
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = CONFIG.PLAYER.SPEED;
        this.isOnGround = false;
        this.isFacingRight = true;
        
        // Jump
        this.jumpPower = CONFIG.PLAYER.JUMP_POWER;
        this.gravity = CONFIG.PLAYER.GRAVITY;
        this.canJump = true;
        
        // Health (Hit-based system)
        this.hits = 0; // Number of hits taken
        this.maxHits = 5; // Dies after 5 hits
        this.isInvincible = false;
        this.invincibleTimer = 0;
        
        // Attack
        this.isAttacking = false;
        this.attackDamage = CONFIG.PLAYER.ATTACK_DAMAGE;
        this.attackRange = CONFIG.PLAYER.ATTACK_RANGE;
        this.lastAttackTime = 0;
        this.attackDuration = CONFIG.PLAYER.ATTACK_DURATION;
        this.attackStartTime = 0;
        this.canAttack = true; // Flag to prevent attack spam
        
        // ✅ FIX: Track enemies hit in current attack
        this.enemiesHitThisAttack = new Set(); // Store enemy IDs that were hit
        
        // Animation
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.animationSpeed = 8;
        this.state = 'idle'; // idle, attack
        
        // Splash animation
        this.splashFrame = 0;
        this.splashFrameCounter = 0;
        this.splashAnimationSpeed = 4; // Faster splash animation

        // Input
        this.keys = {};
        this.setupControls();
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;

            if (e.key === 'ArrowLeft') this.isFacingRight = false;
            if (e.key === 'ArrowRight') this.isFacingRight = true;
            // Prevent default for X (jump) and Z (attack) if needed
            if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'z') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });
    }
    
    update(deltaTime) {
        this.handleMovement();
        this.handleJump();
        this.handleAttack();
        this.applyGravity();
        this.updateAnimation();

        // Movement update tanpa dikali deltaTime agar jump terasa natural
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkPlatformCollision();
        this.constrainToCanvas();

        if (this.isInvincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }

        // Reset attack state properly
        if (this.isAttacking) {
            if (Date.now() - this.attackStartTime > this.attackDuration) {
                this.isAttacking = false;
                this.state = 'idle';
                this.currentFrame = 0;
                // Clear the set of hit enemies (never reassign, just clear)
                if (this.enemiesHitThisAttack && typeof this.enemiesHitThisAttack.clear === 'function') {
                    this.enemiesHitThisAttack.clear();
                }
            }
        }
    }
    
    handleMovement() {
        this.velocityX = 0;
        
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.velocityX = -this.speed;
            this.isFacingRight = false;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.velocityX = this.speed;
            this.isFacingRight = true;
        }
    }
    
    handleJump() {
        // X = lompat
        if ((this.keys['x'] || this.keys['X']) && this.isOnGround && this.canJump) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
            this.canJump = false;
            if (typeof playSound === 'function' && window.Sounds) playSound(Sounds.hero_jump);
        }

        if (!this.keys['x'] && !this.keys['X']) {
            this.canJump = true;
        }
    }
    
    handleAttack() {
        // Z = attack
        const currentTime = Date.now();
        const cooldownPassed = currentTime - this.lastAttackTime > CONFIG.PLAYER.ATTACK_COOLDOWN;
        const attackKeyPressed = this.keys['z'] || this.keys['Z'];

        // Start attack only if key pressed, can attack, not currently attacking, and cooldown passed
        if (attackKeyPressed && this.canAttack && !this.isAttacking && cooldownPassed) {
            this.isAttacking = true;
            this.state = 'attack';
            this.attackStartTime = currentTime;
            this.lastAttackTime = currentTime;
            this.currentFrame = 0;
            this.frameCounter = 0;
            this.animationSpeed = 6; // Faster attack animation
            this.canAttack = false; // Prevent spam until key is released
            
            // ✅ FIX: Clear set when starting new attack
            this.enemiesHitThisAttack.clear();
            
            if (typeof playSound === 'function' && window.Sounds) playSound(Sounds.sword);
            console.log('⚔️ Attack started!');
            
            // Debug: Check splash availability
            if (typeof Assets !== 'undefined' && Assets.hero && Assets.hero.splash) {
                console.log('🎨 Splash frames available:', Assets.hero.splash.length);
            } else {
                console.warn('⚠️ Assets.hero.splash NOT available at attack time!');
            }
        }
        
        // Reset canAttack when key is released
        if (!attackKeyPressed) {
            this.canAttack = true;
        }
    }
    
    applyGravity() {
        if (!this.isOnGround) {
            this.velocityY += this.gravity;
            
            if (this.velocityY > CONFIG.PHYSICS.MAX_FALL_SPEED) {
                this.velocityY = CONFIG.PHYSICS.MAX_FALL_SPEED;
            }
        }
    }
    
    checkPlatformCollision() {
        // Pastikan platforms tersedia di global scope
        if (typeof platforms === 'undefined') return;

        this.isOnGround = false;
        // Cek collision dengan semua platform
        for (let platform of platforms) {
            // Cek hanya dari atas (player jatuh ke platform)
            const prevBottom = this.y + this.height - this.velocityY; // posisi sebelum update
            const currBottom = this.y + this.height;
            const onTop = prevBottom <= platform.y && currBottom >= platform.y;
            const withinX = this.x + this.width > platform.x && this.x < platform.x + platform.width;
            if (onTop && withinX && this.velocityY >= 0) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.isOnGround = true;
                break;
            }
        }
    }
    
    constrainToCanvas() {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CONFIG.CANVAS.WIDTH) {
            this.x = CONFIG.CANVAS.WIDTH - this.width;
        }
    }
    
    updateAnimation() {
        this.frameCounter++;
        
        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            
            if (this.state === 'attack') {
                this.currentFrame++;
                // Attack has 2 frames
                if (this.currentFrame >= 2) {
                    this.currentFrame = 1; // Hold last frame
                }
            } else {
                // Idle has 5 frames
                this.currentFrame = (this.currentFrame + 1) % 5;
            }
        }
        
        // Update splash animation when attacking
        if (this.isAttacking) {
            this.splashFrameCounter++;
            if (this.splashFrameCounter >= this.splashAnimationSpeed) {
                this.splashFrameCounter = 0;
                this.splashFrame = (this.splashFrame + 1) % 2; // Loop through 2 splash frames
            }
        } else {
            this.splashFrame = 0;
            this.splashFrameCounter = 0;
        }
    }
    
    getAttackHitbox() {
        if (!this.isAttacking) return null;
        
        return {
            x: this.isFacingRight ? 
                this.x + this.width : 
                this.x - this.attackRange,
            y: this.y,
            width: this.attackRange,
            height: this.height
        };
    }
    
    takeDamage(damage) {
        if (this.isInvincible) return false;
        
        this.hits += 1; // Increment hit count
        if (typeof playSound === 'function' && window.Sounds) playSound(Sounds.hero_hit);
        console.log(`💔 Player hit! ${this.hits}/${this.maxHits}`);
        
        this.isInvincible = true;
        this.invincibleTimer = CONFIG.PLAYER.INVINCIBLE_TIME / 16.67; // Convert to frames
        
        return true;
    }
    
    draw(ctx, assets) {
        // Blinking effect saat invincible
        if (this.isInvincible) {
            const shouldDraw = Math.floor(this.invincibleTimer / 5) % 2 === 0;
            if (!shouldDraw) return;
        }
        
        ctx.save();
        
        // Flip sprite jika menghadap kiri
        if (!this.isFacingRight) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // Get current sprite
        const spriteArray = this.state === 'attack' ? assets.hero.attack : assets.hero.idle;
        const currentSprite = spriteArray[this.currentFrame];
        
        if (currentSprite && currentSprite.complete) {
            ctx.drawImage(currentSprite, 0, 0, this.width, this.height);
        } else {
            // Fallback rectangle
            ctx.fillStyle = CONFIG.PLAYER.COLOR;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        ctx.restore();
        
        // Draw splash attack animation
        if (this.isAttacking) {
            console.log('🔍 Attack state - assets:', !!assets, 'hero:', !!assets?.hero, 'splash:', !!assets?.hero?.splash, 'length:', assets?.hero?.splash?.length);
        }
        
        if (this.isAttacking && assets.hero.splash && assets.hero.splash.length > 0) {
            const hitbox = this.getAttackHitbox();
            const splashSprite = assets.hero.splash[this.splashFrame];
            
            // Debug: Log splash rendering attempt
            if (this.splashFrame === 0) {
                console.log('🎨 Rendering splash animation - Frame:', this.splashFrame, 'Sprite loaded:', !!splashSprite);
            }
            
            if (splashSprite && splashSprite.complete) {
                ctx.save();
                
                // Position splash at hitbox location
                if (this.isFacingRight) {
                    ctx.translate(hitbox.x, hitbox.y);
                } else {
                    // Flip horizontally for left-facing attack
                    ctx.translate(hitbox.x + hitbox.width, hitbox.y);
                    ctx.scale(-1, 1);
                }
                
                // Draw splash sprite
                ctx.drawImage(splashSprite, 0, 0, hitbox.width, hitbox.height);
                
                ctx.restore();
            } else {
                // Debug: If splash sprite not loaded, log warning
                if (this.splashFrame === 0) {
                    console.warn('⚠️ Splash sprite not loaded or incomplete');
                }
            }
        }
        
    }
    
    isAlive() {
        return this.hits < this.maxHits;
    }
}

console.log("✅ Player class loaded with sprite support (FIXED v2 - Set-based tracking)");