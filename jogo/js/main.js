/**
 * Main - Ponto de entrada do jogo
 */

// Constante para chave do nickname no localStorage
const NICKNAME_KEY = 'sobreviva_105_nickname';

// Função para obter/salvar nickname
function getNickname() {
    return localStorage.getItem(NICKNAME_KEY) || '';
}

function saveNickname(nickname) {
    localStorage.setItem(NICKNAME_KEY, nickname);
}

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
        // Detectar hardware e ajustar tamanho do mapa
        applyHardwareConfig();
        
        // Criar instância do jogo
        window.game = new Game();
        console.log('Game criado com sucesso!');
    } catch (e) {
        console.error('Erro ao criar game:', e);
    }
    
    // Botão de iniciar
    const startBtn = document.getElementById('start-btn');
    const loadBtn = document.getElementById('load-btn');
    const nicknameInput = document.getElementById('nickname-input');
    
    // Carregar nickname salvo
    const savedNickname = getNickname();
    if (savedNickname) {
        nicknameInput.value = savedNickname;
    }
    
    // Mostrar botão de carregar se houver save
    if (saveManager.hasSave()) {
        loadBtn.classList.remove('hidden');
        const info = saveManager.getSaveInfo();
        if (info) loadBtn.textContent = `Continuar (Dia ${info.day})`;
    }
    
    startBtn.addEventListener('click', () => {
        try {
            // Salvar nickname
            const nickname = nicknameInput.value.trim() || 'Sobrevivente';
            saveNickname(nickname);
            
            game.start();
            if (touchControls && touchControls.isActive()) {
                touchControls.updateVisibility(true);
            }
        } catch (e) {
            console.error('Erro ao iniciar jogo:', e);
        }
    });
    
    // Botão de carregar jogo salvo
    loadBtn.addEventListener('click', () => {
        try {
            // Salvar nickname
            const nickname = nicknameInput.value.trim() || 'Sobrevivente';
            saveNickname(nickname);
            
            game.start();
            if (game.loadGame()) {
                if (touchControls && touchControls.isActive()) {
                    touchControls.updateVisibility(true);
                }
            }
        } catch (e) {
            console.error('Erro ao carregar jogo:', e);
        }
    });
    
    // Permitir iniciar com Enter
    nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });
    
    // ==================== RANKING ====================
    
    // Botão de ranking na tela inicial
    const rankingBtn = document.getElementById('ranking-btn');
    const rankingScreen = document.getElementById('ranking-screen');
    const closeRankingBtn = document.getElementById('close-ranking-btn');
    const closeRankingX = document.getElementById('close-ranking-x');
    
    if (rankingBtn) {
        rankingBtn.addEventListener('click', () => {
            showRanking();
        });
    }
    
    if (closeRankingBtn) {
        closeRankingBtn.addEventListener('click', () => {
            rankingScreen.classList.add('hidden');
        });
    }
    
    if (closeRankingX) {
        closeRankingX.addEventListener('click', () => {
            rankingScreen.classList.add('hidden');
        });
    }
    
    // Abas do ranking
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todas
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ranking-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar active na clicada
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById(`ranking-${tabName}`).classList.add('active');
            
            // Carregar conteúdo
            if (tabName === 'my-scores') {
                loadMyScores();
            }
        });
    });
    
    // ==================== FIM RANKING ====================
    
    // Botão de salvar no pause menu
    document.getElementById('save-btn').addEventListener('click', () => {
        game.saveGame();
    });
    
    // Botão de sair no pause menu
    document.getElementById('quit-btn').addEventListener('click', () => {
        saveManager.deleteSave();
        location.reload();
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

// ==================== FUNÇÕES DE RANKING ====================

/**
 * Mostrar tela de ranking
 */
async function showRanking() {
    const rankingScreen = document.getElementById('ranking-screen');
    const rankingList = document.getElementById('ranking-list');
    const rankingStatus = document.getElementById('ranking-status');
    
    rankingList.innerHTML = '<div class="ranking-loading">Carregando</div>';
    rankingScreen.classList.remove('hidden');
    
    // Mostrar status de conexão
    if (rankingSystem.isOnline) {
        rankingStatus.textContent = '🟢 Online - Ranking global ativo';
        rankingStatus.className = 'ranking-status online';
    } else {
        rankingStatus.textContent = '🔴 Offline - Ranking salvo localmente';
        rankingStatus.className = 'ranking-status offline';
    }
    
    try {
        // Buscar ranking
        const ranking = await rankingSystem.getRanking(10);
        displayRanking(ranking);
        
        // Buscar estatísticas
        const stats = await rankingSystem.getStats();
        if (stats) {
            document.getElementById('stat-total-games').textContent = stats.totalGames;
            document.getElementById('stat-avg-days').textContent = stats.avgDays || 0;
            document.getElementById('stat-total-children').textContent = stats.totalChildren;
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        rankingList.innerHTML = '<div class="ranking-empty">Erro ao carregar ranking</div>';
    }
}

/**
 * Exibir ranking na tela
 */
function displayRanking(ranking) {
    const rankingList = document.getElementById('ranking-list');
    
    if (!ranking || ranking.length === 0) {
        rankingList.innerHTML = '<div class="ranking-empty">Nenhuma pontuação registrada ainda. Seja o primeiro!</div>';
        return;
    }
    
    rankingList.innerHTML = ranking.map((player, index) => {
        let medalClass = '';
        let medalEmoji = `${player.position}º`;
        
        if (player.position === 1) { medalClass = 'gold'; medalEmoji = '🥇'; }
        else if (player.position === 2) { medalClass = 'silver'; medalEmoji = '🥈'; }
        else if (player.position === 3) { medalClass = 'bronze'; medalEmoji = '🥉'; }
        
        return `
            <div class="ranking-item ${medalClass}">
                <span class="ranking-position">${medalEmoji}</span>
                <div class="ranking-info">
                    <div class="ranking-nickname">${escapeHtml(player.nickname)}</div>
                    <div class="ranking-details">
                        📅 ${player.days_survived} dias | 👧 ${player.children_rescued}/6 crianças
                    </div>
                </div>
                <span class="ranking-score">${player.score.toLocaleString()}</span>
            </div>
        `;
    }).join('');
}

/**
 * Carregar meus scores
 */
async function loadMyScores() {
    const myList = document.getElementById('my-scores-list');
    const nickname = localStorage.getItem('sobreviva_105_nickname') || 'Sobrevivente';
    
    myList.innerHTML = '<div class="ranking-loading">Carregando</div>';
    
    try {
        const scores = await rankingSystem.getPlayerScores(nickname);
        
        if (!scores || scores.length === 0) {
            myList.innerHTML = '<div class="ranking-empty">Você ainda não tem pontuações. Jogue para registrar!</div>';
            return;
        }
        
        myList.innerHTML = scores.map((score, index) => `
            <div class="ranking-item">
                <span class="ranking-position">#${index + 1}</span>
                <div class="ranking-info">
                    <div class="ranking-nickname">${escapeHtml(score.nickname)}</div>
                    <div class="ranking-details">
                        📅 ${score.days_survived} dias | 👧 ${score.children_rescued}/6 crianças
                    </div>
                </div>
                <span class="ranking-score">${score.score.toLocaleString()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar meus scores:', error);
        myList.innerHTML = '<div class="ranking-empty">Erro ao carregar seus scores.</div>';
    }
}

/**
 * Função auxiliar para escapar HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FIM RANKING ====================

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
