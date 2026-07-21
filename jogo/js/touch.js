/**
 * TouchControls - Sistema de controles para dispositivos móveis
 */

class TouchControls {
    constructor() {
        this.isMobile = this.detectMobile();
        this.joystick = null;
        this.joystickKnob = null;
        this.joystickContainer = null;
        
        // Estado do joystick
        this.joystickActive = false;
        this.joystickStartX = 0;
        this.joystickStartY = 0;
        this.joystickX = 0;
        this.joystickY = 0;
        this.maxDistance = 50;
        
        // Botões de ação
        this.buttons = {
            attack: false,
            interact: false,
            inventory: false,
            pause: false
        };
        
        // Botões de toque rápido (para distinguir de arrastar)
        this.buttonTouchStart = {};
        this.buttonTouchTimeout = {};
        
        if (this.isMobile) {
            this.createControls();
            this.setupEventListeners();
        }
    }
    
    detectMobile() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
            ('ontouchstart' in window)
        );
    }
    
    createControls() {
        // Criar container dos controles
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'touch-controls';
        controlsContainer.innerHTML = `
            <!-- Joystick -->
            <div id="joystick-container">
                <div id="joystick">
                    <div id="joystick-knob"></div>
                </div>
            </div>
            
            <!-- Botões de Ação -->
            <div id="action-buttons">
                <button id="btn-attack" class="action-btn">
                    <span class="btn-icon">⚔️</span>
                    <span class="btn-label">Atacar</span>
                </button>
                <button id="btn-interact" class="action-btn">
                    <span class="btn-icon">👆</span>
                    <span class="btn-label">Ação</span>
                </button>
                <button id="btn-inventory" class="action-btn">
                    <span class="btn-icon">🎒</span>
                    <span class="btn-label">Itens</span>
                </button>
            </div>
            
            <!-- Botões Auxiliares -->
            <div id="aux-buttons">
                <button id="btn-pause" class="aux-btn">
                    <span class="btn-icon">⏸️</span>
                </button>
            </div>
            
            <!-- Indicador de Touch -->
            <div id="touch-indicator">
                <span>📱 Modo Touch Ativo</span>
            </div>
        `;
        
        document.body.appendChild(controlsContainer);
        
        // Referências
        this.joystickContainer = document.getElementById('joystick-container');
        this.joystick = document.getElementById('joystick');
        this.joystickKnob = document.getElementById('joystick-knob');
    }
    
    setupEventListeners() {
        if (!this.isMobile) return;
        
        // Joystick
        this.joystick.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onJoystickEnd(e), { passive: false });
        
        // Botões de ação
        const btnAttack = document.getElementById('btn-attack');
        const btnInteract = document.getElementById('btn-interact');
        const btnInventory = document.getElementById('btn-inventory');
        const btnPause = document.getElementById('btn-pause');
        
        // Attack - com toque rápido e mantido
        this.setupButton(btnAttack, 'attack', () => {
            input.touchAttack = true;
        }, () => {
            input.touchAttack = false;
        });
        
        // Interact
        this.setupButton(btnInteract, 'interact', () => {
            input.touchInteract = true;
        }, () => {
            input.touchInteract = false;
        });
        
        // Inventory - toggle
        btnInventory.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (game && game.ui) {
                game.ui.toggleInventory();
            }
        }, { passive: false });
        
        // Pause
        btnPause.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (game && game.ui) {
                game.ui.togglePause();
            }
        }, { passive: false });
        
        // Prevenir comportamentos padrão do touch
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
        
        // Prevenir zoom duplo-toque
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    setupButton(button, action, onStart, onEnd) {
        let longPressTimer = null;
        let isLongPress = false;
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isLongPress = false;
            
            // Detectar toque longo (mantido)
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                if (onStart) onStart();
            }, 100); // 100ms para considerar mantido
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            clearTimeout(longPressTimer);
            
            if (isLongPress) {
                // Foi mantido - liberar
                if (onEnd) onEnd();
            } else {
                // Toque rápido - executar ação única
                this.handleQuickTap(action);
            }
        }, { passive: false });
        
        button.addEventListener('touchcancel', (e) => {
            clearTimeout(longPressTimer);
            if (isLongPress && onEnd) onEnd();
        }, { passive: false });
    }
    
    handleQuickTap(action) {
        switch (action) {
            case 'attack':
                // Ataque rápido - executar uma vez
                if (game && game.player) {
                    const result = game.player.attack(game.world);
                    if (result && result.hit) {
                        game.ui.showMessage('Acertou!');
                    }
                }
                break;
            case 'interact':
                // Interação rápida
                if (game && game.player) {
                    const result = game.player.interact(game.world);
                    if (result && result.message) {
                        game.ui.showMessage(result.message);
                    }
                }
                break;
        }
    }
    
    onJoystickStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.joystickActive = true;
        const touch = e.touches[0];
        const rect = this.joystick.getBoundingClientRect();
        
        this.joystickStartX = rect.left + rect.width / 2;
        this.joystickStartY = rect.top + rect.height / 2;
        
        this.joystick.classList.add('active');
    }
    
    onJoystickMove(e) {
        if (!this.joystickActive) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        let deltaX = touch.clientX - this.joystickStartX;
        let deltaY = touch.clientY - this.joystickStartY;
        
        // Limitar distância máxima
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.maxDistance) {
            deltaX = (deltaX / distance) * this.maxDistance;
            deltaY = (deltaY / distance) * this.maxDistance;
        }
        
        // Atualizar posição do knob
        this.joystickKnob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Normalizar para -1 a 1
        this.joystickX = deltaX / this.maxDistance;
        this.joystickY = deltaY / this.maxDistance;
        
        // Atualizar input
        input.touchMoveX = this.joystickX;
        input.touchMoveY = this.joystickY;
    }
    
    onJoystickEnd(e) {
        if (!this.joystickActive) return;
        
        // Verificar se ainda há toques no joystick
        const joystickTouches = Array.from(e.touches).filter(t => {
            const rect = this.joystick.getBoundingClientRect();
            return t.clientX >= rect.left && t.clientX <= rect.right &&
                   t.clientY >= rect.top && t.clientY <= rect.bottom;
        });
        
        if (joystickTouches.length === 0) {
            this.joystickActive = false;
            this.joystick.classList.remove('active');
            
            // Resetar knob
            this.joystickKnob.style.transform = 'translate(0, 0)';
            
            // Resetar input
            this.joystickX = 0;
            this.joystickY = 0;
            input.touchMoveX = 0;
            input.touchMoveY = 0;
        }
    }
    
    // Métodos públicos
    isActive() {
        return this.isMobile;
    }
    
    getMovement() {
        return {
            x: this.joystickX,
            y: this.joystickY
        };
    }
    
    // Atualizar visibilidade baseado no estado do jogo
    updateVisibility(gameStarted) {
        const controls = document.getElementById('touch-controls');
        const indicator = document.getElementById('touch-indicator');
        
        if (controls) {
            if (gameStarted) {
                controls.classList.add('game-started');
                if (indicator) {
                    indicator.classList.add('hidden');
                }
            } else {
                controls.classList.remove('game-started');
            }
        }
    }
}

// Instância global
const touchControls = new TouchControls();
