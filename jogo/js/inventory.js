/**
 * Inventory - Sistema de inventário e itens
 */

// Definição de itens do jogo
const ITEMS = {
    // Ferramentas
    AXE: {
        id: 'axe',
        name: '🪓 Machado',
        description: 'Usado para cortar árvores e defender.',
        type: 'tool',
        stackable: false,
        damage: 15,
        durability: 100
    },
    PICKAXE: {
        id: 'pickaxe',
        name: '⛏️ Picareta',
        description: 'Usado para minerar pedras.',
        type: 'tool',
        stackable: false,
        damage: 10,
        durability: 80
    },
    FISHING_ROD: {
        id: 'fishing_rod',
        name: '🎣 Vara de Pescar',
        description: 'Usado para pescar em rios.',
        type: 'tool',
        stackable: false,
        durability: 60
    },
    
    // Armas
    WOODEN_SPEAR: {
        id: 'wooden_spear',
        name: '🗡️ Lança de Madeira',
        description: 'Uma arma básica de defesa.',
        type: 'weapon',
        stackable: false,
        damage: 20,
        durability: 50
    },
    STONE_SWORD: {
        id: 'stone_sword',
        name: '⚔️ Espada de Pedra',
        description: 'Uma arma mais resistente.',
        type: 'weapon',
        stackable: false,
        damage: 30,
        durability: 80
    },
    BOW: {
        id: 'bow',
        name: '🏹 Arco e Flecha',
        description: 'Arma à distância para caça.',
        type: 'weapon',
        stackable: false,
        damage: 25,
        durability: 60,
        range: 150 // alcance especial
    },
    
    // Recursos de Caça
    RABBIT_MEAT: {
        id: 'rabbit_meat',
        name: '🐇 Carne de Coelho',
        description: 'Restaura 10 de fome. Leve e rápido de cozinhar.',
        type: 'food',
        stackable: true,
        maxStack: 20,
        hungerRestore: 10
    },
    DEER_MEAT: {
        id: 'deer_meat',
        name: '🦌 Carne de Veado',
        description: 'Restaura 20 de fome. Saborosa.',
        type: 'food',
        stackable: true,
        maxStack: 15,
        hungerRestore: 20
    },
    BOAR_MEAT: {
        id: 'boar_meat',
        name: '🐗 Carne de Javali',
        description: 'Restaura 25 de fome. Pesada mas nutritiva.',
        type: 'food',
        stackable: true,
        maxStack: 10,
        hungerRestore: 25
    },
    RABBIT_PELT: {
        id: 'rabbit_pelt',
        name: '🐇 Pele de Coelho',
        description: 'Pele macia. Pode ser usada para artesanato.',
        type: 'resource',
        stackable: true,
        maxStack: 30
    },
    DEER_PELT: {
        id: 'deer_pelt',
        name: '🦌 Pele de Veado',
        description: 'Pele resistente. Útil para roupas.',
        type: 'resource',
        stackable: true,
        maxStack: 20
    },
    BOAR_PELT: {
        id: 'boar_pelt',
        name: '🐗 Pele de Javali',
        description: 'Pele grossa. Excelente para proteção.',
        type: 'resource',
        stackable: true,
        maxStack: 15
    },
    
    // Recursos
    WOOD: {
        id: 'wood',
        name: '🪵 Madeira',
        description: 'Material básico para construir.',
        type: 'resource',
        stackable: true,
        maxStack: 50
    },
    STONE: {
        id: 'stone',
        name: '🪨 Pedra',
        description: 'Material para ferramentas.',
        type: 'resource',
        stackable: true,
        maxStack: 50
    },
    FIBER: {
        id: 'fiber',
        name: '🌿 Fibra',
        description: 'Cordas e tecidos.',
        type: 'resource',
        stackable: true,
        maxStack: 50
    },
    
    // Comida
    APPLE: {
        id: 'apple',
        name: '🍎 Maçã',
        description: 'Restaura 15 de fome e 5 de vida.',
        type: 'food',
        stackable: true,
        maxStack: 20,
        hungerRestore: 15,
        healthRestore: 5
    },
    BERRY: {
        id: 'berry',
        name: '🫐 Frutas Silvestres',
        description: 'Restaura 10 de fome e 3 de vida.',
        type: 'food',
        stackable: true,
        maxStack: 30,
        hungerRestore: 10,
        healthRestore: 3
    },
    MEAT: {
        id: 'meat',
        name: '🥩 Carne',
        description: 'Restaura 15 de fome. Assada restaura mais.',
        type: 'food',
        stackable: true,
        maxStack: 10,
        hungerRestore: 15
    },
    COOKED_MEAT: {
        id: 'cooked_meat',
        name: '🍖 Carne Assada',
        description: 'Restaura 30 de fome e 15 de vida.',
        type: 'food',
        stackable: true,
        maxStack: 10,
        hungerRestore: 30,
        healthRestore: 15
    },
    
    // Água
    WATER_BOTTLE: {
        id: 'water_bottle',
        name: '🫗 Cantil com Água',
        description: 'Restaura 25 de sede.',
        type: 'drink',
        stackable: true,
        maxStack: 5,
        thirstRestore: 25
    },
    COCONUT: {
        id: 'coconut',
        name: '🥥 Coqueiro',
        description: 'Restaura 20 de sede.',
        type: 'drink',
        stackable: true,
        maxStack: 10,
        thirstRestore: 20
    },
    
    // Mochilas
    SMALL_BAG: {
        id: 'small_bag',
        name: '👜 Bolsa Pequena',
        description: 'Adiciona 5 slots ao inventário.',
        type: 'bag',
        stackable: false,
        extraSlots: 5
    },
    MEDIUM_BAG: {
        id: 'medium_bag',
        name: '🎒 Mochila Média',
        description: 'Adiciona 10 slots ao inventário.',
        type: 'bag',
        stackable: false,
        extraSlots: 10
    },
    
    // Chaves
    KEY: {
        id: 'key',
        name: '🔑 Chave',
        description: 'Abre uma cela.',
        type: 'key',
        stackable: true,
        maxStack: 6,
        prisonNumber: -1 // será definido ao ser coletada
    },
    
    // Especiais
    FAIRY_DUST: {
        id: 'fairy_dust',
        name: '✨ Pó de Fada',
        description: 'Dádiva de uma fada. Tem poderes mágicos.',
        type: 'special',
        stackable: true,
        maxStack: 10
    },
    WOLF_PELT: {
        id: 'wolf_pelt',
        name: '🐺 Pele de Lobo',
        description: 'Pode ser usada para制作 roupas.',
        type: 'resource',
        stackable: true,
        maxStack: 20
    },
    BEAR_PELT: {
        id: 'bear_pelt',
        name: '🐻 Pele de Urso',
        description: 'Pode ser usada para制作 roupas quentes.',
        type: 'resource',
        stackable: true,
        maxStack: 10
    },
    
    // Construções
    CABIN: {
        id: 'cabin',
        name: '🏠 Cabana',
        description: 'Abrigo para crianças estorage de itens. Coloque no chão.',
        type: 'building',
        stackable: false
    }
};

class Inventory {
    constructor(size = GAME_CONFIG.INVENTORY_SIZE) {
        this.size = size;
        this.slots = new Array(size).fill(null);
        this.selectedSlot = 0;
    }
    
    // Adicionar item
    addItem(itemData, quantity = 1) {
        const item = { ...itemData };
        
        // Se empilhável, tentar adicionar a slot existente
        if (item.stackable) {
            for (let i = 0; i < this.slots.length; i++) {
                if (this.slots[i] && this.slots[i].id === item.id) {
                    const canAdd = Math.min(quantity, item.maxStack - this.slots[i].quantity);
                    this.slots[i].quantity += canAdd;
                    quantity -= canAdd;
                    
                    if (quantity <= 0) return true;
                }
            }
        }
        
        // Encontrar slot vazio
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = {
                    ...item,
                    quantity: item.stackable ? quantity : 1,
                    durability: item.durability || null
                };
                quantity--;
                
                if (!item.stackable || quantity <= 0) return true;
            }
        }
        
        // Inventário cheio
        return false;
    }
    
    // Remover item
    removeItem(slotIndex, quantity = 1) {
        if (!this.slots[slotIndex]) return false;
        
        this.slots[slotIndex].quantity -= quantity;
        
        if (this.slots[slotIndex].quantity <= 0) {
            this.slots[slotIndex] = null;
        }
        
        return true;
    }
    
    // Usar item
    useItem(slotIndex) {
        const item = this.slots[slotIndex];
        if (!item) return null;
        
        switch (item.type) {
            case 'food':
                this.removeItem(slotIndex);
                return { type: 'hunger', amount: item.hungerRestore, healthRestore: item.healthRestore || 0 };
                
            case 'drink':
                this.removeItem(slotIndex);
                return { type: 'thirst', amount: item.thirstRestore };
                
            case 'weapon':
            case 'tool':
                // Equipar (por agora apenas retorna info)
                return { type: 'equip', item: item };
                
            case 'key':
                // Chave não pode ser usada diretamente
                return { type: 'key_info', item: item, message: `Abre a cela #${item.prisonNumber}` };
                
            default:
                return null;
        }
    }
    
    // Obter item selecionado
    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }
    
    // Verificar se tem item
    hasItem(itemId, quantity = 1) {
        let total = 0;
        for (const slot of this.slots) {
            if (slot && slot.id === itemId) {
                total += slot.quantity;
            }
        }
        return total >= quantity;
    }
    
    // Contar itens
    countItem(itemId) {
        let total = 0;
        for (const slot of this.slots) {
            if (slot && slot.id === itemId) {
                total += slot.quantity;
            }
        }
        return total;
    }
    
    // Expandir inventário
    expand(extraSlots) {
        const newSize = this.size + extraSlots;
        const newSlots = new Array(extraSlots).fill(null);
        this.slots = [...this.slots, ...newSlots];
        this.size = newSize;
    }
    
    // Inventário está cheio?
    isFull() {
        return this.slots.every(slot => slot !== null);
    }
    
    // Slots vazios
    emptySlots() {
        return this.slots.filter(slot => slot === null).length;
    }
}
