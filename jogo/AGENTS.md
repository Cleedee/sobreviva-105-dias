# 🤖 AGENTS.md - Guia para Agentes de IA

Este documento orienta como agentes de IA (como eu) devem trabalhar neste projeto.

---

## 📁 Estrutura do Projeto

```
jogo/
├── index.html          # Página principal HTML
├── README.md           # Documentação geral
├── TODO.md             # Lista de tarefas pendentes
├── AGENTS.md           # Este arquivo
├── css/
│   └── style.css       # Estilos CSS
├── js/
│   ├── utils.js        # Constantes, funções utilitárias, noise
│   ├── input.js        # Sistema de entrada (teclado)
│   ├── time.js         # Ciclo dia/noite
│   ├── inventory.js    # Inventário e definição de itens
│   ├── player.js       # Classe Player
│   ├── world.js        # Geração de mapa, inimigos, entidades
│   ├── ui.js           # Interface do usuário
│   ├── game.js         # Game engine principal
│   └── main.js         # Ponto de entrada, inicialização
└── assets/             # Sprites e recursos visuais
```

---

## 🎯 Regras de Trabalho

### 1. Antes de Alterar um Arquivo
- ** Leia o arquivo completo ** antes de editar
- Entenda as dependências com outros arquivos
- Verifique se as classes/funções já existem

### 2. Convenções de Código
- **Linguagem:** JavaScript vanilla (sem frameworks)
- **Estilo:** Orientado a objetos
- **Nomenclatura:** camelCase para variáveis/funções, PascalCase para classes
- **Comentários:** Em português, explicando o "porquê"
- **Indentação:** 4 espaços

### 3. Estrutura de Classes
```javascript
class ClassName {
    constructor(params) { /* ... */ }
    update(deltaTime) { /* ... */ }
    render(ctx, camera) { /* ... */ }
}
```

### 4. Sistema de Coordenadas
- Origem: canto superior esquerdo do mapa
- Unidade: pixels (32px = 1 tile)
- Tile size: `GAME_CONFIG.TILE_SIZE`

### 5. Game Loop
```
input → update(dt) → render() → input.clearFrame()
```

---

## 📦 Módulos e Suas Responsabilidades

### utils.js
- Constantes do jogo (`GAME_CONFIG`)
- Cores dos tiles (`TILE_COLORS`)
- Funções matemáticas (`MathUtils`)
- Gerador de noise (`NoiseGenerator`)

### input.js
- Captura de teclas pressionadas/soltas
- Método `getMovement()` retorna direção
- Métodos de ação: `isInteract()`, `isAttack()`, etc.

### time.js
- Controla dia/noite
- `getBrightness()` retorna 0-1
- Callbacks: `onDayStart`, `onNightStart`, `onFullMoon`

### inventory.js
- Definição de TODOS os itens (`ITEMS`)
- Classe `Inventory` para gerenciar slots
- Métodos: `addItem()`, `removeItem()`, `useItem()`

### player.js
- Movimento com colisão
- Status (vida, fome, sede)
- Combate e interação
- Renderização do personagem

### world.js
- Geração procedural do mapa
- Classes de inimigos (`Wolf`, `Bear`)
- Crianças e entidades interativas
- Renderização do mundo

### ui.js
- Atualização de barras de status
- Inventário visual
- Minimapa
- Mensagens e prompts

### game.js
- Game loop principal
- Coordenação entre módulos
- Câmera
- Controle de estado (pausa, game over)

### main.js
- Inicialização
- Event listeners globais

---

## 🔧 Para Adicionar Nova Funcionalidade

### Novo Item
1. Adicionar definição em `inventory.js` no objeto `ITEMS`
2. Adicionar lógica de uso em `Player.useItem()`
3. Adicionar receita de crafting (se aplicável)

### Novo Inimigo
1. Criar classe em `world.js` herdando de `Enemy`
2. Implementar `update()` e `render()`
3. Adicionar spawn em `World.spawnEnemies()`

### Nova Construção
1. Adicionar tile type em `world.js` → `TILE_TYPES`
2. Adicionar renderização em `World.renderTileDetails()`
3. Adicionar interação em `Player.interactWithTile()`

### Novo Sistema
1. Criar nova arquivo `js/novo_sistema.js`
2. Adicionar `<script>` no `index.html`
3. Integrar no `Game.update()` e `Game.render()`

---

## ⚠️ Cuidados

- **Não quebrar o game loop** - sempre usar `deltaTime`
- **Não bloquear a UI** - operações pesadas em chunks
- **Manter performance** - só renderizar tiles visíveis
- **Testar colisões** - verificar bordas dos tiles
- **Preservar saves** - não mudar estrutura de dados sem migração

---

## 🐛 Bugs Conhecidos

- Nenhum registrado ainda

---

## 📚 Referências

- Canvas API: https://developer.mozilla.org/pt-BR/docs/Web/API/Canvas_API
- Game Loop: https://gameprogrammingpatterns.com/game-loop.html
- Perlin Noise: https://en.wikipedia.org/wiki/Perlin_noise

---

*Última atualização: 2026-07-21*
