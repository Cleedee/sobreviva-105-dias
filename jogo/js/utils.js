/**
 * Utils - Funções utilitárias gerais
 */

// Constantes do jogo
const GAME_CONFIG = {
    // Dimensões do tile
    TILE_SIZE: 32,
    
    // Tamanho do mapa (em tiles)
    MAP_WIDTH: 100,  // Reduzido para teste
    MAP_HEIGHT: 100,
    
    // Jogador
    PLAYER_SPEED: 3,
    PLAYER_SIZE: 28,
    
    // Status iniciais
    INITIAL_HEALTH: 100,
    INITIAL_HUNGER: 100,
    INITIAL_THIRST: 100,
    
    // Taxa de decaimento (por segundo)
    HUNGER_DECAY_RATE: 0.15,
    THIRST_DECAY_RATE: 0.2,
    
    // Inventário
    INVENTORY_SIZE: 15,
    QUICK_SLOTS: 5,
    
    // Tempo
    DAY_DURATION: 120,    // 2 minutos = 1 dia
    NIGHT_DURATION: 60,   // 1 minuto = 1 noite
    
    // Crianças
    TOTAL_CHILDREN: 6,
    
    // Lua Cheia (a cada X noites)
    FULL_MOON_INTERVAL: 7
};

// Cores do tilemap
const TILE_COLORS = {
    GRASS_1: '#4a7c3f',
    GRASS_2: '#3d6b35',
    GRASS_3: '#5a8c4a',
    DIRT: '#8b7355',
    PATH: '#9a8b6e',
    WATER: '#3b82f6',
    TREE_TRUNK: '#5d4037',
    TREE_LEAVES: '#2d5a27',
    ROCK: '#6b7280',
    HOUSE: '#8b4513',
    PRISON: '#4a4a4a'
};

// Utilitários matemáticos
const MathUtils = {
    /**
     * Distância entre dois pontos
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Valor aleatório entre min e max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Inteiro aleatório entre min e max (inclusivo)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Clamp - limitar valor entre min e max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Lerp - interpolação linear
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    /**
     * Checar colisão entre dois retângulos
     */
    rectCollision(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    },
    
    /**
     * Checar colisão circular
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < r1 + r2;
    }
};

// Utilitários de array
const ArrayUtils = {
    /**
     * Pegar elemento aleatório de um array
     */
    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    /**
     * Embaralhar array (Fisher-Yates)
     */
    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Utilitários de cor
const ColorUtils = {
    /**
     * Escurecer cor
     */
    darken(color, amount) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`;
    },
    
    /**
     * Clarear cor
     */
    lighten(color, amount) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`;
    },
    
    /**
     * Hex para RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};

// Gerador de Perlin Noise simplificado
const NoiseGenerator = {
    /**
     * Gerar valor de noise simples
     */
    noise2D(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    },
    
    /**
     * Noise suavizado
     */
    smoothNoise(x, y, scale = 1, seed = 0) {
        const ix = Math.floor(x / scale);
        const iy = Math.floor(y / scale);
        const fx = (x / scale) - ix;
        const fy = (y / scale) - iy;
        
        const v00 = this.noise2D(ix, iy, seed);
        const v10 = this.noise2D(ix + 1, iy, seed);
        const v01 = this.noise2D(ix, iy + 1, seed);
        const v11 = this.noise2D(ix + 1, iy + 1, seed);
        
        const v0 = MathUtils.lerp(v00, v10, fx);
        const v1 = MathUtils.lerp(v01, v11, fx);
        
        return MathUtils.lerp(v0, v1, fy);
    }
};
