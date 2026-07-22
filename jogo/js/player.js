/**
 * Player - Jogador principal
 */

class Player {
    constructor(x, y) {
        // Posição
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER_SIZE;
        this.height = GAME_CONFIG.PLAYER_SIZE;
        
        // Velocidade
        this.speed = GAME_CONFIG.PLAYER_SPEED;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Status
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.hunger = GAME_CONFIG.INITIAL_HUNGER;
        this.thirst = GAME_CONFIG.INITIAL_THIRST;
        this.maxHealth = 100;
        this.maxHunger = 100;
        this.maxThirst = 100;
        
        // Inventário
        this.inventory = new Inventory(GAME_CONFIG.INVENTORY_SIZE);
        this.equippedItem = null;
        
        // Crianças resgatadas
        this.children = [];
        this.childrenFollowing = [];
        
        // Animação
        this.facing = 'down'; // up, down, left, right
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;
        
        // Invencibilidade
        this.isInvincible = false;
        this.invincibleTimer = 0;
        
        // Combate
        this.attackCooldown = 0;
        this.attackRange = 40;
    }
    
    update(deltaTime, world) {
        // Input de movimento
        const movement = input.getMovement();
        
        this.velocityX = movement.x * this.speed;
        this.velocityY = movement.y * this.speed;
        
        this.isMoving = movement.x !== 0 || movement.y !== 0;
        
        // Atualizar facing
        if (this.isMoving) {
            if (Math.abs(movement.x) > Math.abs(movement.y)) {
                this.facing = movement.x > 0 ? 'right' : 'left';
            } else {
                this.facing = movement.y > 0 ? 'down' : 'up';
            }
        }
        
        // Aplicar movimento com colisão
        this.moveWithCollision(world, deltaTime);
        
        // Manter dentro do mapa
        this.x = MathUtils.clamp(this.x, 0, world.width * GAME_CONFIG.TILE_SIZE - this.width);
        this.y = MathUtils.clamp(this.y, 0, world.height * GAME_CONFIG.TILE_SIZE - this.height);
        
        // Atualizar animação
        this.updateAnimation(deltaTime);
        
        // Atualizar status (fome e sede)
        this.updateStatus(deltaTime);
        
        // Atualizar invencibilidade
        if (this.isInvincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        // Atualizar cooldown de ataque
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Ações
        this.handleActions();
    }
    
    moveWithCollision(world, deltaTime) {
        // Tentar mover X
        const newX = this.x + this.velocityX;
        if (!this.checkCollision(newX, this.y, world)) {
            this.x = newX;
        }
        
        // Tentar mover Y
        const newY = this.y + this.velocityY;
        if (!this.checkCollision(this.x, newY, world)) {
            this.y = newY;
        }
    }
    
    checkCollision(x, y, world) {
        const tileX1 = Math.floor(x / GAME_CONFIG.TILE_SIZE);
        const tileY1 = Math.floor(y / GAME_CONFIG.TILE_SIZE);
        const tileX2 = Math.floor((x + this.width - 1) / GAME_CONFIG.TILE_SIZE);
        const tileY2 = Math.floor((y + this.height - 1) / GAME_CONFIG.TILE_SIZE);
        
        for (let ty = tileY1; ty <= tileY2; ty++) {
            for (let tx = tileX1; tx <= tileX2; tx++) {
                const tile = world.getTile(tx, ty);
                if (tile && tile.solid) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        
        if (this.animTimer >= 0.15) {
            this.animTimer = 0;
            if (this.isMoving) {
                this.animFrame = (this.animFrame + 1) % 4;
            } else {
                this.animFrame = 0;
            }
        }
    }
    
    updateStatus(deltaTime) {
        // Decair fome e sede
        this.hunger -= GAME_CONFIG.HUNGER_DECAY_RATE * deltaTime;
        this.thirst -= GAME_CONFIG.THIRST_DECAY_RATE * deltaTime;
        
        // Clamp
        this.hunger = MathUtils.clamp(this.hunger, 0, this.maxHunger);
        this.thirst = MathUtils.clamp(this.thirst, 0, this.maxThirst);
        
        // Dano por fome/sede
        if (this.hunger <= 0 || this.thirst <= 0) {
            this.takeDamage(1 * deltaTime);
        }
    }
    
    handleActions() {
        // Inventário
        if (input.isInventory()) {
            game.ui.toggleInventory();
        }
        
        // Ações touch já são processadas pelo input manager
    }
    
    // Ação de interagir
    interact(world) {
        // Verificar tiles próximos
        const tileX = Math.floor((this.x + this.width / 2) / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor((this.y + this.height / 2) / GAME_CONFIG.TILE_SIZE);
        
        // Verificar na facing direction
        let checkX = tileX;
        let checkY = tileY;
        
        switch (this.facing) {
            case 'up': checkY--; break;
            case 'down': checkY++; break;
            case 'left': checkX--; break;
            case 'right': checkX++; break;
        }
        
        const tile = world.getTile(checkX, checkY);
        
        if (tile && tile.interactable) {
            return this.interactWithTile(tile, checkX, checkY, world);
        }
        
        // Tentar colocar cabana no chão
        if (tile && !tile.solid && tile.type !== 'water') {
            const TS = GAME_CONFIG.TILE_SIZE;
            const overlap = this.x < (checkX + 1) * TS && this.x + this.width > checkX * TS &&
                            this.y < (checkY + 1) * TS && this.y + this.height > checkY * TS;
            if (!overlap && this.inventory.hasItem('cabin')) {
                const cabinIndex = this.inventory.slots.findIndex(s => s && s.id === 'cabin');
                this.inventory.removeItem(cabinIndex);
                world.setTile(checkX, checkY, { ...TILE_TYPES.CABIN });
                return { success: true, message: 'Cabana construída!' };
            }
            
            // Tentar colocar armadilha no chão
            if (this.inventory.hasItem('trap')) {
                const trapIndex = this.inventory.slots.findIndex(s => s && s.id === 'trap');
                this.inventory.removeItem(trapIndex);
                world.placeTrap(checkX, checkY);
                return { success: true, message: 'Armadilha armada!' };
            }
        }
        
        // Verificar entidades próximas
        return this.interactWithEntities(world);
    }
    
    interactWithTile(tile, x, y, world) {
        switch (tile.type) {
            case 'tree':
                // Cortar árvore
                if (this.hasTool('axe')) {
                    world.removeTile(x, y);
                    this.inventory.addItem(ITEMS.WOOD, MathUtils.randomInt(2, 4));
                    return { success: true, message: 'Cortou madeira!' };
                }
                return { success: false, message: 'Precisa de um machado!' };
                
            case 'rock':
                // Minerar pedra
                if (this.hasTool('pickaxe')) {
                    world.removeTile(x, y);
                    this.inventory.addItem(ITEMS.STONE, MathUtils.randomInt(2, 4));
                    return { success: true, message: 'Coletou pedra!' };
                }
                // Mão livre - coleta menos pedra
                world.removeTile(x, y);
                this.inventory.addItem(ITEMS.STONE, 1);
                return { success: true, message: 'Recolheu 1 pedra com as mãos.' };
                
            case 'berry_bush':
                // Colher frutas
                this.inventory.addItem(ITEMS.BERRY, MathUtils.randomInt(2, 5));
                return { success: true, message: 'Coletou frutas!' };
                
            case 'tall_grass':
                // Cortar grama alta para fibra
                world.removeTile(x, y);
                this.inventory.addItem(ITEMS.FIBER, MathUtils.randomInt(1, 3));
                return { success: true, message: 'Coletou fibra!' };
                
            case 'water':
                // Beber água do lago e/ou encher cantil
                const messages = [];
                if (this.thirst < this.maxThirst) {
                    const restored = Math.min(20, this.maxThirst - this.thirst);
                    this.thirst += restored;
                    messages.push('Bebeu água da lagoa!');
                }
                if (this.inventory.hasItem('water_bottle')) {
                    messages.push('Cantil cheio!');
                }
                if (messages.length > 0) {
                    return { success: true, message: messages.join(' ') };
                }
                return { success: false, message: 'Sede já está cheia!' };
                
            case 'prison':
                // Tentar abrir cela
                if (tile.locked && this.inventory.hasItem('key')) {
                    // Verificar se a chave é a correta
                    const keyItem = this.inventory.slots.find(s => s && s.id === 'key');
                    if (keyItem && (keyItem.prisonNumber === -1 || keyItem.prisonNumber === tile.prisonNumber)) {
                        tile.locked = false;
                        this.inventory.removeItem(this.inventory.slots.indexOf(keyItem));
                        return { success: true, message: 'Cela aberta!', child: tile.child };
                    }
                    return { success: false, message: 'Chave errada!' };
                } else if (!tile.locked && tile.child) {
                    // Resgatar criança
                    const child = tile.child;
                    this.children.push(child);
                    tile.child = null;
                    return { success: true, message: `Resgatou ${child.name}!`, rescued: child };
                }
                return { success: false, message: 'Cela trancada!' };
                
            case 'campfire':
                // Assar carne
                if (this.inventory.hasItem('meat')) {
                    this.inventory.removeItem(this.inventory.slots.findIndex(s => s && s.id === 'meat'));
                    this.inventory.addItem(ITEMS.COOKED_MEAT);
                    return { success: true, message: 'Assou a carne!' };
                }
                return { success: false, message: 'Nada para assar!' };
                
            case 'workbench':
                // Abrir crafting
                return { success: true, message: 'Bancada de trabalho!', crafting: true };
                
            case 'cabin':
                // Gerenciar cabana
                return { success: true, message: 'Cabana!', cabin: true, cabinX: x, cabinY: y };
                
            default:
                return null;
        }
    }
    
    interactWithEntities(world) {
        // Verificar crianças próximas
        for (const child of world.children) {
            const dist = MathUtils.distance(
                this.x + this.width / 2, this.y + this.height / 2,
                child.x, child.y
            );
            
            if (dist < 50 && !child.following) {
                child.following = true;
                this.childrenFollowing.push(child);
                return { success: true, message: `${child.name} está seguindo você!` };
            }
        }
        
        return null;
    }
    
    hasTool(toolType) {
        const item = this.inventory.getSelectedItem();
        return item && item.type === 'tool' && item.id.includes(toolType);
    }
    
    // Receber dano
    takeDamage(amount) {
        if (this.isInvincible) return;
        
        this.health -= amount;
        this.health = MathUtils.clamp(this.health, 0, this.maxHealth);
        
        if (amount >= 5) { // Só ficar invencível com dano significativo
            this.isInvincible = true;
            this.invincibleTimer = 0.5;
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    // Curar
    heal(amount) {
        this.health = MathUtils.clamp(this.health + amount, 0, this.maxHealth);
    }
    
    // Morrer
    die() {
        game.gameOver('Você morreu!');
    }
    
    // Atacar
    attack(world) {
        if (this.attackCooldown > 0) return;
        
        this.attackCooldown = 0.5; // 0.5 segundos entre ataques
        
        let damage = 5; // Dano básico (soco)
        
        if (this.equippedItem) {
            damage = this.equippedItem.damage || 10;
        }
        
        // Calcular área de ataque
        const attackX = this.x + this.width / 2;
        const attackY = this.y + this.height / 2;
        
        switch (this.facing) {
            case 'up': attackY -= this.attackRange; break;
            case 'down': attackY += this.attackRange; break;
            case 'left': attackX -= this.attackRange; break;
            case 'right': attackX += this.attackRange; break;
        }
        
        // Verificar acerto em entidades
        for (const enemy of world.enemies) {
            const dist = MathUtils.distance(attackX, attackY, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            if (dist < 30) {
                enemy.takeDamage(damage);
                return { hit: true, target: enemy };
            }
        }
        
        return { hit: false };
    }
    
    // Obter posição central
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    // Renderizar
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Efeito de piscar quando invencível
        if (this.isInvincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }
        
        ctx.save();
        
        // Corpo do jogador
        ctx.fillStyle = '#4a90d9';
        ctx.fillRect(screenX + 4, screenY + 8, this.width - 8, this.height - 8);
        
        // Cabeça
        ctx.fillStyle = '#fdbcb4';
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, screenY + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Olhos baseado na direção
        ctx.fillStyle = '#000';
        const eyeOffsetX = this.facing === 'left' ? -3 : this.facing === 'right' ? 3 : 0;
        const eyeOffsetY = this.facing === 'up' ? -2 : this.facing === 'down' ? 2 : 0;
        
        ctx.fillRect(screenX + this.width / 2 - 4 + eyeOffsetX, screenY + 6 + eyeOffsetY, 2, 2);
        ctx.fillRect(screenX + this.width / 2 + 2 + eyeOffsetX, screenY + 6 + eyeOffsetY, 2, 2);
        
        // Indicador de direção
        ctx.fillStyle = '#fff';
        const indicatorSize = 4;
        let ix = screenX + this.width / 2;
        let iy = screenY + this.height / 2;
        
        switch (this.facing) {
            case 'up': iy -= 20; break;
            case 'down': iy += 20; break;
            case 'left': ix -= 20; break;
            case 'right': ix += 20; break;
        }
        
        ctx.beginPath();
        ctx.arc(ix, iy, indicatorSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
