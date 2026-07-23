/**
 * UI - Interface do Usuário
 */

class GameUI {
    constructor() {
        // Elementos do DOM
        this.gameUI = document.getElementById('game-ui');
        this.statusBars = {
            health: document.getElementById('health-bar'),
            hunger: document.getElementById('hunger-bar'),
            thirst: document.getElementById('thirst-bar')
        };
        this.statusValues = {
            health: document.getElementById('health-value'),
            hunger: document.getElementById('hunger-value'),
            thirst: document.getElementById('thirst-value')
        };
        this.dayCounter = document.getElementById('day-counter');
        this.timeIcon = document.getElementById('time-icon');
        this.nightCounter = document.getElementById('night-counter');
        this.childrenCount = document.getElementById('children-count');
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
        
        // Inventário
        this.inventoryScreen = document.getElementById('inventory-screen');
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.quickSlots = document.querySelectorAll('.inventory-slot');
        
        // Pause
        this.pauseMenu = document.getElementById('pause-menu');
        
        // Estado
        this.inventoryOpen = false;
        this.pauseOpen = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Fechar inventário
        document.getElementById('close-inventory-btn').addEventListener('click', () => {
            this.toggleInventory();
        });
        
        // Fechar inventário (botão X)
        document.getElementById('close-inventory-x').addEventListener('click', () => {
            this.toggleInventory();
        });
        
        // Usar item
        document.getElementById('use-item-btn').addEventListener('click', () => {
            this.useSelectedItem();
        });
        
        // Pausa
        document.getElementById('resume-btn').addEventListener('click', () => {
            if (game) game.togglePause();
        });
        
        // Ajuda
        document.getElementById('help-btn').addEventListener('click', () => {
            this.toggleHelp();
        });
        document.getElementById('close-help-x').addEventListener('click', () => {
            this.toggleHelp();
        });
        document.getElementById('close-help-btn').addEventListener('click', () => {
            this.toggleHelp();
        });
        
        // Slots rápidos
        this.quickSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                if (game && game.player) {
                    game.player.inventory.selectedSlot = index;
                    this.updateQuickSlots();
                }
            });
        });
    }
    
    update(player, timeManager) {
        // Atualizar barras de status
        this.updateStatusBar('health', player.health, player.maxHealth);
        this.updateStatusBar('hunger', player.hunger, player.maxHunger);
        this.updateStatusBar('thirst', player.thirst, player.maxThirst);
        
        // Atualizar tempo
        this.dayCounter.textContent = `Dia: ${timeManager.day}`;
        this.timeIcon.textContent = timeManager.getIcon();
        this.nightCounter.textContent = `Noites: ${timeManager.totalNights}`;
        
        // Atualizar crianças
        this.childrenCount.textContent = player.children.length;
        
        // Atualizar slots rápidos
        this.updateQuickSlots();
        
        // Atualizar inventário se aberto
        if (this.inventoryOpen) {
            this.updateInventoryGrid();
        }
        
        // Atualizar minimapa
        this.updateMinimap(player, game.world);
    }
    
    updateStatusBar(type, value, maxValue) {
        const percentage = (value / maxValue) * 100;
        this.statusBars[type].style.width = `${percentage}%`;
        this.statusValues[type].textContent = Math.ceil(value);
        
        // Resetar cor base conforme tipo
        const coresBase = { health: '#ef4444', hunger: '#f97316', thirst: '#3b82f6' };
        const bar = this.statusBars[type];
        
        if (percentage < 25) {
            bar.style.backgroundColor = '#dc2626';
        } else if (percentage < 50) {
            bar.style.backgroundColor = coresBase[type] === '#ef4444' ? '#dc2626' : '#f59e0b';
        } else {
            bar.style.backgroundColor = coresBase[type];
        }
    }
    
    updateQuickSlots() {
        if (!game || !game.player) return;
        
        const inventory = game.player.inventory;
        
        this.quickSlots.forEach((slot, index) => {
            const item = inventory.slots[index];
            slot.innerHTML = '';
            
            if (item) {
                const icon = item.name.split(' ')[0]; // Pegar emoji
                slot.textContent = icon;
                slot.title = item.name;
                
                if (index === inventory.selectedSlot) {
                    slot.classList.add('selected');
                } else {
                    slot.classList.remove('selected');
                }
                
                // Quantidade
                if (item.quantity > 1) {
                    const qty = document.createElement('span');
                    qty.className = 'quantity';
                    qty.textContent = item.quantity;
                    qty.style.position = 'absolute';
                    qty.style.bottom = '2px';
                    qty.style.right = '4px';
                    qty.style.fontSize = '10px';
                    qty.style.color = '#fff';
                    slot.style.position = 'relative';
                    slot.appendChild(qty);
                }
            } else {
                slot.classList.remove('selected');
            }
        });
    }
    
    updateInventoryGrid() {
        if (!game || !game.player) return;
        
        const inventory = game.player.inventory;
        this.inventoryGrid.innerHTML = '';
        
        inventory.slots.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = index;
            
            if (item) {
                slot.textContent = item.name.split(' ')[0];
                slot.title = `${item.name} x${item.quantity}`;
                
                if (index === inventory.selectedSlot) {
                    slot.classList.add('selected');
                }
            }
            
            slot.addEventListener('click', () => this.onInventorySlotClick(index));
            this.inventoryGrid.appendChild(slot);
        });
    }
    
    onInventorySlotClick(index) {
        if (!game || !game.player) return;
        
        const inventory = game.player.inventory;
        const item = inventory.slots[index];
        
        inventory.selectedSlot = index;
        
        if (item) {
            document.getElementById('item-name').textContent = item.name;
            document.getElementById('item-description').textContent = item.description;
            document.getElementById('use-item-btn').classList.remove('hidden');
            this.updateUseButtonLabel(item);
        } else {
            document.getElementById('item-name').textContent = 'Vazio';
            document.getElementById('item-description').textContent = '';
            document.getElementById('use-item-btn').classList.add('hidden');
        }
        
        this.updateInventoryGrid();
    }
    
    updateUseButtonLabel(item) {
        const btn = document.getElementById('use-item-btn');
        if (!item) { btn.textContent = 'Usar'; return; }
        
        switch (item.id) {
            case 'trap': btn.textContent = '🪤 Colocar'; break;
            case 'cabin': btn.textContent = '🏠 Construir'; break;
            case 'fence': btn.textContent = '🚧 Colocar'; break;
            case 'key': btn.textContent = '🔑 Info'; break;
            case 'wooden_spear':
            case 'stone_sword':
            case 'axe':
            case 'pickaxe':
            case 'bow':
            case 'rabbit_gloves':
            case 'deer_coat':
            case 'boar_armor': btn.textContent = '⚔️ Equipar'; break;
            default: btn.textContent = 'Usar';
        }
    }
    
    useSelectedItem() {
        if (!game || !game.player) return;
        
        const inventory = game.player.inventory;
        const item = inventory.slots[inventory.selectedSlot];
        if (!item) return;
        
        // Itens de construção: fechar inventário e colocar no mundo
        if (item.id === 'trap' || item.id === 'cabin' || item.id === 'fence' || item.id === 'campfire_item') {
            this.toggleInventory();
            
            // Calcular tile na facing direction
            const player = game.player;
            const tileX = Math.floor((player.x + player.width / 2) / GAME_CONFIG.TILE_SIZE);
            const tileY = Math.floor((player.y + player.height / 2) / GAME_CONFIG.TILE_SIZE);
            
            let checkX = tileX;
            let checkY = tileY;
            switch (player.facing) {
                case 'up': checkY--; break;
                case 'down': checkY++; break;
                case 'left': checkX--; break;
                case 'right': checkX++; break;
            }
            
            const tile = game.world.getTile(checkX, checkY);
            const TS = GAME_CONFIG.TILE_SIZE;
            const overlap = game.player.x < (checkX + 1) * TS && game.player.x + game.player.width > checkX * TS &&
                            game.player.y < (checkY + 1) * TS && game.player.y + game.player.height > checkY * TS;
            
            if (tile && !tile.solid && tile.type !== 'water' && !overlap) {
                const slotIndex = inventory.selectedSlot;
                inventory.removeItem(slotIndex);
                
                if (item.id === 'trap') {
                    game.world.placeTrap(checkX, checkY);
                    audioManager.playPlace();
                    this.showMessage('Armadilha armada!');
                } else if (item.id === 'cabin') {
                    game.world.setTile(checkX, checkY, { ...TILE_TYPES.CABIN });
                    audioManager.playPlace();
                    this.showMessage('Cabana construída!');
                } else if (item.id === 'fence') {
                    game.world.setTile(checkX, checkY, {
                        id: 43, name: 'Cerca', solid: true, color: '#8B6914',
                        interactable: true, type: 'fence'
                    });
                    game.world.placeFence(checkX, checkY, 100);
                    audioManager.playPlace();
                    this.showMessage('Cerca colocada!');
                } else if (item.id === 'campfire_item') {
                    game.world.setTile(checkX, checkY, { ...TILE_TYPES.CAMPFIRE });
                    audioManager.playPlace();
                    this.showMessage('Fogueira acesa!');
                }
            } else {
                this.showMessage('Não é possível colocar aqui!');
            }
            return;
        }
        
        // Comida e bebida: consumir
        if (item.type === 'food' || item.type === 'drink') {
            const result = inventory.useItem(inventory.selectedSlot);
            if (result) {
                let msg = '';
                if (result.type === 'hunger') {
                    game.player.hunger = Math.min(game.player.hunger + result.amount, game.player.maxHunger);
                    msg = `Comeu ${item.name}! (+${result.amount} fome)`;
                    audioManager.playEat();
                } else if (result.type === 'thirst') {
                    game.player.thirst = Math.min(game.player.thirst + result.amount, game.player.maxThirst);
                    msg = `Bebeu ${item.name}! (+${result.amount} sede)`;
                    audioManager.playDrink();
                }
                if (result.healthRestore && result.healthRestore > 0) {
                    game.player.heal(result.healthRestore);
                    msg += ` (+${result.healthRestore} vida)`;
                }
                this.showMessage(msg);
            }
            this.updateInventoryGrid();
            this.onInventorySlotClick(inventory.selectedSlot);
            return;
        }
        
        // Armas e ferramentas: equipar
        if (item.type === 'weapon' || item.type === 'tool') {
            game.player.equippedItem = item;
            this.showMessage(`Equipou ${item.name}!`);
            this.updateInventoryGrid();
            return;
        }
        
        // Armaduras: equipar
        if (item.type === 'armor') {
            game.player.equippedArmor[item.slot] = item;
            inventory.removeItem(inventory.selectedSlot);
            this.showMessage(`Equipou ${item.name}!`);
            this.updateInventoryGrid();
            this.onInventorySlotClick(inventory.selectedSlot);
            return;
        }
        
        // Móveis: colocar na cabana
        if (item.type === 'furniture') {
            this.toggleInventory();
            this.showMessage(`${item.name} será colocado na próxima cabana interagida.`);
            // TODO: Implementar colocação de móveis
            return;
        }
        
        // Mochilas: expandir inventário
        if (item.type === 'bag') {
            inventory.expand(item.extraSlots);
            inventory.removeItem(inventory.selectedSlot);
            this.showMessage(`Mochila usada! +${item.extraSlots} slots`);
            this.updateInventoryGrid();
            this.onInventorySlotClick(inventory.selectedSlot);
            return;
        }
    }
    
    updateMinimap(player, world) {
        const ctx = this.minimapCtx;
        const width = this.minimap.width;
        const height = this.minimap.height;
        const scale = 0.7;
        
        // Limpar
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Centro no jogador
        const centerX = width / 2;
        const centerY = height / 2;
        const playerTileX = player.x / GAME_CONFIG.TILE_SIZE;
        const playerTileY = player.y / GAME_CONFIG.TILE_SIZE;
        
        // Renderizar tiles ao redor
        const tileRange = Math.floor(40 * scale);
        
        for (let dy = -tileRange; dy <= tileRange; dy++) {
            for (let dx = -tileRange; dx <= tileRange; dx++) {
                const tileX = Math.floor(playerTileX + dx);
                const tileY = Math.floor(playerTileY + dy);
                
                if (world.inBounds(tileX, tileY)) {
                    const tile = world.getTile(tileX, tileY);
                    const screenX = centerX + dx * scale;
                    const screenY = centerY + dy * scale;
                    
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(screenX, screenY, scale + 0.5, scale + 0.5);
                }
            }
        }
        
        // Renderizar inimigos (pontos vermelhos)
        ctx.fillStyle = '#ef4444';
        for (const enemy of world.enemies) {
            if (enemy.isAlive) {
                const ex = centerX + (enemy.x / GAME_CONFIG.TILE_SIZE - playerTileX) * scale;
                const ey = centerY + (enemy.y / GAME_CONFIG.TILE_SIZE - playerTileY) * scale;
                
                if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                    ctx.fillRect(ex - 1, ey - 1, 2, 2);
                }
            }
        }
        
        // Renderizar animais (pontos marrom)
        ctx.fillStyle = '#8B4513';
        for (const animal of (world.animals || [])) {
            if (animal.isAlive) {
                const ax = centerX + (animal.x / GAME_CONFIG.TILE_SIZE - playerTileX) * scale;
                const ay = centerY + (animal.y / GAME_CONFIG.TILE_SIZE - playerTileY) * scale;
                
                if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                    ctx.fillRect(ax - 1, ay - 1, 2, 2);
                }
            }
        }
        
        // Renderizar crianças (pontos rosa)
        ctx.fillStyle = '#f472b6';
        for (const child of world.children) {
            const cx = centerX + (child.x / GAME_CONFIG.TILE_SIZE - playerTileX) * scale;
            const cy = centerY + (child.y / GAME_CONFIG.TILE_SIZE - playerTileY) * scale;
            
            if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                ctx.fillRect(cx - 2, cy - 2, 4, 4);
            }
        }
        
        // Renderizar chaves não coletadas (pontos dourados)
        ctx.fillStyle = '#FFD700';
        for (const key of (world.keys || [])) {
            if (key.collected) continue;
            const kx = centerX + (key.tileX - playerTileX) * scale;
            const ky = centerY + (key.tileY - playerTileY) * scale;
            
            if (kx >= 0 && kx < width && ky >= 0 && ky < height) {
                ctx.fillRect(kx - 2, ky - 2, 4, 4);
            }
        }
        
        // Renderizar celas trancadas (pontos cinza)
        ctx.fillStyle = '#9ca3af';
        for (let y = 0; y < world.height; y++) {
            for (let x = 0; x < world.width; x++) {
                const tile = world.getTile(x, y);
                if (tile && tile.type === 'prison' && tile.locked) {
                    const px = centerX + (x - playerTileX) * scale;
                    const py = centerY + (y - playerTileY) * scale;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        ctx.fillRect(px - 1, py - 1, 3, 3);
                    }
                }
            }
        }
        
        // Jogador (ponto branco)
        ctx.fillStyle = '#fff';
        ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
        
        // Borda
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
    }
    
    showInteractionPrompt(text) {
        this.interactionPrompt.innerHTML = text;
        this.interactionPrompt.classList.remove('hidden');
    }
    
    hideInteractionPrompt() {
        this.interactionPrompt.classList.add('hidden');
    }
    
    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        
        if (this.inventoryOpen) {
            this.inventoryScreen.classList.remove('hidden');
            this.updateInventoryGrid();
            this.updateTouchControlsVisibility(false);
            audioManager.playOpen();
        } else {
            this.inventoryScreen.classList.add('hidden');
            this.updateTouchControlsVisibility(true);
            audioManager.playClose();
        }
    }
    
    togglePause() {
        this.pauseOpen = !this.pauseOpen;
        
        if (this.pauseOpen) {
            this.pauseMenu.classList.remove('hidden');
            this.updateTouchControlsVisibility(false);
        } else {
            this.pauseMenu.classList.add('hidden');
            this.updateTouchControlsVisibility(true);
        }
    }
    
    toggleHelp() {
        const helpScreen = document.getElementById('help-screen');
        if (helpScreen.classList.contains('hidden')) {
            helpScreen.classList.remove('hidden');
            this.updateTouchControlsVisibility(false);
        } else {
            helpScreen.classList.add('hidden');
            this.updateTouchControlsVisibility(true);
        }
    }
    
    updateTouchControlsVisibility(visible) {
        const touchControlsEl = document.getElementById('touch-controls');
        if (touchControlsEl) {
            if (visible) {
                touchControlsEl.style.display = 'block';
            } else {
                touchControlsEl.style.display = 'none';
            }
        }
    }
    
    showMessage(text, duration = 3) {
        // Criar mensagem temporária
        const msg = document.createElement('div');
        msg.className = 'game-message';
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.5rem;
            z-index: 200;
            animation: fadeOut ${duration}s forwards;
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, duration * 1000);
    }
}
