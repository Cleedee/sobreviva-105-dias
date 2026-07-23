/**
 * SaveManager - Sistema de save/load do jogo
 * Salva e carrega o estado completo do jogo usando localStorage
 */

const SAVE_KEY = 'sobreviva_105_save';
const SAVE_VERSION = '1.8.0';
const AUTO_SAVE_INTERVAL = 300000; // 5 minutos

class SaveManager {
    constructor() {
        this.autoSaveTimer = 0;
        this.enabled = true;
    }

    // === SAVE ===

    save(game) {
        try {
            const data = this.serialize(game);
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            console.log('💾 Jogo salvo com sucesso!');
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    }

    serialize(game) {
        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            camera: { x: game.camera.x, y: game.camera.y },
            time: this.serializeTime(game.timeManager),
            player: this.serializePlayer(game.player),
            world: this.serializeWorld(game.world)
        };
    }

    serializeTime(tm) {
        return {
            day: tm.day,
            totalNights: tm.totalNights,
            timeOfDay: tm.timeOfDay,
            isNight: tm.isNight,
            isFullMoon: tm.isFullMoon
        };
    }

    serializePlayer(player) {
        // Serializar slots do inventário
        const slots = player.inventory.slots.map(slot => {
            if (!slot) return null;
            return {
                id: slot.id,
                quantity: slot.quantity,
                durability: slot.durability,
                prisonNumber: slot.prisonNumber
            };
        });

        // Serializar crianças seguindo
        const followingIds = player.childrenFollowing.map(c => c.id);

        return {
            x: player.x,
            y: player.y,
            health: player.health,
            hunger: player.hunger,
            thirst: player.thirst,
            facing: player.facing,
            isInvincible: player.isInvincible,
            invincibleTimer: player.invincibleTimer,
            attackCooldown: player.attackCooldown,
            equippedItemId: player.equippedItem ? player.equippedItem.id : null,
            inventory: {
                size: player.inventory.size,
                selectedSlot: player.inventory.selectedSlot,
                slots: slots
            },
            followingChildIds: followingIds
        };
    }

    serializeWorld(world) {
        // Serializar tiles (só id + propriedades variáveis)
        const tiles = [];
        for (let y = 0; y < world.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < world.width; x++) {
                const t = world.tiles[y][x];
                if (!t) { tiles[y][x] = null; continue; }
                const tileData = { id: t.id };
                // Propriedades extras que podem existir
                if (t.locked !== undefined) tileData.locked = t.locked;
                if (t.prisonNumber !== undefined) tileData.prisonNumber = t.prisonNumber;
                if (t.child) tileData.childId = t.child.id;
                tiles[y][x] = tileData;
            }
        }

        // Serializar inimigos (só vivos)
        const enemies = world.enemies
            .filter(e => e.isAlive)
            .map(e => ({
                type: e.type,
                x: e.x,
                y: e.y,
                health: e.health,
                state: e.state,
                targetX: e.targetX,
                targetY: e.targetY,
                stateTimer: e.stateTimer,
                attackCooldown: e.attackCooldown
            }));
        
        // Serializar animais (só vivos)
        const animals = (world.animals || [])
            .filter(a => a.isAlive)
            .map(a => ({
                type: a.type,
                x: a.x,
                y: a.y,
                spawnX: a.spawnX,
                spawnY: a.spawnY,
                health: a.health,
                state: a.state,
                targetX: a.targetX,
                targetY: a.targetY,
                stateTimer: a.stateTimer
            }));
        
        // Serializar crianças
        const children = world.children.map(c => ({
            id: c.id,
            name: c.name,
            health: c.health,
            hunger: c.hunger,
            thirst: c.thirst,
            following: c.following,
            rescued: c.rescued,
            x: c.x,
            y: c.y
        }));

        // Serializar interativos
        const interactables = world.interactables
            .filter(i => !i.rescued)
            .map(i => ({
                type: i.type,
                x: i.x,
                y: i.y
            }));

        // Serializar armadilhas
        const activeTraps = world.activeTraps.map(t => ({
            x: t.x,
            y: t.y,
            tileX: t.tileX,
            tileY: t.tileY
        }));
        
        // Serializar chaves
        const keys = (world.keys || []).map(k => ({
            tileX: k.tileX,
            tileY: k.tileY,
            prisonNumber: k.prisonNumber,
            collected: k.collected
        }));

        // Serializar armazenamento de cabanas
        const cabinStorage = {};
        for (const key of Object.keys(world.cabinStorage)) {
            const items = world.cabinStorage[key];
            if (items && items.length > 0) {
                cabinStorage[key] = items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    durability: item.durability
                }));
            }
        }

        // Crianças nas cabanas (só IDs)
        const cabinChildren = {};
        for (const key of Object.keys(world.cabinChildren)) {
            cabinChildren[key] = [...world.cabinChildren[key]];
        }

        return {
            width: world.width,
            height: world.height,
            seed: world.seed,
            campX: world.campX,
            campY: world.campY,
            tiles: tiles,
            enemies: enemies,
            animals: animals,
            children: children,
            interactables: interactables,
            activeTraps: activeTraps,
            keys: keys,
            cabinStorage: cabinStorage,
            cabinChildren: cabinChildren,
            fences: { ...world.fences }
        };
    }

    // === LOAD ===

    load(game) {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (data.version !== SAVE_VERSION) {
                console.warn('Versão do save incompatível:', data.version);
                return false;
            }

            this.restore(game, data);
            console.log('💾 Jogo carregado com sucesso!');
            return true;
        } catch (e) {
            console.error('Erro ao carregar save:', e);
            return false;
        }
    }

    restore(game, data) {
        this.restoreTime(game.timeManager, data.time);
        this.restorePlayer(game.player, data);
        this.restoreWorld(game.world, data.world);
        
        game.camera.x = data.camera.x;
        game.camera.y = data.camera.y;
    }

    restoreTime(tm, timeData) {
        tm.day = timeData.day;
        tm.totalNights = timeData.totalNights;
        tm.timeOfDay = timeData.timeOfDay;
        tm.isNight = timeData.isNight;
        tm.isFullMoon = timeData.isFullMoon;
    }

    restorePlayer(player, data) {
        const pData = data.player;

        player.x = pData.x;
        player.y = pData.y;
        player.health = pData.health;
        player.hunger = pData.hunger;
        player.thirst = pData.thirst;
        player.facing = pData.facing;
        player.isInvincible = pData.isInvincible;
        player.invincibleTimer = pData.invincibleTimer;
        player.attackCooldown = pData.attackCooldown;

        // Restaurar item equipado
        if (pData.equippedItemId && ITEMS[pData.equippedItemId.toUpperCase()]) {
            player.equippedItem = { ...ITEMS[pData.equippedItemId.toUpperCase()] };
        } else {
            player.equippedItem = null;
        }

        // Restaurar inventário
        player.inventory.size = pData.inventory.size;
        player.inventory.selectedSlot = pData.inventory.selectedSlot;
        player.inventory.slots = pData.inventory.slots.map(slotData => {
            if (!slotData) return null;
            const itemDef = ITEMS[slotData.id.toUpperCase()];
            if (!itemDef) return null;
            const slot = { ...itemDef, quantity: slotData.quantity };
            if (slotData.durability !== undefined) slot.durability = slotData.durability;
            if (slotData.prisonNumber !== undefined) slot.prisonNumber = slotData.prisonNumber;
            return slot;
        });

        // Limpar crianças seguindo (será restaurado depois)
        player.childrenFollowing = [];
        player.children = [];
    }

    restoreWorld(world, wData) {
        world.width = wData.width;
        world.height = wData.height;
        world.seed = wData.seed;
        world.campX = wData.campX;
        world.campY = wData.campY;
        world.fences = wData.fences || {};

        // Restaurar tiles
        world.tiles = [];
        for (let y = 0; y < wData.height; y++) {
            world.tiles[y] = [];
            for (let x = 0; x < wData.width; x++) {
                const td = wData.tiles[y][x];
                if (!td) { world.tiles[y][x] = null; continue; }
                // Reconstruir tile a partir do id
                const tileType = Object.values(TILE_TYPES).find(tt => tt.id === td.id);
                if (tileType) {
                    const tile = { ...tileType };
                    if (td.locked !== undefined) tile.locked = td.locked;
                    if (td.prisonNumber !== undefined) tile.prisonNumber = td.prisonNumber;
                    world.tiles[y][x] = tile;
                } else {
                    // Fallback: grama
                    world.tiles[y][x] = { ...TILE_TYPES.GRASS };
                }
            }
        }

        // Restaurar inimigos
        world.enemies = wData.enemies.map(eData => {
            let enemy;
            if (eData.type === 'bear') {
                enemy = new Bear(eData.x, eData.y);
            } else {
                enemy = new Wolf(eData.x, eData.y);
            }
            enemy.health = eData.health;
            enemy.state = eData.state;
            enemy.targetX = eData.targetX;
            enemy.targetY = eData.targetY;
            enemy.stateTimer = eData.stateTimer;
            enemy.attackCooldown = eData.attackCooldown;
            return enemy;
        });
        
        // Restaurar animais
        world.animals = (wData.animals || []).map(aData => {
            let animal;
            if (aData.type === 'rabbit') {
                animal = new Rabbit(aData.x, aData.y);
            } else if (aData.type === 'deer') {
                animal = new Deer(aData.x, aData.y);
            } else if (aData.type === 'boar') {
                animal = new Boar(aData.x, aData.y);
            } else {
                animal = new Rabbit(aData.x, aData.y); // fallback
            }
            animal.spawnX = aData.spawnX;
            animal.spawnY = aData.spawnY;
            animal.health = aData.health;
            animal.state = aData.state;
            animal.targetX = aData.targetX;
            animal.targetY = aData.targetY;
            animal.stateTimer = aData.stateTimer;
            return animal;
        });
        
        // Restaurar crianças
        world.children = wData.children.map(cData => {
            const child = {
                id: cData.id,
                name: cData.name,
                health: cData.health,
                hunger: cData.hunger,
                thirst: cData.thirst,
                following: cData.following,
                rescued: cData.rescued,
                x: cData.x,
                y: cData.y
            };
            // Restaurar referências de child em prisons
            if (child.rescued && !child.following) {
                // Criança resgatada mas não seguindo - pode estar em cabana
            }
            return child;
        });

        // Restaurar child references em prisons
        for (let y = 0; y < wData.height; y++) {
            for (let x = 0; x < wData.width; x++) {
                const td = wData.tiles[y][x];
                if (td && td.childId !== undefined) {
                    const child = world.children.find(c => c.id === td.childId);
                    if (child && world.tiles[y][x]) {
                        world.tiles[y][x].child = child;
                    }
                }
            }
        }

        // Restaurar interativos
        world.interactables = (wData.interactables || []).map(iData => {
            const intType = { type: iData.type, x: iData.x, y: iData.y, rescued: false };
            // Definir recompensas conforme tipo
            if (iData.type === 'fairy') intType.reward = ITEMS.FAIRY_DUST;
            else if (iData.type === 'wolf_cage') intType.reward = ITEMS.WOLF_PELT;
            else if (iData.type === 'bear_cage') intType.reward = ITEMS.BEAR_PELT;
            return intType;
        });

        // Restaurar armadilhas
        world.activeTraps = (wData.activeTraps || []).map(tData => ({
            x: tData.x,
            y: tData.y,
            tileX: tData.tileX,
            tileY: tData.tileY
        }));
        
        // Restaurar chaves
        world.loadKeysState(wData.keys);

        // Restaurar armazenamento de cabanas
        world.cabinStorage = {};
        for (const key of Object.keys(wData.cabinStorage || {})) {
            world.cabinStorage[key] = (wData.cabinStorage[key] || []).map(itemData => {
                const itemDef = ITEMS[itemData.id.toUpperCase()];
                if (!itemDef) return null;
                const item = { ...itemDef, quantity: itemData.quantity };
                if (itemData.durability !== undefined) item.durability = itemData.durability;
                return item;
            }).filter(Boolean);
        }

        // Restaurar crianças em cabanas
        world.cabinChildren = wData.cabinChildren || {};
    }

    // === AUTO SAVE ===

    updateAutoSave(deltaTime, game) {
        if (!this.enabled) return;
        this.autoSaveTimer += deltaTime;
        if (this.autoSaveTimer >= AUTO_SAVE_INTERVAL / 1000) {
            this.autoSaveTimer = 0;
            this.save(game);
        }
    }

    // === DELETE SAVE ===

    deleteSave() {
        localStorage.removeItem(SAVE_KEY);
        console.log('💾 Save deletado');
    }

    // === CHECK ===

    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    getSaveInfo() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return {
                version: data.version,
                timestamp: data.timestamp,
                day: data.time ? data.time.day : '?',
                date: new Date(data.timestamp).toLocaleString('pt-BR')
            };
        } catch (e) {
            return null;
        }
    }
}

const saveManager = new SaveManager();
