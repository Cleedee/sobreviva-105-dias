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
        
        // Armadura/Equipamento
        this.equippedArmor = {
            hands: null, // luvas
            body: null   // casaco/armadura
        };
        
        // Frio da noite
        this.coldDamageTimer = 0;
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
        
        // Sons de passos
        if (this.isMoving) {
            audioManager.playFootstep();
        }
        
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
        
        // Dano de frio durante a noite
        if (game && game.timeManager && game.timeManager.isNight) {
            this.coldDamageTimer += deltaTime;
            if (this.coldDamageTimer >= 10) { // a cada 10 segundos
                this.coldDamageTimer = 0;
                let coldDamage = 2; // dano base de frio
                
                // Reduzir dano com casaco de veado
                if (this.equippedArmor.body && this.equippedArmor.body.coldResist) {
                    coldDamage *= (1 - this.equippedArmor.body.coldResist);
                }
                
                if (coldDamage > 0) {
                    this.takeDamage(coldDamage);
                    if (game && game.ui) {
                        game.ui.showMessage('🥶 Está frio...', 1.5);
                    }
                }
            }
        } else {
            this.coldDamageTimer = 0;
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
                    const bonus = this.getLootBonus();
                    const amount = MathUtils.randomInt(2, 4) + bonus;
                    this.inventory.addItem(ITEMS.WOOD, amount);
                    audioManager.playCollect();
                    return { success: true, message: bonus > 0 ? `Cortou ${amount} madeira! (+${bonus} bônus)` : 'Cortou madeira!' };
                }
                return { success: false, message: 'Precisa de um machado!' };
                
            case 'rock':
                // Minerar pedra
                if (this.hasTool('pickaxe')) {
                    world.removeTile(x, y);
                    const bonus = this.getLootBonus();
                    const amount = MathUtils.randomInt(2, 4) + bonus;
                    this.inventory.addItem(ITEMS.STONE, amount);
                    audioManager.playCollect();
                    return { success: true, message: bonus > 0 ? `Coletou ${amount} pedra! (+${bonus} bônus)` : 'Coletou pedra!' };
                }
                // Mão livre - coleta menos pedra
                world.removeTile(x, y);
                const bonusHand = this.getLootBonus();
                const amountHand = 1 + bonusHand;
                this.inventory.addItem(ITEMS.STONE, amountHand);
                audioManager.playCollect();
                return { success: true, message: bonusHand > 0 ? `Recolheu ${amountHand} pedra! (+${bonusHand} bônus)` : 'Recolheu 1 pedra com as mãos.' };
                
            case 'berry_bush':
                // Colher frutas
                const bonusBerry = this.getLootBonus();
                const amountBerry = MathUtils.randomInt(2, 5) + bonusBerry;
                this.inventory.addItem(ITEMS.BERRY, amountBerry);
                audioManager.playCollect();
                return { success: true, message: bonusBerry > 0 ? `Coletou ${amountBerry} frutas! (+${bonusBerry} bônus)` : 'Coletou frutas!' };
                
            case 'tall_grass':
                // Cortar grama alta para fibra
                world.removeTile(x, y);
                const bonusFiber = this.getLootBonus();
                const amountFiber = MathUtils.randomInt(1, 3) + bonusFiber;
                this.inventory.addItem(ITEMS.FIBER, amountFiber);
                audioManager.playCollect();
                return { success: true, message: bonusFiber > 0 ? `Coletou ${amountFiber} fibra! (+${bonusFiber} bônus)` : 'Coletou fibra!' };
                
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
                    audioManager.playDrink();
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
                
            case 'fence':
                // Verificar estado da cerca
                const fence = game.world.getFence(x, y);
                if (fence) {
                    const pct = Math.round((fence.durability / fence.maxDurability) * 100);
                    let status = '';
                    if (pct > 75) status = '🟢 Íntegra';
                    else if (pct > 50) status = '🟡 Levemente danificada';
                    else if (pct > 25) status = '🟠 Muito danificada';
                    else status = '🔴 Quase destruída';
                    return { success: true, message: `Cerca: ${status} (${pct}%)` };
                }
                return { success: false, message: 'Nenhuma cerca aqui' };
                
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
                audioManager.playChildRescue();
                return { success: true, message: `${child.name} está seguindo você!` };
            }
        }
        
        return null;
    }
    
    hasTool(toolType) {
        const item = this.inventory.getSelectedItem();
        return item && item.type === 'tool' && item.id.includes(toolType);
    }
    
    // Obter bônus de loot das luvas
    getLootBonus() {
        if (this.equippedArmor.hands && this.equippedArmor.hands.bonusLoot) {
            return this.equippedArmor.hands.bonusLoot;
        }
        return 0;
    }
    
    // Receber dano
    takeDamage(amount) {
        if (this.isInvincible) return;
        
        // Reduzir dano com armadura de javali
        if (this.equippedArmor.body && this.equippedArmor.body.damageReduction) {
            amount *= (1 - this.equippedArmor.body.damageReduction);
        }
        
        this.health -= amount;
        this.health = MathUtils.clamp(this.health, 0, this.maxHealth);
        audioManager.playDamage();
        
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
        audioManager.playAttack();
        
        let damage = 5; // Dano básico (soco)
        
        if (this.equippedItem) {
            damage = this.equippedItem.damage || 10;
        }
        
        // Calcular área de ataque
        let attackX = this.x + this.width / 2;
        let attackY = this.y + this.height / 2;
        
        switch (this.facing) {
            case 'up': attackY -= this.attackRange; break;
            case 'down': attackY += this.attackRange; break;
            case 'left': attackX -= this.attackRange; break;
            case 'right': attackX += this.attackRange; break;
        }
        
        // Verificar acerto em inimigos
        for (const enemy of world.enemies) {
            const dist = MathUtils.distance(attackX, attackY, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            if (dist < 30) {
                enemy.takeDamage(damage);
                audioManager.playHit();
                return { hit: true, target: enemy };
            }
        }
        
        // Verificar acerto em animais
        for (const animal of world.animals) {
            if (!animal.isAlive) continue;
            const dist = MathUtils.distance(attackX, attackY, animal.x + animal.width / 2, animal.y + animal.height / 2);
            if (dist < 30) {
                animal.takeDamage(damage);
                audioManager.playHit();
                
                // Se animal morreu, dropar itens
                if (!animal.isAlive) {
                    world.dropAnimalItems(animal, this);
                }
                return { hit: true, target: animal };
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
