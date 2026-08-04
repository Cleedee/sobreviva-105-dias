/**
 * Supabase Client - Configuração
 * 
 * ⚠️ Esta é a ANON KEY (chave pública) - é SEGURA para commitar!
 * Ela é projetada para uso no frontend e depende de RLS no banco.
 * 
 * NUNCA use SERVICE_ROLE_KEY no frontend!
 */

// ============================================
// ⚠️ SUBSTITUA PELOS SEUS VALORES DO SUPABASE
// ============================================
const SUPABASE_CONFIG = {
    url: 'https://lhxjbnmmqufotewsdzmx.supabase.co',           // Seu Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeGpibm1tcXVmb3Rld3Nkem14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NDM0MjYsImV4cCI6MjEwMTQxOTQyNn0.0N1Fzin-91e4ka1M-lzsOLaXdjFMufWP5qDuzJtO5Bs'  // Sua anon key
};

/**
 * Cliente Supabase via REST API
 * Não precisa de biblioteca externa!
 */
const SupabaseClient = {
    url: SUPABASE_CONFIG.url,
    key: SUPABASE_CONFIG.anonKey,

    /**
     * Headers padrão para requisições
     */
    getHeaders() {
        return {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json'
        };
    },

    /**
     * Buscar dados de uma tabela
     */
    async select(table, options = {}) {
        let query = `${this.url}/rest/v1/${table}?select=*`;
        
        // Ordenação
        if (options.order) {
            const dir = options.order.ascending ? 'asc' : 'desc';
            query += `&order=${options.order.column}.${dir}`;
        }
        
        // Limite
        if (options.limit) {
            query += `&limit=${options.limit}`;
        }
        
        // Filtros
        if (options.filter) {
            for (const [key, value] of Object.entries(options.filter)) {
                query += `&${key}=eq.${encodeURIComponent(value)}`;
            }
        }

        const response = await fetch(query, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erro ao buscar dados: ${error}`);
        }

        return await response.json();
    },

    /**
     * Inserir dados em uma tabela
     */
    async insert(table, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                ...this.getHeaders(),
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erro ao inserir dados: ${error}`);
        }

        return await response.json();
    },

    /**
     * Atualizar dados
     */
    async update(table, data, filter) {
        let query = `${this.url}/rest/v1/${table}`;
        
        const filterParams = [];
        for (const [key, value] of Object.entries(filter)) {
            filterParams.push(`${key}=eq.${encodeURIComponent(value)}`);
        }
        
        if (filterParams.length > 0) {
            query += `?${filterParams.join('&')}`;
        }

        const response = await fetch(query, {
            method: 'PATCH',
            headers: {
                ...this.getHeaders(),
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erro ao atualizar dados: ${error}`);
        }

        return await response.json();
    },

    /**
     * Deletar dados
     */
    async delete(table, filter) {
        let query = `${this.url}/rest/v1/${table}`;
        
        const filterParams = [];
        for (const [key, value] of Object.entries(filter)) {
            filterParams.push(`${key}=eq.${encodeURIComponent(value)}`);
        }
        
        if (filterParams.length > 0) {
            query += `?${filterParams.join('&')}`;
        }

        const response = await fetch(query, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erro ao deletar dados: ${error}`);
        }

        return true;
    },

    /**
     * Verificar se está configurado
     */
    isConfigured() {
        return this.url !== 'https://SEU-PROJETO.supabase.co' && 
               !this.key.includes('SUA_CHAVE_AQUI');
    }
};

// Exportar para uso global
window.SupabaseClient = SupabaseClient;

console.log('✅ Supabase Client carregado');
