-- ============================================
-- 🏆 SCRIPT SQL PARA CRIAR TABELA DE RANKING
-- ============================================
-- 
-- Execute este SQL no painel do Supabase:
-- 1. Acesse supabase.com e abra seu projeto
-- 2. Vá em SQL Editor
-- 3. Cole este script e clique em "Run"
--
-- ============================================

-- Criar tabela de pontuações
CREATE TABLE IF NOT EXISTS scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname TEXT NOT NULL,
    days_survived INTEGER NOT NULL DEFAULT 1,
    children_rescued INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação rápida por score
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

-- Criar índice para buscar por nickname
CREATE INDEX IF NOT EXISTS idx_scores_nickname ON scores(nickname);

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- ============================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Política 1: Leitura pública (qualquer um pode ver o ranking)
CREATE POLICY "Leitura pública" ON scores
    FOR SELECT 
    USING (true);

-- Política 2: Inserção anônima (qualquer um pode salvar score)
CREATE POLICY "Inserção anônima" ON scores
    FOR INSERT 
    WITH CHECK (true);

-- Política 3: SEM atualização (proteger dados)
CREATE POLICY "Sem atualização" ON scores
    FOR UPDATE 
    USING (false);

-- Política 4: SEM deleção (proteger dados)
CREATE POLICY "Sem deleção" ON scores
    FOR DELETE 
    USING (false);

-- ============================================
-- 📊 VIEW PARA RANKING (opcional)
-- ============================================

-- View para ranking simplificado
CREATE OR REPLACE VIEW ranking_view AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY score DESC) as position,
    nickname,
    days_survived,
    children_rescued,
    score,
    created_at
FROM scores
ORDER BY score DESC
LIMIT 100;

-- ============================================
-- ✅ CONCLuíDO!
-- ============================================
-- 
-- Após executar este script:
-- 1. A tabela 'scores' será criada
-- 2. RLS será habilitado com políticas seguras
-- 3. Uma view 'ranking_view' será criada
--
-- Agora configure as chaves em supabase.js:
-- - SUPABASE_URL: Seu Project URL
-- - SUPABASE_ANON_KEY: Sua anon public key
--
-- ============================================
