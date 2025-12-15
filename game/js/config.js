// =============================================================================
// GAME CONFIGURATION - Extended Version
// Semua constants dan settings game ada di sini
// =============================================================================

const CONFIG = {
    // Canvas Settings
    CANVAS: {
        WIDTH: 900,
        HEIGHT: 600
    },
    
    // Player Settings
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 70,
        SPEED: 3,         // Lebih natural untuk per frame
        JUMP_POWER: 25,    // Lebih natural untuk per frame
        GRAVITY: 2,      // Lebih natural untuk per frame
        MAX_HP: 100,
        ATTACK_DAMAGE: 15,
        ATTACK_RANGE: 50,
        ATTACK_COOLDOWN: 300,
        ATTACK_DURATION: 200,
        COLOR: '#4a9eff',
        INVINCIBLE_TIME: 1000,
        DASH_DISTANCE: 200, // Jarak dash (px)
        DASH_COOLDOWN: 700, // ms
        DASH_DURATION: 150  // ms (waktu invincible & animasi dash)
    },
    
    // Enemy Settings
    ENEMY: {
        WIDTH: 45,
        HEIGHT: 60,
        BASE_SPEED: 1,    // Lebih natural untuk per frame
        BASE_HP: 100,
        BASE_DAMAGE: 10,
        COLOR: '#ff4757',
        SPAWN_MARGIN: 150,
        PATROL_RANGE: 150,
        CHASE_RANGE: 250,
        CHASE_SPEED_MULTIPLIER: 2,
        TOUCH_DAMAGE_COOLDOWN: 1000
    },
    
    // Wave Settings
    WAVE: {
        BASE_ENEMY_COUNT: 3,
        ENEMY_INCREMENT: 2,
        HP_INCREASE_PER_WAVE: 15,
        SPEED_INCREASE_PER_WAVE: 0,
        DAMAGE_INCREASE_PER_WAVE: 2,
        SPAWN_DELAY: 2000, // milliseconds
        MAX_ENEMIES_PER_WAVE: 15,
        BOSS_WAVE_INTERVAL: 5 // Boss every 5 waves
    },
    
    // Scoring
    SCORE: {
        ENEMY_KILL:  100,
        WAVE_COMPLETE: 500,
        REMAINING_HP_MULTIPLIER: 10,
        BOSS_KILL: 1000
    },
    
    // Physics
    PHYSICS: {
        GROUND_Y: 520,
        GROUND_HEIGHT: 80,
        MAX_FALL_SPEED: 10
    },
    
    // Colors
    COLORS: {
        BACKGROUND: '#0f1419',
        GROUND: '#2d4059',
        GROUND_BORDER: '#5a7a9a',
        PLAYER_ATTACK: '#ffeb3b',
        HP_BAR_GOOD: '#4caf50',
        HP_BAR_MID: '#ff9800',
        HP_BAR_LOW: '#f44336',
        TEXT: '#ffffff'
    },
    
    // Game States
    STATES: {
        LOADING: 'loading',
        PLAYING: 'playing',
        WAVE_TRANSITION: 'wave_transition',
        GAME_OVER: 'game_over',
        PAUSED: 'paused'
    },
    
    // Enemy Types Distribution per Wave
    ENEMY_TYPES: {
        // Wave 1-2: Only Crawlid
        getTypeForWave:  function(wave) {
            if (wave <= 2) {
                return 'crawlid';
            } else if (wave <= 4) {
                // 80% Crawlid, 20% Boofly
                return Math.random() < 0.8 ? 'crawlid' : 'boofly';
            } else if (wave % this.BOSS_WAVE_INTERVAL === 0) {
                // Boss wave
                return 'boss';
            } else {
                // Mix of all types
                const rand = Math.random();
                if (rand < 0.6) return 'crawlid';
                if (rand < 0.9) return 'boofly';
                return 'crawlid'; // Default fallback
            }
        }
    },
    
    // Asset Paths
    ASSETS: {
        HERO: {
            IDLE: '../src/game/hero/idle/',
            ATTACK: '../src/game/hero/attack/',
            DASH: '../src/game/hero/dash/'
        },
        ENEMIES:  {
            CRAWLID:  {
                WALK: '../src/game/crawlid/walk/',
                DIE: '../src/game/crawlid/die/'
            },
            BOOFLY: {
                FLY: '../src/game/boofly/fly/',
                DIE: '../src/game/boofly/die/'
            },
            BOSS: {
                IDLE: '../src/game/boss/idle/',
                ATTACK: '../src/game/boss/attack/',
                DIE: '../src/game/boss/die/'
            }
        },
        ENVIRONMENT: {
            BACKGROUND: '../src/game/background. webp',
            FOREGROUND: '../src/game/foreground/foreground.png',
            PLATFORM: '../src/game/platform/platform.png',
            FLOOR: '../src/game/object/floor_6.png'
        }
    }
};

// Freeze agar tidak bisa diubah accidentally
Object.freeze(CONFIG);
Object.freeze(CONFIG.CANVAS);
Object.freeze(CONFIG. PLAYER);
Object.freeze(CONFIG.ENEMY);
Object.freeze(CONFIG.WAVE);
Object.freeze(CONFIG.SCORE);
Object.freeze(CONFIG. PHYSICS);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.STATES);
Object.freeze(CONFIG.ASSETS);

console.log("✅ CONFIG loaded successfully (Extended)");