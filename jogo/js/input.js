/**
 * Input - Sistema de entrada (teclado + touch)
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // Estado do touch
        this.touchMoveX = 0;
        this.touchMoveY = 0;
        this.touchAttack = false;
        this.touchInteract = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Prevenir scroll com setas
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
            e.preventDefault();
        }
        
        if (!this.keys[key]) {
            this.keysPressed[key] = true;
        }
        this.keys[key] = true;
    }
    
    onKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;
        this.keysReleased[key] = true;
    }
    
    // Verificar se tecla está pressionada
    isDown(key) {
        return this.keys[key.toLowerCase()] || false;
    }
    
    // Verificar se tecla foi pressionada neste frame
    wasPressed(key) {
        return this.keysPressed[key.toLowerCase()] || false;
    }
    
    // Verificar se tecla foi solta neste frame
    wasReleased(key) {
        return this.keysReleased[key.toLowerCase()] || false;
    }
    
    // Limpar estados de frame
    clearFrame() {
        this.keysPressed = {};
        this.keysReleased = {};
        
        // Resetar ações touch de toque rápido
        this.touchAttack = false;
        this.touchInteract = false;
    }
    
    // Métodos de conveniência para movimento (com suporte a touch)
    getMovement() {
        let dx = 0;
        let dy = 0;
        
        // Teclado
        if (this.isDown('w') || this.isDown('arrowup')) dy = -1;
        if (this.isDown('s') || this.isDown('arrowdown')) dy = 1;
        if (this.isDown('a') || this.isDown('arrowleft')) dx = -1;
        if (this.isDown('d') || this.isDown('arrowright')) dx = 1;
        
        // Touch (joystick) - só usar se não houver input de teclado
        if (dx === 0 && dy === 0 && touchControls && touchControls.isActive()) {
            dx = this.touchMoveX;
            dy = this.touchMoveY;
        }
        
        // Normalizar diagonal (apenas para input de teclado)
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        
        return { x: dx, y: dy };
    }
    
    // Verificar ações (com suporte a touch)
    isInteract() { 
        return this.wasPressed('e') || this.touchInteract; 
    }
    
    isAttack() { 
        return this.wasPressed(' ') || this.touchAttack; 
    }
    
    isInventory() { 
        return this.wasPressed('i'); 
    }
    
    isPause() { 
        return this.wasPressed('escape'); 
    }
}

// Instância global
const input = new InputManager();
