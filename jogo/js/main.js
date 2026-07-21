/**
 * Main - Ponto de entrada do jogo
 */

// Esperar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌲 Sobreviva 105 Dias em uma Floresta');
    console.log('Carregando...');
    
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
`;
document.head.appendChild(style);
