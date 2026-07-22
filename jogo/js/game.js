/**
 * Game - Classe principal do jogo
 */

class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Estado do jogo
        this.running = false;
        this.paused = false;
        
        // Câmera (inicializar ANTES de resize)
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Componentes
        this.timeManager = new TimeManager();
        this.world = null;
        this.player = null;
        this.ui = new GameUI();
        this.crafting = new CraftingSystem();
        this.cabinUI = new CabinUI();
        
        // Tamanho da tela (agora camera já existe)
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Tempo
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Callbacks
        this.onGameOver = null;
        this.onGameWin = null;
        
        this.setupCallbacks();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }
    
    setupCallbacks() {
        // Lua cheia
        this.timeManager.on('onFullMoon', () => {
            this.ui.showMessage('🌕 Lua Cheia! O Monstro Bugado está caçando...', 4);
            // TODO: Spawnar Monstro Bugado
        });
        
        // Início da noite
        this.timeManager.on('onNightStart', () => {
            this.ui.showMessage('🌙 A noite caiu... Tome cuidado!', 2);
        });
        
        // Início do dia
        this.timeManager.on('onDayStart', () => {
            this.ui.showMessage(`☀️ Dia ${this.timeManager.day} começou!`, 2);
            
            // Verificar vitória
            if (this.timeManager.day > 105 && this.player.children.length >= GAME_CONFIG.TOTAL_CHILDREN) {
                this.win();
            }
        });
    }
    
    start() {
        console.log('Iniciando game.start()...');
        
        // Criar mundo
        console.log('Criando mundo...');
        this.world = new World();
        console.log('Mundo criado!');
        
        // Criar jogador no campamento
        console.log('Criando jogador...');
        this.player = new Player(
            this.world.campX * GAME_CONFIG.TILE_SIZE,
            this.world.campY * GAME_CONFIG.TILE_SIZE
        );
        console.log('Jogador criado!');
        
        // Adicionar itens iniciais ao inventário
        this.player.inventory.addItem(ITEMS.AXE);
        this.player.inventory.addItem(ITEMS.WATER_BOTTLE, 2);
        this.player.inventory.addItem(ITEMS.APPLE, 5);
        
        // Mostrar UI
        console.log('Mostrando UI do jogo...');
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        // Garantir que canvas está visível
        this.canvas.style.display = 'block';
        this.canvas.style.zIndex = '1';
        
        // Iniciar jogo
        console.log('Iniciando game loop...');
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Jogo rodando!');
    }
    
    gameLoop() {
        if (!this.running) return;
        
        // Calcular delta time
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Limitar delta time
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Update
        if (!this.paused) {
            this.update(this.deltaTime);
        }
        
        // Render
        this.render();
        
        // Input frame clear
        input.clearFrame();
        
        // Próximo frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(dt) {
        // Pausa
        if (input.isPause()) {
            this.togglePause();
            return;
        }
        
        // Inventario
        if (input.isInventory()) {
            this.ui.toggleInventory();
            return;
        }
        
        // Crafting
        if (input.isCrafting()) {
            this.crafting.toggle();
            return;
        }
        
        // Se inventário, pausa, crafting ou cabana aberto, não atualizar jogo
        if (this.ui.inventoryOpen || this.ui.pauseOpen || this.crafting.isOpen || this.cabinUI.isOpen) return;
        
        // Atualizar tempo
        this.timeManager.update(dt);
        
        // Atualizar jogador
        this.player.update(dt, this.world);
        
        // Atacar
        if (input.isAttack()) {
            const result = this.player.attack(this.world);
            if (result && result.hit) {
                this.ui.showMessage(`Acertou ${result.target.type}!`, 1);
            }
        }
        
        // Interagir
        if (input.isInteract()) {
            const result = this.player.interact(this.world);
            if (result) {
                this.ui.showMessage(result.message, 2);
                
                if (result.rescued) {
                    this.world.children.push(result.rescued);
                }
                
                if (result.crafting) {
                    this.crafting.open();
                }
                
                if (result.cabin) {
                    this.cabinUI.open(result.cabinX, result.cabinY);
                }
            }
        }
        
        // Atualizar mundo
        this.world.update(dt, this.timeManager, this.player);
        
        // Atualizar câmera
        this.updateCamera();
        
        // Verificar interações próximas
        this.checkNearbyInteractions();
        
        // Atualizar UI
        this.ui.update(this.player, this.timeManager);
    }
    
    updateCamera() {
        // Câmera segue o jogador
        const targetX = this.player.x + this.player.width / 2 - this.camera.width / 2;
        const targetY = this.player.y + this.player.height / 2 - this.camera.height / 2;
        
        // Suavizar movimento
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Limitar ao mundo
        this.camera.x = MathUtils.clamp(this.camera.x, 0, 
            this.world.width * GAME_CONFIG.TILE_SIZE - this.camera.width);
        this.camera.y = MathUtils.clamp(this.camera.y, 0, 
            this.world.height * GAME_CONFIG.TILE_SIZE - this.camera.height);
    }
    
    checkNearbyInteractions() {
        const playerCenter = this.player.getCenter();
        let canInteract = false;
        let nearbyType = null;
        
        // Verificar tiles adjacentes
        const tileX = Math.floor(playerCenter.x / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(playerCenter.y / GAME_CONFIG.TILE_SIZE);
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const tile = this.world.getTile(tileX + dx, tileY + dy);
                if (tile && tile.interactable) {
                    canInteract = true;
                    if (!nearbyType) nearbyType = tile.type;
                }
            }
        }
        
        // Verificar entidades
        for (const child of this.world.children) {
            if (!child.following) {
                const dist = MathUtils.distance(
                    playerCenter.x, playerCenter.y,
                    child.x, child.y
                );
                if (dist < 50) {
                    canInteract = true;
                    if (!nearbyType) nearbyType = 'child';
                }
            }
        }
        
        if (canInteract) {
            let prompt;
            const isTouch = touchControls && touchControls.isActive();
            const action = isTouch ? 'Toque em <strong>Ação</strong>' : 'Pressione <strong>E</strong>';
            
            switch (nearbyType) {
                case 'water':
                    prompt = `${action} para beber água`;
                    break;
                case 'tree':
                    prompt = `${action} para cortar árvore`;
                    break;
                case 'rock':
                    prompt = `${action} para minerar pedra`;
                    break;
                case 'berry_bush':
                    prompt = `${action} para colher frutas`;
                    break;
                case 'tall_grass':
                    prompt = `${action} para coletar fibra`;
                    break;
                case 'campfire':
                    prompt = `${action} para usar fogueira`;
                    break;
                case 'workbench':
                    prompt = `${action} para usar bancada`;
                    break;
                case 'cabin':
                    prompt = `${action} para entrar na cabana`;
                    break;
                case 'prison':
                    prompt = `${action} para interagir com cela`;
                    break;
                case 'child':
                    prompt = `${action} para resgatar criança`;
                    break;
                default:
                    prompt = `${action} para interagir`;
            }
            
            this.ui.showInteractionPrompt(prompt);
        } else {
            this.ui.hideInteractionPrompt();
        }
    }
    
    render() {
        // Limpar tela
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar mundo
        this.world.render(this.ctx, this.camera, this.timeManager);
        
        // Renderizar entidades interativas
        this.world.renderInteractables(this.ctx, this.camera, this.timeManager);
        
        // Renderizar armadilhas
        this.world.renderTraps(this.ctx, this.camera);
        
        // Renderizar inimigos
        this.world.renderEnemies(this.ctx, this.camera, this.timeManager);
        
        // Renderizar jogador
        this.player.render(this.ctx, this.camera);
        
        // Overlay de noite
        this.renderNightOverlay();
    }
    
    renderNightOverlay() {
        const brightness = this.timeManager.getBrightness();
        
        if (brightness < 1) {
            const alpha = 1 - brightness;
            this.ctx.fillStyle = `rgba(0, 0, 30, ${alpha * 0.6})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Lua cheia - brilho especial
            if (this.timeManager.isFullMoon) {
                const gradient = this.ctx.createRadialGradient(
                    this.canvas.width / 2, this.canvas.height / 2, 0,
                    this.canvas.width / 2, this.canvas.height / 2, 300
                );
                gradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
                gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
    
    togglePause() {
        this.paused = !this.paused;
        this.ui.togglePause();
    }
    
    gameOver(reason) {
        this.running = false;
        
        // Mostrar tela de game over
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(139, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 300;
        `;
        
        overlay.innerHTML = `
            <h1 style="font-size: 4rem; margin-bottom: 1rem;">💀 Game Over</h1>
            <p style="font-size: 1.5rem; margin-bottom: 2rem;">${reason}</p>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                Você sobreviveu por ${this.timeManager.day} dias
            </p>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                Crianças resgatadas: ${this.player.children.length} / ${GAME_CONFIG.TOTAL_CHILDREN}
            </p>
            <button onclick="location.reload()" style="
                padding: 1rem 3rem;
                font-size: 1.5rem;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            ">Tentar Novamente</button>
        `;
        
        document.body.appendChild(overlay);
        
        if (this.onGameOver) this.onGameOver();
    }
    
    win() {
        this.running = false;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 100, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 300;
        `;
        
        overlay.innerHTML = `
            <h1 style="font-size: 4rem; margin-bottom: 1rem;">🏆 Vitória!</h1>
            <p style="font-size: 1.5rem; margin-bottom: 2rem;">
                Você resgatou todas as ${GAME_CONFIG.TOTAL_CHILDREN} crianças!
            </p>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                Todos estão seguros no dia 105!
            </p>
            <button onclick="location.reload()" style="
                padding: 1rem 3rem;
                font-size: 1.5rem;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            ">Jogar Novamente</button>
        `;
        
        document.body.appendChild(overlay);
        
        if (this.onGameWin) this.onGameWin();
    }
}
