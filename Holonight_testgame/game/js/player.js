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
        
        // Health
        this.hp = CONFIG. PLAYER.MAX_HP;
        this.maxHp = CONFIG.PLAYER. MAX_HP;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        
        // Attack
        this.isAttacking = false;
        this.attackDamage = CONFIG. PLAYER.ATTACK_DAMAGE;
        this.attackRange = CONFIG.PLAYER.ATTACK_RANGE;
        this.lastAttackTime = 0;
        this.attackDuration = CONFIG.PLAYER. ATTACK_DURATION;
        this.attackStartTime = 0;
        
        // Animation
        this.currentFrame = 0;
        this. frameCounter = 0;
        this. animationSpeed = 8;
        this.state = 'idle'; // idle, attack
        
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

        if (this.isAttacking) {
            if (Date.now() - this.attackStartTime > this.attackDuration) {
                this.isAttacking = false;
                this.state = 'idle';
                this.currentFrame = 0;
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
            this. isFacingRight = true;
        }
    }
    
    handleJump() {
        // X = lompat
        if ((this.keys['x'] || this.keys['X']) && this.isOnGround && this.canJump) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
            this.canJump = false;
        }

        if (!this.keys['x'] && !this.keys['X']) {
            this.canJump = true;
        }
    }
    
    handleAttack() {
        // Z = attack
        const currentTime = Date.now();
        const cooldownPassed = currentTime - this.lastAttackTime > CONFIG.PLAYER.ATTACK_COOLDOWN;

        if ((this.keys['z'] || this.keys['Z']) && !this.isAttacking && cooldownPassed) {
            this.isAttacking = true;
            this.state = 'attack';
            this.attackStartTime = currentTime;
            this.lastAttackTime = currentTime;
            this.currentFrame = 0;
            this.frameCounter = 0;
            this.animationSpeed = 6; // Faster attack animation
        }
    }
    
    applyGravity() {
        if (! this.isOnGround) {
            this.velocityY += this.gravity;
            
            if (this.velocityY > CONFIG.PHYSICS.MAX_FALL_SPEED) {
                this.velocityY = CONFIG. PHYSICS.MAX_FALL_SPEED;
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
            this.x = CONFIG. CANVAS.WIDTH - this.width;
        }
    }
    
    updateAnimation() {
        this.frameCounter++;
        
        if (this. frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            
            if (this.state === 'attack') {
                this.currentFrame++;
                // Attack has 2 frames
                if (this. currentFrame >= 2) {
                    this.currentFrame = 1; // Hold last frame
                }
            } else {
                // Idle has 5 frames
                this.currentFrame = (this.currentFrame + 1) % 5;
            }
        }
    }
    
    getAttackHitbox() {
        if (! this.isAttacking) return null;
        
        return {
            x: this.isFacingRight ? 
                this.x + this.width :  
                this.x - this.attackRange,
            y: this. y,
            width: this. attackRange,
            height: this.height
        };
    }
    
    takeDamage(damage) {
        if (this.isInvincible) return false;
        
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
        
        this.isInvincible = true;
        this.invincibleTimer = CONFIG.PLAYER. INVINCIBLE_TIME / 16.67; // Convert to frames
        
        return true;
    }
    
    draw(ctx, assets) {
        // Blinking effect saat invincible
        if (this.isInvincible) {
            const shouldDraw = Math.floor(this.invincibleTimer / 5) % 2 === 0;
            if (! shouldDraw) return;
        }
        
        ctx.save();
        
        // Flip sprite jika menghadap kiri
        if (! this.isFacingRight) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // Get current sprite
        const spriteArray = this.state === 'attack' ? assets. hero. attack : assets.hero.idle;
        const currentSprite = spriteArray[this.currentFrame];
        
        if (currentSprite && currentSprite.complete) {
            ctx.drawImage(currentSprite, 0, 0, this.width, this.height);
        } else {
            // Fallback rectangle
            ctx.fillStyle = CONFIG.PLAYER.COLOR;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        ctx.restore();
        
        // Draw attack hitbox (debug/visual)
        if (this.isAttacking) {
            const hitbox = this.getAttackHitbox();
            ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
            ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox. height);
            
            ctx.strokeStyle = CONFIG.COLORS.PLAYER_ATTACK;
            ctx.lineWidth = 3;
            ctx.strokeRect(hitbox.x, hitbox. y, hitbox.width, hitbox.height);
        }
        
        // HP bar above player
        this.drawHealthBar(ctx);
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 6;
        const barX = this.x;
        const barY = this. y - 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercentage = this.hp / this.maxHp;
        
        if (hpPercentage > 0.5) {
            ctx.fillStyle = CONFIG.COLORS.HP_BAR_GOOD;
        } else if (hpPercentage > 0.25) {
            ctx.fillStyle = CONFIG.COLORS.HP_BAR_MID;
        } else {
            ctx.fillStyle = CONFIG.COLORS.HP_BAR_LOW;
        }
        
        ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    isAlive() {
        return this. hp > 0;
    }
}

console.log("✅ Player class loaded with sprite support");