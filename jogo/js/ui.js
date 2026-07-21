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
        
        // Pausa
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
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
        
        // Mudar cor se baixo
        if (percentage < 25) {
            this.statusBars[type].style.backgroundColor = '#dc2626';
        } else if (percentage < 50) {
            this.statusBars[type].style.backgroundColor = '#f97316';
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
        } else {
            document.getElementById('item-name').textContent = 'Vazio';
            document.getElementById('item-description').textContent = '';
            document.getElementById('use-item-btn').classList.add('hidden');
        }
        
        this.updateInventoryGrid();
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
        
        // Renderizar crianças (pontos rosa)
        ctx.fillStyle = '#f472b6';
        for (const child of world.children) {
            const cx = centerX + (child.x / GAME_CONFIG.TILE_SIZE - playerTileX) * scale;
            const cy = centerY + (child.y / GAME_CONFIG.TILE_SIZE - playerTileY) * scale;
            
            if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                ctx.fillRect(cx - 2, cy - 2, 4, 4);
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
        } else {
            this.inventoryScreen.classList.add('hidden');
            this.updateTouchControlsVisibility(true);
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
