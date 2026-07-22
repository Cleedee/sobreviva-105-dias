# 📋 Changelog - Sobreviva 105 Dias

Todas as alterações notáveis neste projeto estão documentadas neste arquivo.

---

## [1.3.0] - 2026-07-21

### 🔧 Correções

#### 🌿 Coleta de Recursos
- **Fibra**: Adicionado tile `TALL_GRASS` (grama alta) que gera aleatoriamente no mapa
  - Interaja com **E** para coletar 1-3 fibras (sem ferramenta)
  - Renderiza como hastes verdes com animação de vento
- **Pedra**: Agora é possível coletar pedra **sem picareta** (mão livre)
  - Sem picareta: 1 pedra por tile
  - Com picareta: 2-4 pedras por tile (mais eficiente)
- **Corrigido ciclo vicioso** que impedia progressão (precisava de pedra para craftar picareta, mas precisava de picareta para minerar pedra)

### 🎮 Gameplay
- Fluxo de craft agora funciona desde o início:
  ```
  Grama alta → Fibra (mão livre)
  Pedra → 1 pedra (mão livre) / 2-4 (picareta)
  Árvore → Madeira (machado)
  → Craftar Picareta → Minerar mais pedra
  ```

### 🔧 Alterações Técnicas

#### Arquivos Modificados

##### `js/world.js`
- Adicionado tile type `TALL_GRASS` com geração procedural
- Adicionada renderização de grama alta com animação de vento

##### `js/player.js`
- `interactWithTile('rock')`: permite coleta sem picareta (1 pedra)
- Adicionado case `'tall_grass'`: coleta de fibra (1-3)

---

## [1.2.0] - 2026-07-21

### ✨ Novas Funcionalidades

#### 🔨 Sistema de Crafting
- Implementado sistema completo de crafting com receitas
- Interface de crafting com lista de receitas e painel de detalhes
- Verificação automática de materiais disponíveis
- 6 receitas iniciais implementadas:
  - **Lança de Madeira** (2 Madeira + 1 Fibra) → Arma básica
  - **Picareta** (2 Madeira + 2 Pedra) → Para minerar pedras
  - **Bolsa Pequena** (3 Fibra) → +5 slots no inventário
  - **Cerca** (3 Madeira) → 2 unidades, proteção básica
  - **Armadilha** (2 Madeira + 1 Pedra) → Para armadilhar inimigos
  - **Carne Assada** (1 Carne) → Cozinhada na fogueira

#### 🎮 Integração com o Jogo
- Tecla **C** abre/fecha o painel de crafting
- Interação com a **Bancada de Trabalho** abre o crafting
- Suporte a controles touch para crafting
- Bloqueio de atualização do jogo quando painel está aberto

### 🔧 Alterações Técnicas

#### Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `js/crafting.js` | Classe `CraftingSystem` - Gerencia receitas e UI de crafting |

#### Arquivos Modificados

##### `js/input.js`
- Adicionado método `isCrafting()` para tecla C

##### `js/game.js`
- Instância de `CraftingSystem` adicionada
- `update()` verifica input de crafting e bloqueia jogo quando aberto
- `update()` abre crafting quando interagir retorna `crafting: true`

##### `js/touch.js`
- `handleQuickTap('interact')` agora abre crafting quando result.crafting é true

##### `index.html`
- Adicionado painel de crafting com lista e detalhes de receitas
- Adicionado script `js/crafting.js`
- Atualizada lista de controles (C - Craftar)

##### `css/style.css`
- Estilos para `#crafting-screen`, `.crafting-panel`, `.crafting-layout`
- Estilos para `.recipe-list`, `.recipe-item`, `.recipe-detail`
- Botão de craftar com estados (habilitado/desabilitado)

---

## [1.1.0] - 2026-07-21

### ✨ Novas Funcionalidades

#### 📱 Suporte a Dispositivos Móveis
- Implementado sistema completo de controles touch para smartphones e tablets
- Detecção automática de dispositivo móvel via User-Agent e capacidades de touch
- Interface adaptativa que se ajusta ao tamanho da tela

#### 🎮 Joystick Virtual
- Joystick analógico virtual posicionado no canto inferior esquerdo da tela
- Controle de movimento suave com limite de distância (deadzone)
- Indicador visual de estado (ativo/inativo)
- Normalização do vetor de movimento para movimentação diagonal fluida

#### ⚔️ Botões de Ação Touch
- **Botão Atacar** (vermelho) - Toque rápido para ataque único, toque mantido para ataque contínuo
- **Botão Ação** (verde) - Interagir com objetos, coletar itens, falar com personagens
- **Botão Inventário** (azul) - Abrir/fechar painel de inventário
- **Botão Pausar** - Acesso rápido ao menu de pausa

#### 📋 Melhorias na Interface
- Prompt de interação adaptativo (mostra "Toque em Ação" em dispositivos touch, "Pressione E" em teclado)
- Indicador visual "Modo Touch Ativo" na tela inicial
- Instruções de teclado ocultas automaticamente em dispositivos touch

---

### 🔧 Alterações Técnicas

#### Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `js/touch.js` | Classe `TouchControls` - Gerencia todos os controles touch |
| `README.md` | Documentação principal do jogo com controles touch |
| `CHANGELOG.md` | Este arquivo de registro de alterações |

#### Arquivos Modificados

##### `js/input.js`
- Adicionadas propriedades para estado do touch (`touchMoveX`, `touchMoveY`, `touchAttack`, `touchInteract`)
- Método `getMovement()` agora combina input de teclado e joystick touch
- Métodos `isInteract()` e `isAttack()` suportam ações touch
- Reset de estado touch no `clearFrame()`

##### `js/main.js`
- Adicionada inicialização dos controles touch ao iniciar o jogo
- Suporte a evento `touchend` no botão iniciar para dispositivos móvel

##### `js/ui.js`
- Novo método `updateTouchControlsVisibility()` para ocultar/mostrar controles
- `toggleInventory()` e `togglePause()` atualizados para gerenciar visibilidade dos controles touch

##### `js/player.js`
- Atualizado `handleActions()` para compatibilidade com input touch

##### `js/game.js`
- `checkNearbyInteractions()` agora mostra instrução adequada para cada dispositivo

##### `css/style.css`
- Adicionados estilos para `#touch-controls`, `#joystick`, `#joystick-knob`
- Estilos para `#action-buttons` e `.action-btn` com variações de cor
- Estilos para `#aux-buttons` e `.aux-btn`
- Media queries para `@media (hover: none) and (pointer: coarse)`
- Ajustes responsivos para telas pequenas (`max-width: 600px`)

##### `index.html`
- Adicionado script `js/touch.js` na seção de scripts

---

### 📐 Decisões de Design

1. **Detecção de Dispositivo**: Utilizada combinação de User-Agent + `maxTouchPoints` + `ontouchstart` para máxima compatibilidade

2. **Arquitetura dos Controles**: Separada lógica de touch em classe independente (`TouchControls`) para melhor organização e manutenção

3. **Experiência de Toque**: 
   - Distinguir entre toque rápido (ação única) e toque mantido (ação contínua)
   - Timeout de 100ms para detecção de toque longo
   - Prevenção de gestos indesejados (zoom, scroll)

4. **Compatibilidade**: Os controles touch não afetam jogadores de teclado - ambos os modos funcionam simultaneamente

---

### 🐛 Correções

- Corrigido comportamento de scroll indesejado ao usar setas no teclado
- Adicionada prevenção contra zoom com duplo-toque em dispositivos móvel

---

### 📦 Dependências

Nenhuma nova dependência externa adicionada. Toda implementação foi feita com JavaScript vanilla.

---

## [1.0.0] - 2026-07-21 (Original)

### Funcionalidades Iniciais

- 🌲 Mundo proceduralmente gerado com diferentes biomas
- 🏕️ Sistema de campamento central
- 👦 Sistema de resgate de 6 crianças
- ⚔️ Sistema de combate com inimigos
- 🎒 Sistema de inventário com 15 slots
- 🌙 Ciclo dia/noite com 105 dias
- 📊 Barras de status (vida, fome, sede)
- 🗺️ Minimapa em tempo real
- 💾 Sistema de pausa

### Controles Iniciais (Apenas Teclado)

| Tecla | Ação |
|-------|------|
| WASD / Setas | Mover |
| E | Interagir |
| I | Inventário |
| Espaço | Atacar |
| ESC | Pausar |

---

## 📝 Notas para o Desenvolvedor

### Estrutura de Arquivos Atualizada

```
jogo/
├── index.html
├── README.md
├── CHANGELOG.md
├── css/
│   └── style.css
└── js/
    ├── main.js
    ├── game.js
    ├── player.js
    ├── world.js
    ├── input.js      ← Atualizado
    ├── touch.js      ← NOVO
    ├── ui.js         ← Atualizado
    ├── inventory.js
    ├── time.js
    └── utils.js
```

### Testes Recomendados

1. Testar em iOS Safari
2. Testar em Android Chrome
3. Testar em tablets com tela maior
4. Verificar comportamento em orientação landscape/portrait
5. Testar simultaneidade de teclado + touch

---

*Documentado em: 21 de Julho de 2026*
