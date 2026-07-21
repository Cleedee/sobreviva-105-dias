/**
 * World - Mundo e Mapa do Jogo
 */

// Tipos de tiles
const TILE_TYPES = {
    GRASS: { id: 1, name: 'Grama', solid: false, color: TILE_COLORS.GRASS_1 },
    GRASS_2: { id: 2, name: 'Grama', solid: false, color: TILE_COLORS.GRASS_2 },
    GRASS_3: { id: 3, name: 'Grama', solid: false, color: TILE_COLORS.GRASS_3 },
    DIRT: { id: 10, name: 'Terra', solid: false, color: TILE_COLORS.DIRT },
    PATH: { id: 11, name: 'Caminho', solid: false, color: TILE_COLORS.PATH },
    WATER: { id: 20, name: 'Água', solid: true, color: TILE_COLORS.WATER },
    TREE: { id: 30, name: 'Árvore', solid: true, color: TILE_COLORS.TREE_TRUNK, interactable: true, type: 'tree' },
    ROCK: { id: 31, name: 'Pedra', solid: true, color: TILE_COLORS.ROCK, interactable: true, type: 'rock' },
    BERRY_BUSH: { id: 32, name: 'Arbusto', solid: false, color: '#228B22', interactable: true, type: 'berry_bush' },
    CAMPFIRE: { id: 40, name: 'Fogueira', solid: false, color: '#ff6600', interactable: true, type: 'campfire' },
    WORKBENCH: { id: 41, name: 'Bancada', solid: true, color: '#8B4513', interactable: true, type: 'workbench' },
    CABIN: { id: 42, name: 'Cabana', solid: true, color: '#654321', interactable: true, type: 'cabin' },
    PRISON: { id: 50, name: 'Cela', solid: true, color: '#4a4a4a', interactable: true, type: 'prison' }
};

class World {
    constructor() {
        this.width = GAME_CONFIG.MAP_WIDTH;
        this.height = GAME_CONFIG.MAP_HEIGHT;
        this.tiles = [];
        this.seed = Math.random() * 10000;
        
        // Entidades
        this.enemies = [];
        this.children = [];
        this.npcs = [];
        
        // Objetos interativos
        this.interactables = [];
        
        // Campamento inicial
        this.campX = 0;
        this.campY = 0;
        
        this.generate();
    }
    
    generate() {
        // Inicializar grid
        this.tiles = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = new Array(this.width);
        }
        
        // Preencher com grama base
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.generateTile(x, y);
            }
        }
        
        // Criar campamento central
        this.createCamp();
        
        // Criar celas para as crianças
        this.createPrisons();
        
        // Criar fadas e animais presos
        this.createCaptives();
        
        // Spawnar inimigos
        this.spawnEnemies();
    }
    
    generateTile(x, y) {
        const noise1 = NoiseGenerator.smoothNoise(x, y, 20, this.seed);
        const noise2 = NoiseGenerator.smoothNoise(x, y, 10, this.seed + 100);
        const noise3 = NoiseGenerator.smoothNoise(x, y, 5, this.seed + 200);
        
        // Decidir tipo baseado no noise
        if (noise1 > 0.7) {
            // Água
            return { ...TILE_TYPES.WATER };
        } else if (noise1 > 0.6) {
            // Terra/caminho
            return { ...TILE_TYPES.DIRT };
        } else if (noise2 > 0.75 && Math.random() > 0.9) {
            // Árvore
            return { ...TILE_TYPES.TREE };
        } else if (noise2 > 0.65 && Math.random() > 0.95) {
            // Pedra
            return { ...TILE_TYPES.ROCK };
        } else if (noise3 > 0.7 && Math.random() > 0.97) {
            // Arbusto de frutas
            return { ...TILE_TYPES.BERRY_BUSH };
        } else {
            // Grama variada
            const grassVariant = Math.random();
            if (grassVariant > 0.66) return { ...TILE_TYPES.GRASS_2 };
            if (grassVariant > 0.33) return { ...TILE_TYPES.GRASS_3 };
            return { ...TILE_TYPES.GRASS };
        }
    }
    
    createCamp() {
        // Campamento no centro do mapa
        this.campX = Math.floor(this.width / 2);
        this.campY = Math.floor(this.height / 2);
        
        // Limpar área do campamento
        for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
                const x = this.campX + dx;
                const y = this.campY + dy;
                if (this.inBounds(x, y)) {
                    this.tiles[y][x] = { ...TILE_TYPES.GRASS };
                }
            }
        }
        
        // Adicionar construções do campamento
        this.setTile(this.campX, this.campY, { ...TILE_TYPES.CAMPFIRE });
        this.setTile(this.campX + 2, this.campY, { ...TILE_TYPES.WORKBENCH });
        this.setTile(this.campX - 2, this.campY, { ...TILE_TYPES.CABIN });
        this.setTile(this.campX, this.campY - 2, { ...TILE_TYPES.CABIN });
    }
    
    createPrisons() {
        const positions = [];
        
        // Criar 6 celas espalhadas
        for (let i = 0; i < GAME_CONFIG.TOTAL_CHILDREN; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                // Distância mínima do campamento
                const angle = (i / GAME_CONFIG.TOTAL_CHILDREN) * Math.PI * 2;
                const dist = MathUtils.random(40, 80);
                
                x = Math.floor(this.campX + Math.cos(angle) * dist);
                y = Math.floor(this.campY + Math.sin(angle) * dist);
                attempts++;
            } while (!this.inBounds(x, y) || attempts < 100);
            
            // Criar cela
            const prison = {
                ...TILE_TYPES.PRISON,
                prisonNumber: i + 1,
                locked: true,
                child: this.createChild(i + 1)
            };
            
            this.setTile(x, y, prison);
            positions.push({ x, y });
            
            // Limpar área ao redor
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    if (this.inBounds(tx, ty) && this.tiles[ty][tx].type !== 'prison') {
                        this.tiles[ty][tx] = { ...TILE_TYPES.DIRT };
                    }
                }
            }
        }
        
        return positions;
    }
    
    createChild(number) {
        const childNames = [
            'Luna', 'Sol', 'Estrela', 'Nuvem', 'Aurora', 'Céu'
        ];
        
        return {
            id: number,
            name: childNames[number - 1] || `Criança ${number}`,
            health: 100,
            hunger: 100,
            thirst: 100,
            following: false,
            rescued: false
        };
    }
    
    createCaptives() {
        // Fadas (3-5 espalhadas - reduzido para teste)
        const fairyCount = MathUtils.randomInt(3, 5);
        for (let i = 0; i < fairyCount; i++) {
            const pos = this.findEmptySpot();
            if (pos) {
                this.interactables.push({
                    type: 'fairy',
                    x: pos.x * GAME_CONFIG.TILE_SIZE,
                    y: pos.y * GAME_CONFIG.TILE_SIZE,
                    reward: ITEMS.FAIRY_DUST,
                    rescued: false
                });
            }
        }
        
        // Animais (lobos e ursos presos - reduzido para teste)
        const animalCount = MathUtils.randomInt(4, 6);
        for (let i = 0; i < animalCount; i++) {
            const pos = this.findEmptySpot();
            if (pos) {
                const isWolf = Math.random() > 0.4;
                this.interactables.push({
                    type: isWolf ? 'wolf_cage' : 'bear_cage',
                    x: pos.x * GAME_CONFIG.TILE_SIZE,
                    y: pos.y * GAME_CONFIG.TILE_SIZE,
                    reward: isWolf ? ITEMS.WOLF_PELT : ITEMS.BEAR_PELT,
                    rescued: false
                });
            }
        }
    }
    
    findEmptySpot() {
        let attempts = 0;
        while (attempts < 100) {
            const x = MathUtils.randomInt(10, this.width - 10);
            const y = MathUtils.randomInt(10, this.height - 10);
            
            if (this.tiles[y][x].solid === false) {
                return { x, y };
            }
            attempts++;
        }
        return null;
    }
    
    spawnEnemies() {
        // Lobos (reduzido para teste)
        const wolfCount = MathUtils.randomInt(10, 15);
        for (let i = 0; i < wolfCount; i++) {
            const pos = this.findEmptySpot();
            if (pos) {
                this.enemies.push(new Wolf(
                    pos.x * GAME_CONFIG.TILE_SIZE,
                    pos.y * GAME_CONFIG.TILE_SIZE
                ));
            }
        }
        
        // Ursos (reduzido para teste)
        const bearCount = MathUtils.randomInt(5, 8);
        for (let i = 0; i < bearCount; i++) {
            const pos = this.findEmptySpot();
            if (pos) {
                this.enemies.push(new Bear(
                    pos.x * GAME_CONFIG.TILE_SIZE,
                    pos.y * GAME_CONFIG.TILE_SIZE
                ));
            }
        }
    }
    
    update(deltaTime, timeManager, player) {
        // Atualizar inimigos
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, player, this);
        }
        
        // Atualizar crianças
        for (const child of this.children) {
            if (child.following) {
                // Seguir jogador
                const dist = MathUtils.distance(child.x, child.y, player.x, player.y);
                if (dist > 50) {
                    const angle = Math.atan2(player.y - child.y, player.x - child.x);
                    child.x += Math.cos(angle) * 1.5;
                    child.y += Math.sin(angle) * 1.5;
                }
                
                // Decair status
                child.hunger -= 0.1 * deltaTime;
                child.thirst -= 0.12 * deltaTime;
                child.hunger = MathUtils.clamp(child.hunger, 0, 100);
                child.thirst = MathUtils.clamp(child.thirst, 0, 100);
            }
        }
        
        // Lua cheia - Monstro se alimenta
        if (timeManager.isMoonActive() && this.children.length > 0) {
            // Lógica do Monstro Bugado (simplificada por agora)
            // TODO: Implementar monstro especial
        }
    }
    
    getTile(x, y) {
        if (!this.inBounds(x, y)) return null;
        return this.tiles[y][x];
    }
    
    setTile(x, y, tile) {
        if (!this.inBounds(x, y)) return;
        this.tiles[y][x] = tile;
    }
    
    removeTile(x, y) {
        if (!this.inBounds(x, y)) return;
        this.tiles[y][x] = { ...TILE_TYPES.GRASS };
    }
    
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    // Renderizar tiles visíveis
    render(ctx, camera, timeManager) {
        const startX = Math.max(0, Math.floor(camera.x / GAME_CONFIG.TILE_SIZE));
        const startY = Math.max(0, Math.floor(camera.y / GAME_CONFIG.TILE_SIZE));
        const endX = Math.min(this.width, Math.ceil((camera.x + camera.width) / GAME_CONFIG.TILE_SIZE) + 1);
        const endY = Math.min(this.height, Math.ceil((camera.y + camera.height) / GAME_CONFIG.TILE_SIZE) + 1);
        
        const brightness = timeManager.getBrightness();
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (tile) {
                    const screenX = x * GAME_CONFIG.TILE_SIZE - camera.x;
                    const screenY = y * GAME_CONFIG.TILE_SIZE - camera.y;
                    
                    // Cor base
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(screenX, screenY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                    
                    // Efeito de brilho (dia/noite)
                    if (brightness < 1) {
                        ctx.fillStyle = `rgba(0, 0, 30, ${1 - brightness})`;
                        ctx.fillRect(screenX, screenY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                    }
                    
                    // Detalhes extras
                    this.renderTileDetails(ctx, tile, screenX, screenY, x, y);
                }
            }
        }
    }
    
    renderTileDetails(ctx, tile, x, y, tileX, tileY) {
        ctx.save();
        
        switch (tile.type) {
            case 'tree':
                // Tronco
                ctx.fillStyle = TILE_COLORS.TREE_TRUNK;
                ctx.fillRect(x + 12, y + 16, 8, 16);
                // Copa
                ctx.fillStyle = TILE_COLORS.TREE_LEAVES;
                ctx.beginPath();
                ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'rock':
                ctx.fillStyle = '#7f8c8d';
                ctx.beginPath();
                ctx.moveTo(x + 8, y + 24);
                ctx.lineTo(x + 16, y + 8);
                ctx.lineTo(x + 24, y + 24);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'berry_bush':
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.arc(x + 16, y + 18, 10, 0, Math.PI * 2);
                ctx.fill();
                // Frutas
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(x + 12, y + 16, 3, 0, Math.PI * 2);
                ctx.arc(x + 20, y + 18, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'campfire':
                // Fogueira
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 8, y + 20, 16, 8);
                // Fogo
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.moveTo(x + 16, y + 8);
                ctx.lineTo(x + 12, y + 20);
                ctx.lineTo(x + 20, y + 20);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.moveTo(x + 16, y + 12);
                ctx.lineTo(x + 14, y + 20);
                ctx.lineTo(x + 18, y + 20);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'prison':
                // Grade da cela
                ctx.fillStyle = '#333';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(x + 4 + i * 8, y + 4, 2, 24);
                }
                ctx.fillRect(x + 4, y + 4, 24, 2);
                ctx.fillRect(x + 4, y + 28, 24, 2);
                // Número
                ctx.fillStyle = '#ff0';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(tile.prisonNumber, x + 16, y + 18);
                break;
                
            case 'water':
                // Ondas
                ctx.strokeStyle = '#5dade2';
                ctx.lineWidth = 1;
                const waveOffset = (Date.now() / 500 + tileX) % 4;
                ctx.beginPath();
                ctx.moveTo(x, y + 16 + Math.sin(waveOffset) * 2);
                ctx.quadraticCurveTo(x + 16, y + 16 + Math.sin(waveOffset + 1) * 2, x + 32, y + 16 + Math.sin(waveOffset + 2) * 2);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    // Renderizar inimigos
    renderEnemies(ctx, camera, timeManager) {
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.render(ctx, camera, timeManager);
            }
        }
    }
    
    // Renderizar crianças e interativos
    renderInteractables(ctx, camera, timeManager) {
        // Crianças
        for (const child of this.children) {
            this.renderChild(ctx, camera, child, timeManager);
        }
        
        // Entidades interativas
        for (const obj of this.interactables) {
            if (!obj.rescued) {
                this.renderInteractable(ctx, camera, obj, timeManager);
            }
        }
    }
    
    renderChild(ctx, camera, child, timeManager) {
        const screenX = child.x - camera.x;
        const screenY = child.y - camera.y;
        
        // Não renderizar se fora da tela
        if (screenX < -50 || screenX > camera.width + 50 ||
            screenY < -50 || screenY > camera.height + 50) {
            return;
        }
        
        ctx.save();
        
        // Corpo
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(screenX - 8, screenY - 4, 16, 16);
        
        // Cabeça
        ctx.fillStyle = '#fdbcb4';
        ctx.beginPath();
        ctx.arc(screenX, screenY - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Nome
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(child.name, screenX, screenY - 18);
        
        // Indicador se seguindo
        if (child.following) {
            ctx.fillStyle = '#22c55e';
            ctx.fillText('♥', screenX, screenY - 24);
        }
        
        ctx.restore();
    }
    
    renderInteractable(ctx, camera, obj, timeManager) {
        const screenX = obj.x - camera.x;
        const screenY = obj.y - camera.y;
        
        ctx.save();
        
        switch (obj.type) {
            case 'fairy':
                // Fada brilhante
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 16, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 16, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'wolf_cage':
            case 'bear_cage':
                // Jaula
                ctx.fillStyle = '#666';
                ctx.fillRect(screenX + 4, screenY + 4, 24, 24);
                ctx.fillStyle = '#333';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(screenX + 8 + i * 8, screenY + 4, 2, 24);
                }
                break;
        }
        
        ctx.restore();
    }
}

/**
 * Enemy - Classe base para inimigos
 */
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.type = type;
        
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        this.speed = 1;
        this.isAlive = true;
        
        this.state = 'idle'; // idle, patrol, chase, attack
        this.targetX = x;
        this.targetY = y;
        this.stateTimer = 0;
        
        this.detectionRange = 150;
        this.attackRange = 30;
        this.attackCooldown = 0;
    }
    
    update(deltaTime, player, world) {
        if (!this.isAlive) return;
        
        // Atualizar cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Distância ao jogador
        const distToPlayer = MathUtils.distance(
            this.x + this.width / 2, this.y + this.height / 2,
            player.x + player.width / 2, player.y + player.height / 2
        );
        
        // Mudar estado baseado na distância
        if (distToPlayer < this.attackRange) {
            this.state = 'attack';
        } else if (distToPlayer < this.detectionRange) {
            this.state = 'chase';
        } else if (this.state === 'chase') {
            this.state = 'patrol';
        }
        
        // Comportamento baseado no estado
        switch (this.state) {
            case 'idle':
                this.updateIdle(deltaTime);
                break;
            case 'patrol':
                this.updatePatrol(deltaTime, world);
                break;
            case 'chase':
                this.updateChase(deltaTime, player);
                break;
            case 'attack':
                this.updateAttack(deltaTime, player);
                break;
        }
    }
    
    updateIdle(deltaTime) {
        this.stateTimer += deltaTime;
        if (this.stateTimer > 2) {
            this.state = 'patrol';
            this.stateTimer = 0;
            this.targetX = this.x + MathUtils.random(-100, 100);
            this.targetY = this.y + MathUtils.random(-100, 100);
        }
    }
    
    updatePatrol(deltaTime, world) {
        const dist = MathUtils.distance(this.x, this.y, this.targetX, this.targetY);
        
        if (dist < 10) {
            this.state = 'idle';
            this.stateTimer = 0;
            return;
        }
        
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        const newX = this.x + Math.cos(angle) * this.speed * 0.5;
        const newY = this.y + Math.sin(angle) * this.speed * 0.5;
        
        // Verificar colisão
        if (!this.checkCollision(newX, newY, world)) {
            this.x = newX;
            this.y = newY;
        } else {
            this.state = 'idle';
            this.stateTimer = 0;
        }
    }
    
    updateChase(deltaTime, player) {
        const angle = Math.atan2(
            player.y + player.height / 2 - (this.y + this.height / 2),
            player.x + player.width / 2 - (this.x + this.width / 2)
        );
        
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
    
    updateAttack(deltaTime, player) {
        if (this.attackCooldown <= 0) {
            player.takeDamage(this.damage);
            this.attackCooldown = 1;
        }
    }
    
    checkCollision(x, y, world) {
        const tileX = Math.floor((x + this.width / 2) / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor((y + this.height / 2) / GAME_CONFIG.TILE_SIZE);
        const tile = world.getTile(tileX, tileY);
        return tile && tile.solid;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
        this.state = 'chase'; // Reagir ao dano
    }
    
    die() {
        this.isAlive = false;
        // TODO: Dropar itens
    }
    
    render(ctx, camera, timeManager) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (screenX < -50 || screenX > camera.width + 50 ||
            screenY < -50 || screenY > camera.height + 50) {
            return;
        }
        
        ctx.save();
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width / 2, screenY + this.height, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo (será sobrescrito por classes filhas)
        ctx.fillStyle = '#666';
        ctx.fillRect(screenX + 4, screenY + 4, this.width - 8, this.height - 4);
        
        ctx.restore();
    }
}

/**
 * Wolf - Lobo inimigo
 */
class Wolf extends Enemy {
    constructor(x, y) {
        super(x, y, 'wolf');
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 8;
        this.speed = 2;
        this.detectionRange = 120;
    }
    
    render(ctx, camera, timeManager) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (screenX < -50 || screenX > camera.width + 50 ||
            screenY < -50 || screenY > camera.height + 50) {
            return;
        }
        
        ctx.save();
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 14, screenY + 28, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.ellipse(screenX + 14, screenY + 18, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cabeça
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.arc(screenX + 22, screenY + 14, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(screenX + 24, screenY + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Barra de vida (se machucado)
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#333';
            ctx.fillRect(screenX + 4, screenY - 8, 20, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(screenX + 4, screenY - 8, (this.health / this.maxHealth) * 20, 4);
        }
        
        ctx.restore();
    }
}

/**
 * Bear - Urso inimigo
 */
class Bear extends Enemy {
    constructor(x, y) {
        super(x, y, 'bear');
        this.width = 36;
        this.height = 36;
        this.health = 150;
        this.maxHealth = 150;
        this.damage = 20;
        this.speed = 1.2;
        this.detectionRange = 100;
    }
    
    render(ctx, camera, timeManager) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (screenX < -50 || screenX > camera.width + 50 ||
            screenY < -50 || screenY > camera.height + 50) {
            return;
        }
        
        ctx.save();
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 18, screenY + 36, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.ellipse(screenX + 18, screenY + 22, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cabeça
        ctx.fillStyle = '#a0522d';
        ctx.beginPath();
        ctx.arc(screenX + 18, screenY + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Orelhas
        ctx.beginPath();
        ctx.arc(screenX + 10, screenY + 6, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 26, screenY + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(screenX + 14, screenY + 10, 2, 0, Math.PI * 2);
        ctx.arc(screenX + 22, screenY + 10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Barra de vida
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#333';
            ctx.fillRect(screenX + 4, screenY - 8, 28, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(screenX + 4, screenY - 8, (this.health / this.maxHealth) * 28, 4);
        }
        
        ctx.restore();
    }
}
