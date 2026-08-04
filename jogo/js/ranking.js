/**
 * Ranking System - Sistema de Ranking com Supabase
 * 
 * Gerencia a pontuação dos jogadores e o ranking global.
 */

class RankingSystem {
    constructor() {
        this.tableName = 'scores';
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 30000; // 30 segundos de cache
        this.isOnline = false;
        
        // Verificar conexão ao iniciar
        this.checkConnection();
    }

    /**
     * Verificar se está conectado ao Supabase
     */
    async checkConnection() {
        if (!SupabaseClient.isConfigured()) {
            console.log('⚠️ Supabase não configurado - ranking offline');
            this.isOnline = false;
            return;
        }

        try {
            await SupabaseClient.select(this.tableName, { limit: 1 });
            this.isOnline = true;
            console.log('✅ Conectado ao Supabase - ranking online');
        } catch (error) {
            console.warn('⚠️ Sem conexão com Supabase - ranking offline');
            this.isOnline = false;
        }
    }

    /**
     * Calcular pontuação
     * Fórmula: (dias * 100) + (crianças * 500) + bônus
     */
    calculateScore(daysSurvived, childrenRescued) {
        const baseScore = daysSurvived * 100;
        const childrenBonus = childrenRescued * 500;
        
        // Bônus por resgatar todas as crianças
        const allChildrenBonus = childrenRescued >= 6 ? 1000 : 0;
        
        // Bônus por sobreviver mais de 100 dias
        const survivalBonus = daysSurvived >= 100 ? 500 : 0;
        
        return baseScore + childrenBonus + allChildrenBonus + survivalBonus;
    }

    /**
     * Salvar pontuação
     */
    async saveScore(nickname, daysSurvived, childrenRescued) {
        const score = this.calculateScore(daysSurvived, childrenRescued);
        
        // Sempre salvar localmente
        this.saveToLocal(nickname, daysSurvived, childrenRescued, score);
        
        // Tentar salvar online se disponível
        if (this.isOnline) {
            try {
                const result = await SupabaseClient.insert(this.tableName, {
                    nickname: nickname.substring(0, 20),
                    days_survived: daysSurvived,
                    children_rescued: childrenRescued,
                    score: score
                });

                console.log(`🏆 Pontuação salva online! Score: ${score}`);
                
                // Limpar cache
                this.cache = null;
                
                return {
                    success: true,
                    score: score,
                    online: true,
                    data: result[0]
                };
            } catch (error) {
                console.warn('Erro ao salvar online:', error.message);
                return {
                    success: true,
                    score: score,
                    online: false,
                    local: true
                };
            }
        }
        
        console.log(`💾 Pontuação salva localmente. Score: ${score}`);
        return {
            success: true,
            score: score,
            online: false,
            local: true
        };
    }

    /**
     * Salvar no localStorage (backup)
     */
    saveToLocal(nickname, days, children, score) {
        try {
            const localScores = this.getLocalScores();
            localScores.push({
                nickname,
                days_survived: days,
                children_rescued: children,
                score,
                created_at: new Date().toISOString()
            });
            
            // Manter apenas top 50 localmente
            localScores.sort((a, b) => b.score - a.score);
            const topScores = localScores.slice(0, 50);
            
            localStorage.setItem('sobreviva_105_scores', JSON.stringify(topScores));
        } catch (error) {
            console.warn('Erro ao salvar localmente:', error);
        }
    }

    /**
     * Buscar scores locais
     */
    getLocalScores() {
        try {
            const data = localStorage.getItem('sobreviva_105_scores');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Buscar ranking (top N)
     */
    async getRanking(limit = 10) {
        // Tentar buscar online
        if (this.isOnline) {
            try {
                // Usar cache se disponível
                if (this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
                    return this.cache.slice(0, limit);
                }

                const data = await SupabaseClient.select(this.tableName, {
                    order: { column: 'score', ascending: false },
                    limit: limit
                });

                // Adicionar posição
                const ranking = data.map((item, index) => ({
                    position: index + 1,
                    ...item
                }));

                // Atualizar cache
                this.cache = ranking;
                this.cacheTime = Date.now();

                return ranking;
            } catch (error) {
                console.warn('Erro ao buscar ranking online:', error.message);
            }
        }
        
        // Fallback para ranking local
        return this.getLocalRanking(limit);
    }

    /**
     * Buscar ranking local
     */
    getLocalRanking(limit = 10) {
        const localScores = this.getLocalScores();
        return localScores.slice(0, limit).map((item, index) => ({
            position: index + 1,
            ...item
        }));
    }

    /**
     * Buscar posição de um jogador
     */
    async getPlayerPosition(nickname) {
        if (this.isOnline) {
            try {
                const ranking = await this.getRanking(1000);
                const playerIndex = ranking.findIndex(
                    p => p.nickname.toLowerCase() === nickname.toLowerCase()
                );
                
                return playerIndex >= 0 ? playerIndex + 1 : null;
            } catch (error) {
                console.warn('Erro ao buscar posição:', error.message);
            }
        }
        
        // Fallback local
        const localRanking = this.getLocalRanking(1000);
        const playerIndex = localRanking.findIndex(
            p => p.nickname.toLowerCase() === nickname.toLowerCase()
        );
        return playerIndex >= 0 ? playerIndex + 1 : null;
    }

    /**
     * Buscar melhores scores de um jogador
     */
    async getPlayerBest(nickname) {
        if (this.isOnline) {
            try {
                const data = await SupabaseClient.select(this.tableName, {
                    filter: { nickname: nickname },
                    order: { column: 'score', ascending: false },
                    limit: 1
                });

                return data.length > 0 ? data[0] : null;
            } catch (error) {
                console.warn('Erro ao buscar melhor score:', error.message);
            }
        }
        
        // Fallback local
        const localScores = this.getLocalScores();
        const playerScores = localScores.filter(
            s => s.nickname.toLowerCase() === nickname.toLowerCase()
        );
        return playerScores.length > 0 ? playerScores[0] : null;
    }

    /**
     * Buscar todos os scores de um jogador
     */
    async getPlayerScores(nickname) {
        if (this.isOnline) {
            try {
                return await SupabaseClient.select(this.tableName, {
                    filter: { nickname: nickname },
                    order: { column: 'score', ascending: false },
                    limit: 10
                });
            } catch (error) {
                console.warn('Erro ao buscar scores do jogador:', error.message);
            }
        }
        
        // Fallback local
        const localScores = this.getLocalScores();
        return localScores
            .filter(s => s.nickname.toLowerCase() === nickname.toLowerCase())
            .slice(0, 10);
    }

    /**
     * Buscar estatísticas gerais
     */
    async getStats() {
        if (this.isOnline) {
            try {
                const data = await SupabaseClient.select(this.tableName, {
                    limit: 10000
                });

                return this.calculateStats(data);
            } catch (error) {
                console.warn('Erro ao buscar estatísticas:', error.message);
            }
        }
        
        // Fallback local
        return this.calculateStats(this.getLocalScores());
    }

    /**
     * Calcular estatísticas a partir dos dados
     */
    calculateStats(data) {
        if (!data || data.length === 0) {
            return {
                totalGames: 0,
                totalDays: 0,
                totalChildren: 0,
                avgScore: 0,
                avgDays: 0
            };
        }

        const totalGames = data.length;
        const totalDays = data.reduce((sum, s) => sum + (s.days_survived || 0), 0);
        const totalChildren = data.reduce((sum, s) => sum + (s.children_rescued || 0), 0);
        const totalScore = data.reduce((sum, s) => sum + (s.score || 0), 0);

        return {
            totalGames,
            totalDays,
            totalChildren,
            avgScore: Math.round(totalScore / totalGames),
            avgDays: Math.round(totalDays / totalGames)
        };
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTime = 0;
    }
}

// Instância global
const rankingSystem = new RankingSystem();
window.rankingSystem = rankingSystem;

console.log('✅ Ranking System carregado');
