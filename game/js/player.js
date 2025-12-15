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
        this.speed = CONFIG.PLAYER.SPEED; // Speed player selalu konstan dari config
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
        this.state = 'idle'; // idle, walk, attack
        
        // Splash animation
        this.splashFrame = 0;
        this.splashFrameCounter = 0;
        this.splashAnimationSpeed = 4; // Faster splash animation

        // Dash
        this.isDashing = false;
        this.dashStartTime = 0;
        this.dashCooldown = 0;
        this.dashDir = 1;

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
            // Dash: C atau Shift
            if ((e.key === 'c' || e.key === 'C' || e.key === 'Shift') && !this.isDashing) {
                this.startDash();
                e.preventDefault();
            }
            // Prevent default for X (jump) and Z (attack) if needed
            if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'z') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });
    }

    startDash() {
        if (this.isDashing || this.dashCooldown > 0 || this.isAttacking) return;
        this.isDashing = true;
        this.dashStartTime = Date.now();
        this.dashDir = this.isFacingRight ? 1 : -1;
        this.dashCooldown = CONFIG.PLAYER.DASH_COOLDOWN;
        this.state = 'dash';
        this.currentFrame = 0;
        this.isInvincible = true;
        if (typeof playSound === 'function' && window.Sounds && window.Sounds.hero_dash) playSound(window.Sounds.hero_dash);
    }

    update(deltaTime) {
        // Dash logic
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime * 16.67; // deltaTime in frames, cooldown in ms
            if (this.dashCooldown < 0) this.dashCooldown = 0;
        }

        if (this.isDashing) {
            this.state = 'dash';
            const dashElapsed = Date.now() - this.dashStartTime;
            const dashDuration = CONFIG.PLAYER.DASH_DURATION;
            const dashDistance = CONFIG.PLAYER.DASH_DISTANCE;
            // Move player by dash distance over dash duration
            const dashSpeed = dashDistance / (dashDuration / 16.67); // px per frame
            this.velocityX = this.dashDir * dashSpeed;
            this.velocityY = 0;
            // Invincible during dash
            this.isInvincible = true;
            if (dashElapsed >= dashDuration) {
                this.isDashing = false;
                this.velocityX = 0;
                this.isInvincible = false;
                this.state = 'idle';
            }
        } else {
            this.handleMovement();
            this.handleJump();
            this.handleAttack();
            this.applyGravity();

            // Tentukan state animasi
            if (this.isAttacking) {
                this.state = 'attack';
            } else if (this.velocityX !== 0) {
                this.state = 'walk';
            } else {
                this.state = 'idle';
            }
        }

        this.updateAnimation();

        // Movement update dikali deltaTime (default deltaTime=1 per frame, bisa diubah jika ingin FPS independen)
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.checkPlatformCollision();
        this.constrainToCanvas();

        if (this.isInvincible && !this.isDashing) {
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
        // Speed player selalu konstan dari config, tidak ada multiplier
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.velocityX = -CONFIG.PLAYER.SPEED;
            this.isFacingRight = false;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.velocityX = CONFIG.PLAYER.SPEED;
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

        let maxFrame = 5;
        if (this.state === 'attack') maxFrame = 2;
        if (this.state === 'walk') maxFrame = 5;
        if (this.state === 'dash') maxFrame = 2;

        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            this.currentFrame++;
            if (this.currentFrame >= maxFrame) {
                if (this.state === 'attack') {
                    this.currentFrame = 1; // Hold last attack frame
                } else {
                    this.currentFrame = 0;
                }
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
        // Blinking effect saat invincible (kecuali dash, dash selalu tampil)
        if (this.isInvincible && !this.isDashing) {
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

        // Get current sprite array sesuai state
        let spriteArray = assets.hero.idle;
        if (this.state === 'attack') spriteArray = assets.hero.attack;
        else if (this.state === 'walk') spriteArray = assets.hero.walk;
        else if (this.state === 'dash') spriteArray = assets.hero.dash;
        const currentSprite = spriteArray[this.currentFrame];

        if (currentSprite && currentSprite.complete) {
            ctx.drawImage(currentSprite, 0, 0, this.width, this.height);
        } else {
            ctx.fillStyle = CONFIG.PLAYER.COLOR;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();

        // Draw splash attack animation
        if (this.isAttacking && assets.hero.splash && assets.hero.splash.length > 0) {
            const hitbox = this.getAttackHitbox();
            const splashSprite = assets.hero.splash[this.splashFrame];
            if (splashSprite && splashSprite.complete) {
                ctx.save();
                if (this.isFacingRight) {
                    ctx.translate(hitbox.x, hitbox.y);
                } else {
                    ctx.translate(hitbox.x + hitbox.width, hitbox.y);
                    ctx.scale(-1, 1);
                }
                ctx.drawImage(splashSprite, 0, 0, hitbox.width, hitbox.height);
                ctx.restore();
            }
        }
    }
    
    isAlive() {
        return this.hits < this.maxHits;
    }
}

console.log("✅ Player class loaded with sprite support (FIXED v2 - Set-based tracking)");