// =============================================================================
// ENEMY CLASS - Multiple Types with Sprite Animation
// Supports:  Crawlid (ground), Boofly (flying), Boss
// =============================================================================

class Enemy {
    constructor(x, y, wave, type = 'crawlid') {
        // Position & Dimensions
        this.x = x;
        this.y = y;
        this.type = type; // 'crawlid', 'boofly', 'boss'
        
        // Set dimensions based on type
        this.setDimensionsByType();
        
        // Wave Scaling
        this.wave = wave;
        this.maxHp = this.calculateHP(wave);
        this.hp = this.maxHp;
        this.speed = this.calculateSpeed(wave);
        this.damage = this.calculateDamage(wave);
        
        // Movement
        this.velocityX = this.speed;
        this.velocityY = 0;
        this.gravity = CONFIG.PLAYER.GRAVITY;
        this. isOnGround = false;
        
        // AI State
        this.aiState = 'patrol'; // 'patrol', 'chase', 'attack'
        this.patrolStartX = x;
        this.patrolRange = CONFIG.ENEMY.PATROL_RANGE;
        // Dua batas patrol
        this.patrolMinX = this.patrolStartX - this.patrolRange;
        this.patrolMaxX = this.patrolStartX + this.patrolRange;
        this.patrolMinX = Math.max(0, this.patrolMinX);
        this.patrolMaxX = Math.min(CONFIG.CANVAS.WIDTH - this.width, this.patrolMaxX);
        this.chaseRange = CONFIG.ENEMY.CHASE_RANGE;
        
        // Animation
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.animationSpeed = 10;
        this.state = 'walk'; // 'walk', 'die'
        this.isFacingRight = true;
        
        // Combat
        this.lastTouchDamageTime = 0;
        this.isDead = false;
        this.deathAnimationComplete = false;
        
        // Flying enemy specific (Boofly)
        if (this.type === 'boofly') {
            this.flyAmplitude = 30;
            this.flyFrequency = 0.05;
            this.flyOffset = Math.random() * Math.PI * 2;
            this.baseY = y;
            this.gravity = 0; // Flying enemies don't fall
        }
    }
    
    setDimensionsByType() {
        switch(this.type) {
            case 'crawlid':
                this.width = CONFIG.ENEMY.WIDTH;
                this.height = CONFIG.ENEMY.HEIGHT;
                break;
            case 'boofly':
                this.width = 50;
                this.height = 45;
                break;
            case 'boss':
                this. width = 80;
                this.height = 100;
                break;
            default:
                this.width = CONFIG.ENEMY.WIDTH;
                this.height = CONFIG.ENEMY.HEIGHT;
        }
    }
    
    calculateHP(wave) {
        const baseHP = CONFIG.ENEMY.BASE_HP;
        const increase = CONFIG.WAVE.HP_INCREASE_PER_WAVE;
        
        let multiplier = 1;
        if (this.type === 'boofly') multiplier = 0.8; // Flying enemies weaker
        if (this.type === 'boss') multiplier = 3; // Boss 3x stronger
        
        return Math.floor((baseHP + ((wave - 1) * increase)) * multiplier);
    }
    
    calculateSpeed(wave) {
        const baseSpeed = CONFIG.ENEMY.BASE_SPEED;
        const increase = CONFIG. WAVE.SPEED_INCREASE_PER_WAVE;
        
        let multiplier = 1;
        if (this.type === 'boofly') multiplier = 1.3; // Flying enemies faster
        if (this.type === 'boss') multiplier = 0.7; // Boss slower but tankier
        
        return (baseSpeed + ((wave - 1) * increase)) * multiplier;
    }
    
    calculateDamage(wave) {
        const baseDamage = CONFIG.ENEMY.BASE_DAMAGE;
        const increase = CONFIG.WAVE. DAMAGE_INCREASE_PER_WAVE;
        
        let multiplier = 1;
        if (this.type === 'boofly') multiplier = 0.8;
        if (this.type === 'boss') multiplier = 2;
        
        return Math. floor((baseDamage + ((wave - 1) * increase)) * multiplier);
    }
    
    update(deltaTime, player) {
        if (this.isDead) {
            this.updateDeathAnimation();
            return;
        }

        // Update AI
        this.updateAI(player);

        // Apply movement based on type
        if (this.type === 'boofly') {
            this.updateFlyingMovement();
        } else {
            this.applyGravity();
        }

        // Movement update tanpa dikali deltaTime
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Collision checks
        if (this.type !== 'boofly') {
            this.checkGroundCollision();
        }
        this.constrainToCanvas();
        this.checkPlayerCollision(player);

        // Update animation
        this.updateAnimation();
    }
    
    updateAI(player) {
        const distanceToPlayer = Math.abs(this.x - player.x);
        
        if (distanceToPlayer < this.chaseRange) {
            this.aiState = 'chase';
            this.chase(player);
        } else {
            this.aiState = 'patrol';
            this.patrol();
        }
    }
    
    patrol() {
        // Enemy bolak-balik antara patrolMinX dan patrolMaxX
        if (this.velocityX > 0 && this.x >= this.patrolMaxX) {
            this.x = this.patrolMaxX;
            this.velocityX = -Math.abs(this.speed);
        } else if (this.velocityX < 0 && this.x <= this.patrolMinX) {
            this.x = this.patrolMinX;
            this.velocityX = Math.abs(this.speed);
        }
        // Selalu update arah sesuai velocityX
        this.isFacingRight = this.velocityX > 0;
    }
    
    chase(player) {
        if (player.x < this.x) {
            this.velocityX = -this.speed * CONFIG.ENEMY.CHASE_SPEED_MULTIPLIER;
        } else {
            this.velocityX = this.speed * CONFIG.ENEMY.CHASE_SPEED_MULTIPLIER;
        }
        // Selalu update arah sesuai velocityX
        this.isFacingRight = this.velocityX > 0;
    }
    
    updateFlyingMovement() {
        // Sinusoidal flying pattern for Boofly
        this.flyOffset += this.flyFrequency;
        this.y = this.baseY + Math.sin(this.flyOffset) * this.flyAmplitude;
    }
    
    applyGravity() {
        if (!this.isOnGround) {
            this.velocityY += this.gravity;
            
            if (this.velocityY > CONFIG.PHYSICS.MAX_FALL_SPEED) {
                this.velocityY = CONFIG. PHYSICS.MAX_FALL_SPEED;
            }
        }
    }
    
    checkGroundCollision() {
        const groundY = CONFIG. PHYSICS.GROUND_Y;
        
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
    }
    
    constrainToCanvas() {
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = Math.abs(this.velocityX);
            this.isFacingRight = true;
        }
        if (this.x + this.width > CONFIG.CANVAS.WIDTH) {
            this.x = CONFIG.CANVAS.WIDTH - this. width;
            this.velocityX = -Math.abs(this.velocityX);
            this.isFacingRight = false;
        }
    }
    
    checkPlayerCollision(player) {
        if (player.isInvincible) return;
        
        const colliding = 
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;
        
        if (colliding) {
            const currentTime = Date.now();
            if (currentTime - this.lastTouchDamageTime > CONFIG. ENEMY.TOUCH_DAMAGE_COOLDOWN) {
                if (player.takeDamage(this. damage)) {
                    this. lastTouchDamageTime = currentTime;
                    
                    // Knockback enemy
                    if (this.x < player.x) {
                        this.velocityX = -this.speed * 2;
                    } else {
                        this.velocityX = this.speed * 2;
                    }
                }
            }
        }
    }
    
    takeDamage(damage) {
        if (this.isDead) return false;
        
        this.hp -= damage;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.state = 'die';
            this.currentFrame = 0;
            this.frameCounter = 0;
            return true; // Enemy killed
        }
        
        // Knockback on hit
        this.velocityY = -5;
        return false; // Enemy damaged but alive
    }
    
    updateAnimation() {
        this.frameCounter++;
        
        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            
            if (this.state === 'walk') {
                // Crawlid has 4 walk frames
                this.currentFrame = (this.currentFrame + 1) % 4;
            } else if (this.state === 'die') {
                // Death animation
                if (this.currentFrame < 2) { // Assuming 3 death frames
                    this.currentFrame++;
                } else {
                    this.deathAnimationComplete = true;
                }
            }
        }
    }
    
    updateDeathAnimation() {
        // Continue death animation
        this.frameCounter++;
        if (this.frameCounter >= this.animationSpeed) {
            this.frameCounter = 0;
            if (this.currentFrame < 2) {
                this.currentFrame++;
            }
        }
    }
    
    draw(ctx) {
        if (this.isDead && this.deathAnimationComplete) {
            // Fade out after death animation
            return;
        }

        ctx.save();

        // Flip sprite based on direction
        if (this.isFacingRight) {
            // Menghadap kanan (default), tidak di-flip
            ctx.translate(this.x, this.y);
        } else {
            // Menghadap kiri, flip horizontal
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
        }

        // Draw sprite based on type and state
        this.drawSprite(ctx);

        ctx.restore();

        // Draw HP bar (only if alive)
        if (!this.isDead) {
            this.drawHealthBar(ctx);
            this.drawDebugInfo(ctx);
        }
    }
    
    drawSprite(ctx) {
        // Try to load sprite from Assets global object
        if (typeof Assets !== 'undefined' && Assets.enemies) {
            let spriteArray = null;
            if (this.type === 'crawlid') {
                spriteArray = this.state === 'die' ? 
                    Assets.enemies.crawlid.die : 
                    Assets.enemies.crawlid.walk;
            } else if (this.type === 'boofly') {
                spriteArray = this.state === 'die' ?  
                    Assets.enemies.boofly.die : 
                    Assets.enemies.boofly.fly;
            } else if (this.type === 'boss') {
                if (this.state === 'die') {
                    spriteArray = Assets.enemies.boss.die;
                } else if (this.state === 'attack') {
                    spriteArray = Assets.enemies.boss.attack;
                } else {
                    spriteArray = Assets.enemies.boss.idle;
                }
            }
            if (spriteArray && spriteArray.length > 0) {
                const sprite = spriteArray[this.currentFrame % spriteArray.length];
                if (sprite && sprite.complete) {
                    ctx.drawImage(sprite, 0, 0, this.width, this.height);
                    return;
                }
            }
        }
        // Fallback:  Draw colored rectangle
        this.drawFallbackSprite(ctx);
    }
    
    drawFallbackSprite(ctx) {
        // Different colors for different types
        let color = CONFIG.ENEMY.COLOR;
        
        if (this.type === 'boofly') {
            color = '#ff6b9d'; // Pink for flying
        } else if (this.type === 'boss') {
            color = '#8b0000'; // Dark red for boss
        }
        
        // Apply death fade
        if (this.isDead) {
            ctx.globalAlpha = 0.5;
        }
        
        // Wave intensity (brighter = higher wave)
        const intensity = Math.min(255, 150 + (this.wave * 10));
        ctx.fillStyle = this.isDead ? '#666666' : color;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx. strokeRect(0, 0, this.width, this.height);
        
        // Wave number indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`W${this.wave}`, this.width / 2, this.height / 2 + 4);
        
        ctx.globalAlpha = 1.0;
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 5;
        const barX = this.x;
        const barY = this. y - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const hpPercentage = this.hp / this.maxHp;
        ctx.fillStyle = hpPercentage > 0.5 ? '#4caf50' : '#ff9800';
        ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    drawDebugInfo(ctx) {
        // AI state indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.aiState. toUpperCase(), this.x + this.width / 2, this. y - 20);
        
        // Type indicator
        ctx.font = 'bold 8px Arial';
        ctx.fillStyle = '#ffeb3b';
        ctx. fillText(this.type.toUpperCase(), this.x + this.width / 2, this. y - 30);
    }
}

console.log("✅ Enemy class loaded with multi-type support");