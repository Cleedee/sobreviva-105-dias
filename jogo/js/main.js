/**
 * Main - Ponto de entrada do jogo
 */

// Esperar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌲 Sobreviva 105 Dias em uma Floresta');
    console.log('Carregando...');
    
    // Detectar nova versão do service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NEW_VERSION') {
                showUpdateToast(event.data.version);
            }
        });
    }
    
    try {
        // Criar instância do jogo
        window.game = new Game();
        console.log('Game criado com sucesso!');
    } catch (e) {
        console.error('Erro ao criar game:', e);
    }
    
    // Botão de iniciar
    const startBtn = document.getElementById('start-btn');
    console.log('Botão encontrado:', startBtn);
    
    startBtn.addEventListener('click', () => {
        console.log('Botão clicado! Iniciando jogo...');
        try {
            game.start();
            console.log('Jogo iniciado!');
            
            // Ativar controles touch após iniciar
            if (touchControls && touchControls.isActive()) {
                touchControls.updateVisibility(true);
                console.log('Controles touch ativados!');
            }
        } catch (e) {
            console.error('Erro ao iniciar jogo:', e);
        }
    });
    
    // Suporte a touch para iniciar o jogo
    if (touchControls && touchControls.isActive()) {
        startBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            startBtn.click();
        });
    }
    
    // Prevenir zoom com scroll
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Mensagem de boas-vindas
    console.log('Pronto! Clique em "Iniciar Jogo" para começar.');
});

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .inventory-slot:hover {
        transform: scale(1.1);
    }
    
    .inventory-slot.selected {
        animation: pulse 1s infinite;
    }
    
    #update-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a2e;
        border: 2px solid #22c55e;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        transition: transform 0.3s ease;
        text-align: center;
    }
    #update-toast.visible {
        transform: translateX(-50%) translateY(0);
    }
    #update-toast:hover {
        background: #22c55e;
        color: #1a1a2e;
    }
    #update-toast span {
        display: block;
        font-size: 12px;
        opacity: 0.7;
        margin-top: 4px;
    }
`;
document.head.appendChild(style);

function showUpdateToast(version) {
    // Evitar múltiplos toasts
    if (document.getElementById('update-toast')) return;
    
    const toast = document.createElement('div');
    toast.id = 'update-toast';
    toast.innerHTML = `🔄 Nova versão disponível!<span>Clique para atualizar</span>`;
    toast.title = version;
    toast.addEventListener('click', () => {
        window.location.reload();
    });
    document.body.appendChild(toast);
    
    // Animar entrada
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });
    
    // Auto-sumir após 8s
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 8000);
}
