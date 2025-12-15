// =============================================================================
// BARREL CLASS - Falling Hazards for Boss Waves
// Barrels fall from the sky and damage player on contact
// =============================================================================

class Barrel {
    constructor(x) {
        this.x = x;
        this.y = -60; // Start above screen
        this.width = 50;
        this.height = 50;
        
        // Physics
        this.velocityY = 2; // Initial fall speed
        this.gravity = 0.3;
        this.maxFallSpeed = 5;
        
        // State
        this.isActive = true;
        this.damage = 1; // Damage to player (1 hit)
        
        // Visual effects
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Apply gravity
        this.velocityY += this.gravity;
        if (this.velocityY > this.maxFallSpeed) {
            this.velocityY = this.maxFallSpeed;
        }
        
        // Move down
        this.y += this.velocityY;
        
        // Rotate for effect
        this.rotation += this.rotationSpeed;
        
        // Check if hit ground
        const groundY = CONFIG.PHYSICS.GROUND_Y;
        if (this.y + this.height >= groundY) {
            this.isActive = false;
            console.log('💥 Barrel hit ground!');
        }
        
        // Remove if far below screen
        if (this.y > CONFIG.CANVAS.HEIGHT + 100) {
            this.isActive = false;
        }
    }
    
    checkPlayerCollision(player, assets) {
        if (!this.isActive || player.isInvincible) return false;

        // Box collision check (AABB)
        const boxColliding =
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;

        if (!boxColliding) return false;

        // Pixel-perfect collision jika kedua sprite tersedia
        let pixelColliding = true;
        if (
            assets && assets.environment && assets.environment.barrel && assets.environment.barrel.complete &&
            assets.hero && assets.hero.idle && assets.hero.idle.length > 0 && assets.hero.idle[0].complete
        ) {
            // Ambil frame idle player (asumsi frame 0)
            const playerSprite = assets.hero.idle[0];
            const barrelSprite = assets.environment.barrel;
            // Hitung overlap area
            const overlapX = Math.max(this.x, player.x);
            const overlapY = Math.max(this.y, player.y);
            const overlapW = Math.min(this.x + this.width, player.x + player.width) - overlapX;
            const overlapH = Math.min(this.y + this.height, player.y + player.height) - overlapY;
            if (overlapW > 0 && overlapH > 0) {
                pixelColliding = pixelPerfectCollision(
                    barrelSprite, this.x, this.y,
                    playerSprite, player.x, player.y,
                    overlapW, overlapH
                );
            } else {
                pixelColliding = false;
            }
        }

        if (pixelColliding) {
            console.log('💥 Barrel hit player! (pixel-perfect)');
            player.takeDamage(this.damage);
            this.isActive = false; // Destroy barrel on impact
            return true;
        }
        return false;
    }
    
    draw(ctx, assets) {
        if (!this.isActive) return;
        
        ctx.save();
        
        // Move to barrel center for rotation
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw barrel sprite or fallback
        if (assets && assets.environment && assets.environment.barrel && assets.environment.barrel.complete) {
            ctx.drawImage(
                assets.environment.barrel,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback: Brown rectangle
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Barrel rings
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Horizontal bands
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, -this.height / 4);
            ctx.lineTo(this.width / 2, -this.height / 4);
            ctx.moveTo(-this.width / 2, this.height / 4);
            ctx.lineTo(this.width / 2, this.height / 4);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Debug: Draw shadow on ground
        if (this.y < CONFIG.PHYSICS.GROUND_Y) {
            const shadowY = CONFIG.PHYSICS.GROUND_Y;
            const shadowAlpha = Math.max(0, 1 - (shadowY - this.y) / 300);
            
            ctx.save();
            ctx.globalAlpha = shadowAlpha * 0.3;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width / 2,
                shadowY - 5,
                this.width / 2,
                10,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        }
    }
}

console.log("✅ Barrel class loaded");