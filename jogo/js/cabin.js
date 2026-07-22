/**
 * CabinUI - Sistema de gerenciamento de cabanas
 */

class CabinUI {
    constructor() {
        this.isOpen = false;
        this.currentCabinX = 0;
        this.currentCabinY = 0;
        this.selectedInventorySlot = -1;
        
        document.getElementById('close-cabin-btn').addEventListener('click', () => {
            this.close();
        });
    }
    
    open(cabinX, cabinY) {
        this.isOpen = true;
        this.currentCabinX = cabinX;
        this.currentCabinY = cabinY;
        this.selectedInventorySlot = -1;
        
        document.getElementById('cabin-screen').classList.remove('hidden');
        this.render();
        
        if (game && game.ui) {
            game.ui.updateTouchControlsVisibility(false);
        }
    }
    
    close() {
        this.isOpen = false;
        document.getElementById('cabin-screen').classList.add('hidden');
        
        if (game && game.ui) {
            game.ui.updateTouchControlsVisibility(true);
        }
    }
    
    render() {
        if (!game || !game.player || !game.world) return;
        
        this.renderStorage();
        this.renderChildrenInCabin();
        this.renderChildrenFollowing();
        this.renderPlayerInventory();
    }
    
    renderStorage() {
        const container = document.getElementById('cabin-storage-list');
        if (!container) return;
        
        const storage = game.world.getCabinStorage(this.currentCabinX, this.currentCabinY);
        container.innerHTML = '';
        
        if (storage.length === 0) {
            container.innerHTML = '<p class="cabin-empty">Vazio</p>';
            return;
        }
        
        storage.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cabin-item';
            div.innerHTML = `
                <span class="cabin-item-name">${item.name} ${item.quantity > 1 ? 'x' + item.quantity : ''}</span>
                <button class="cabin-item-btn withdraw" data-index="${index}">Retirar</button>
            `;
            container.appendChild(div);
        });
        
        container.querySelectorAll('.withdraw').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.withdrawItem(index);
            });
        });
    }
    
    renderChildrenInCabin() {
        const container = document.getElementById('cabin-children-list');
        if (!container) return;
        
        const childIds = game.world.getCabinChildren(this.currentCabinX, this.currentCabinY);
        container.innerHTML = '';
        
        if (childIds.length === 0) {
            container.innerHTML = '<p class="cabin-empty">Nenhuma criança</p>';
            return;
        }
        
        for (const childId of childIds) {
            const child = game.world.children.find(c => c.id === childId);
            if (!child) continue;
            
            const div = document.createElement('div');
            div.className = 'cabin-child';
            div.innerHTML = `
                <span class="child-name">👧 ${child.name}</span>
                <span class="child-status">🍖${Math.round(child.hunger)} 💧${Math.round(child.thirst)}</span>
                <button class="cabin-item-btn call-child" data-id="${childId}">Chamar</button>
            `;
            container.appendChild(div);
        }
        
        container.querySelectorAll('.call-child').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.callChildFromCabin(id);
            });
        });
    }
    
    renderChildrenFollowing() {
        const container = document.getElementById('cabin-following-list');
        if (!container) return;
        
        const childIds = game.world.getCabinChildren(this.currentCabinX, this.currentCabinY);
        const following = game.player.children.filter(c => c.following && !childIds.includes(c.id));
        container.innerHTML = '';
        
        if (following.length === 0) {
            container.innerHTML = '<p class="cabin-empty">Nenhuma criança seguindo</p>';
            return;
        }
        
        for (const child of following) {
            const div = document.createElement('div');
            div.className = 'cabin-child';
            div.innerHTML = `
                <span class="child-name">👧 ${child.name}</span>
                <span class="child-status">🍖${Math.round(child.hunger)} 💧${Math.round(child.thirst)}</span>
                <button class="cabin-item-btn send-child" data-id="${child.id}">Enviar</button>
            `;
            container.appendChild(div);
        }
        
        container.querySelectorAll('.send-child').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.sendChildToCabin(id);
            });
        });
    }
    
    renderPlayerInventory() {
        const container = document.getElementById('cabin-inventory-list');
        if (!container) return;
        
        const inventory = game.player.inventory;
        container.innerHTML = '';
        
        inventory.slots.forEach((item, index) => {
            if (!item) return;
            
            const div = document.createElement('div');
            div.className = 'cabin-item';
            div.innerHTML = `
                <span class="cabin-item-name">${item.name} ${item.quantity > 1 ? 'x' + item.quantity : ''}</span>
                <button class="cabin-item-btn deposit" data-index="${index}">Guardar</button>
            `;
            container.appendChild(div);
        });
        
        container.querySelectorAll('.deposit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.depositItem(index);
            });
        });
    }
    
    depositItem(inventorySlotIndex) {
        const item = game.player.inventory.slots[inventorySlotIndex];
        if (!item) return;
        
        const storage = game.world.getCabinStorage(this.currentCabinX, this.currentCabinY);
        
        // Tentar empilhar
        if (item.stackable) {
            const existing = storage.find(s => s.id === item.id);
            if (existing) {
                existing.quantity += item.quantity;
                game.player.inventory.removeItem(inventorySlotIndex);
                this.render();
                return;
            }
        }
        
        // Adicionar como novo slot
        storage.push({ ...item });
        game.player.inventory.removeItem(inventorySlotIndex);
        this.render();
    }
    
    withdrawItem(storageIndex) {
        const storage = game.world.getCabinStorage(this.currentCabinX, this.currentCabinY);
        const item = storage[storageIndex];
        if (!item) return;
        
        // Tentar adicionar ao inventário do jogador
        if (game.player.inventory.addItem(item, item.quantity)) {
            storage.splice(storageIndex, 1);
            this.render();
        } else {
            game.ui.showMessage('Inventário cheio!');
        }
    }
    
    sendChildToCabin(childId) {
        const child = game.world.children.find(c => c.id === childId);
        if (!child) return;
        
        // Remover de seguir
        child.following = false;
        game.player.childrenFollowing = game.player.childrenFollowing.filter(c => c.id !== childId);
        
        // Adicionar à cabana
        const cabinChildIds = game.world.getCabinChildren(this.currentCabinX, this.currentCabinY);
        cabinChildIds.push(childId);
        
        this.render();
        game.ui.showMessage(`${child.name} entrou na cabana!`);
    }
    
    callChildFromCabin(childId) {
        const child = game.world.children.find(c => c.id === childId);
        if (!child) return;
        
        // Remover da cabana
        const cabinChildIds = game.world.getCabinChildren(this.currentCabinX, this.currentCabinY);
        const idx = cabinChildIds.indexOf(childId);
        if (idx !== -1) cabinChildIds.splice(idx, 1);
        
        // Fazer seguir o jogador
        child.following = true;
        game.player.childrenFollowing.push(child);
        
        this.render();
        game.ui.showMessage(`${child.name} saiu da cabana!`);
    }
}
