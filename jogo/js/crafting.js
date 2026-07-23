/**
 * Crafting - Sistema de crafting e receitas
 */

// Definição de receitas de crafting
const RECIPES = [
    {
        id: 'wooden_spear',
        name: '🗡️ Lança de Madeira',
        description: 'Uma arma básica de defesa.',
        result: { ...ITEMS.WOODEN_SPEAR },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'wood', quantity: 2, name: '🪵 Madeira' },
            { itemId: 'fiber', quantity: 1, name: '🌿 Fibra' }
        ]
    },
    {
        id: 'pickaxe',
        name: '⛏️ Picareta',
        description: 'Usado para minerar pedras.',
        result: { ...ITEMS.PICKAXE },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'wood', quantity: 2, name: '🪵 Madeira' },
            { itemId: 'stone', quantity: 2, name: '🪨 Pedra' }
        ]
    },
    {
        id: 'small_bag',
        name: '👜 Bolsa Pequena',
        description: 'Adiciona 5 slots ao inventário.',
        result: { ...ITEMS.SMALL_BAG },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'fiber', quantity: 3, name: '🌿 Fibra' }
        ]
    },
    {
        id: 'fence',
        name: '🚧 Cerca',
        description: 'Proteção básica contra inimigos.',
        result: {
            id: 'fence',
            name: '🚧 Cerca',
            description: 'Pode ser colocada para proteger o campamento.',
            type: 'building',
            stackable: true,
            maxStack: 10
        },
        resultQuantity: 2,
        ingredients: [
            { itemId: 'wood', quantity: 3, name: '🪵 Madeira' }
        ]
    },
    {
        id: 'trap',
        name: '🪤 Armadilha',
        description: 'Captura ou machuca inimigos.',
        result: {
            id: 'trap',
            name: '🪤 Armadilha',
            description: 'Coloque no chão para armadilhar inimigos.',
            type: 'building',
            stackable: true,
            maxStack: 5
        },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'wood', quantity: 2, name: '🪵 Madeira' },
            { itemId: 'stone', quantity: 1, name: '🪨 Pedra' }
        ]
    },
    {
        id: 'cooked_meat',
        name: '🍖 Carne Assada',
        description: 'Restaura 30 de fome.',
        result: { ...ITEMS.COOKED_MEAT },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'meat', quantity: 1, name: '🥩 Carne' }
        ],
        requiresNear: 'campfire'
    },
    {
        id: 'cabin',
        name: '🏠 Cabana',
        description: 'Abrigo para crianças e armazenamento de itens.',
        result: { ...ITEMS.CABIN },
        resultQuantity: 1,
        ingredients: [
            { itemId: 'wood', quantity: 8, name: '🪵 Madeira' },
            { itemId: 'fiber', quantity: 4, name: '🌿 Fibra' }
        ]
    }
];

class CraftingSystem {
    constructor() {
        this.isOpen = false;
        this.recipes = RECIPES;
        this.selectedRecipe = null;
        
        // Botão de fechar (null-safe para HTMLs incompletos)
        const closeBtn = document.getElementById('close-crafting-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }

    // Abrir/fechar painel de crafting
    toggle() {
        const panel = document.getElementById('crafting-screen');
        if (!panel) return;
        
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            panel.classList.remove('hidden');
            this.selectedRecipe = null;
            this.renderRecipes();
            this.updateTouchVisibility(false);
        } else {
            panel.classList.add('hidden');
            this.updateTouchVisibility(true);
        }
    }

    // Abrir crafting
    open() {
        const panel = document.getElementById('crafting-screen');
        if (!panel) return;
        
        if (!this.isOpen) {
            this.isOpen = true;
            panel.classList.remove('hidden');
            this.selectedRecipe = null;
            this.renderRecipes();
            this.updateTouchVisibility(false);
        }
    }

    // Fechar crafting
    close() {
        const panel = document.getElementById('crafting-screen');
        if (!panel) return;
        
        if (this.isOpen) {
            this.isOpen = false;
            panel.classList.add('hidden');
            this.updateTouchVisibility(true);
        }
    }
    
    updateTouchVisibility(visible) {
        if (game && game.ui) {
            game.ui.updateTouchControlsVisibility(visible);
        }
    }

    // Verificar se o jogador pode craftar uma receita
    canCraft(recipe, player) {
        for (const ingredient of recipe.ingredients) {
            if (!player.inventory.hasItem(ingredient.itemId, ingredient.quantity)) {
                return false;
            }
        }
        // Verificar se há espaço no inventário
        if (player.inventory.isFull()) {
            return false;
        }
        return true;
    }

    // Craftar uma receita
    craft(recipe, player) {
        if (!this.canCraft(recipe, player)) return false;

        // Remover ingredientes
        for (const ingredient of recipe.ingredients) {
            let remaining = ingredient.quantity;
            for (let i = 0; i < player.inventory.slots.length && remaining > 0; i++) {
                const slot = player.inventory.slots[i];
                if (slot && slot.id === ingredient.itemId) {
                    const remove = Math.min(remaining, slot.quantity);
                    player.inventory.removeItem(i, remove);
                    remaining -= remove;
                }
            }
        }

        // Adicionar resultado
        player.inventory.addItem(recipe.result, recipe.resultQuantity);
        audioManager.playCraft();

        return true;
    }

    // Renderizar lista de receitas
    renderRecipes() {
        const list = document.getElementById('recipe-list');
        if (!list || !game || !game.player) return;

        list.innerHTML = '';

        for (const recipe of this.recipes) {
            const canCraft = this.canCraft(recipe, game.player);
            const item = document.createElement('div');
            item.className = 'recipe-item' + (canCraft ? '' : ' disabled');

            // Mostrar ingredientes
            let ingredientsHTML = '';
            for (const ing of recipe.ingredients) {
                const has = game.player.inventory.countItem(ing.itemId);
                const enough = has >= ing.quantity;
                ingredientsHTML += `<span class="recipe-ingredient ${enough ? 'enough' : 'missing'}">${ing.name} ${has}/${ing.quantity}</span>`;
            }

            item.innerHTML = `
                <div class="recipe-header">
                    <span class="recipe-name">${recipe.name}</span>
                    ${recipe.resultQuantity > 1 ? `<span class="recipe-qty">x${recipe.resultQuantity}</span>` : ''}
                </div>
                <div class="recipe-ingredients">${ingredientsHTML}</div>
            `;

            item.addEventListener('click', () => {
                if (canCraft) {
                    this.selectedRecipe = recipe;
                    this.showRecipeDetail(recipe);
                }
            });

            list.appendChild(item);
        }
    }

    // Mostrar detalhes da receita selecionada
    showRecipeDetail(recipe) {
        const detail = document.getElementById('recipe-detail');
        if (!detail) return;

        const canCraft = this.canCraft(recipe, game.player);

        let ingredientsHTML = '';
        for (const ing of recipe.ingredients) {
            const has = game.player.inventory.countItem(ing.itemId);
            const enough = has >= ing.quantity;
            ingredientsHTML += `<div class="detail-ingredient ${enough ? 'enough' : 'missing'}">${ing.name}: ${has}/${ing.quantity}</div>`;
        }

        detail.innerHTML = `
            <h3>${recipe.name}</h3>
            <p class="recipe-desc">${recipe.description}</p>
            <div class="recipe-result-qty">Receita: ${recipe.resultQuantity}x</div>
            <div class="recipe-detail-ingredients">${ingredientsHTML}</div>
            <button id="craft-btn" ${canCraft ? '' : 'disabled'} class="${canCraft ? '' : 'disabled'}">
                ${canCraft ? '🔨 Craftar' : '❌ Sem materiais'}
            </button>
        `;

        const craftBtn = document.getElementById('craft-btn');
        if (craftBtn && canCraft) {
            craftBtn.addEventListener('click', () => {
                if (this.craft(recipe, game.player)) {
                    game.ui.showMessage(`Craftou ${recipe.name}!`, 2);
                    this.renderRecipes();
                    this.showRecipeDetail(recipe);
                }
            });
        }
    }
}
