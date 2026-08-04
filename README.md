# 🌲 Sobreviva 105 Dias

Um jogo de sobrevivência baseado em navegador onde você precisa sobreviver por 105 dias em uma floresta misteriosa e resgatar 6 crianças capturadas.

## 🎮 Sobre o Jogo

Explore um mundo vasto, colete recursos, crafte itens e enfrente perigos enquanto tenta cumprir sua missão de resgate. O jogo possui ciclo dia/noite, sistema de fome, sede e inventário.

## 🚀 Como Jogar

### Método Recomendado: Servidor Local

Para evitar problemas de CORS, é recomendado usar um servidor local:

**Opção 1 - Python:**
```bash
cd jogo
python -m http.server 8000
```
Acesse: `http://localhost:8000`

**Opção 2 - Node.js (npx):**
```bash
npx serve jogo
```

**Opção 3 - VS Code Live Server:**
1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Abra a pasta `jogo/` no VS Code
3. Clique com botão direito em `index.html` → **Open with Live Server**

**Opção 4 - PHP:**
```bash
cd jogo
php -S localhost:8000
```

### Método Direto (pode ter limitações)

1. Navegue até a pasta `jogo/`
2. Abra `index.html` em qualquer navegador moderno
3. Digite seu nickname e clique em "Iniciar Jogo"
4. Sobreviva e resgate as crianças!

> ⚠️ **Nota:** Abrir o arquivo diretamente (`file://`) pode causar erros CORS ao carregar o manifest.json. Use um servidor local para melhor experiência.

## 📱 Controles

| Tecla | Ação |
|-------|------|
| WASD / Setas | Mover |
| E | Interagir / Coletar |
| I | Abrir Inventário |
| Espaço | Atacar |
| ESC | Pausar |

> 📲 Suporte a controles touch para dispositivos móveis!

## 🏆 Sistema de Ranking

O jogo possui um sistema de ranking global usando **Supabase** (gratuito).

### Configurar Ranking (Opcional)

1. **Criar conta no Supabase:** [supabase.com](https://supabase.com)
2. **Criar novo projeto** em seu painel
3. **Executar SQL** para criar a tabela:
   - Vá em **SQL Editor** no painel
   - Cole o conteúdo de `jogo/sql/create_scores_table.sql`
   - Clique em **Run**
4. **Copiar chaves** em **Settings → API**
5. **Configurar no jogo:**
   - Edite `jogo/js/supabase.js`
   - Substitua `SEU-PROJETO` pelo nome do seu projeto
   - Substitua `SUA_CHAVE_AQUI` pela sua anon key

### Como Funciona

- **Pontuação:** (dias × 100) + (crianças × 500) + bônus
- **Ranking global:** Top 10 jogadores
- **Meus scores:** Histórico pessoal
- **Funciona offline:** Scores salvos localmente quando sem internet

## 🛠️ Tecnologias

- HTML5 Canvas
- JavaScript Vanilla
- CSS3
- Supabase (ranking online)

## 📂 Estrutura

```
├── jogo/                   # Código do jogo
│   ├── index.html          # Página principal
│   ├── css/                # Estilos
│   ├── js/                 # Lógica do jogo
│   │   ├── supabase.js     # Cliente Supabase
│   │   ├── ranking.js      # Sistema de ranking
│   │   └── ...
│   ├── sql/                # Scripts SQL
│   │   └── create_scores_table.sql
│   └── assets/             # Recursos visuais
├── .env.example            # Template de configuração
├── SOBREVIVA_105_DIAS.md
└── MUDANCAS_TOUCH.md
```

## 📄 Licença

Projeto educacional.
