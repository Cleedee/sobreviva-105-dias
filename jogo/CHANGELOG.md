# 📋 Changelog - Sobreviva 105 Dias

Todas as alterações notáveis neste projeto estão documentadas neste arquivo.

---

## [1.8.0] - 2026-07-22

### ✨ Novas Funcionalidades

#### 🔊 Sistema de Áudio
- Novo módulo `js/audio.js` com `AudioManager` usando **Web Audio API**
- Geração procedural de sons (sem arquivos externos):
  - **Movimento**: passos ao caminhar
  - **Combate**: ataque, acerto, dano recebido
  - **Coleta**: coletar itens (fibra, pedra, comida)
  - **Consumo**: comer, beber
  - **Crafting**: som ao fabricar item
  - **Construção**: som ao colocar armadilha/cabana/cerca
  - **UI**: abrir/fechar inventário
  - **Inimigos**: rugido (lobo), roar (urso), morte
  - **Ambiente**: ruído de vento, pássaros (dia), corujas (noite)
  - **Música**: tema dia/noturno com notas procedurais
  - **Eventos**: lua cheia, início da noite/dia
  - **Fim de jogo**: game over e vitória
- Volume configurável (0-1)
- Pausa/resume automático com o jogo

### 🔧 Alterações Técnicas

##### `js/audio.js` (novo)
- `AudioManager` com `init()`, `resume()`, `playXxx()` para cada som
- `startMusic(isNight)`, `stopMusic()`, `startAmbientLoop()`, `stopAmbientLoop()`

##### `js/game.js`
- `audioManager.init()` no construtor do Game
- `audioManager.resume()`, `startMusic()`, `startAmbientLoop()` no `start()`
- Sons em `setupCallbacks()`: lua cheia, noite, dia
- Sons em `gameOver()` e `win()`

##### `js/ui.js`
- Sons em `toggleInventory()`: open/close
- Sons em `useSelectedItem()`: eat/drink
- Sons em colocação de armadilha/cabana/cerca

##### `js/crafting.js`
- Som de craft ao fabricar item com sucesso

##### `index.html` (ambos)
- Script `js/audio.js` adicionado (após `input.js`, antes de `touch.js`)

---

## [1.7.0] - 2026-07-22

### ✨ Novas Funcionalidades

#### 💧 Interação com Lagoas

##### Beber Água
- Jogador pode interagir com tiles de **água** (lagoas) para beber
- Restaura **20 de sede** por interação
- Funciona sem cantil — basta encostar na água

#### ❓ Tela de Ajuda
- Botão **❓** no canto superior direito durante o jogo
- Mostra todos os **controles** do jogo (WASD, E, I, C, SPACE, ESC)
- **Dicas** de gameplay (como coletar recursos, resgatar crianças, etc.)
- **Créditos**: versão do jogo, desenvolvedor (Cláudio Torcato) e idealizador (Eloá Torcato)

#### 🩹 Recuperação de Vida
- Comidas agora restauram vida ao serem consumidas:
  - 🍎 Maçã: +5 vida
  - 🫐 Frutas Silvestres: +3 vida
  - 🍖 Carne Assada: +15 vida
- Mensagem na tela mostra a quantidade de vida recuperada

#### 🎮 Prompt Contextual
- Prompt de interação mostra ação específica do tile próximo:
  - 💧 Água: "Pressione **E** para beber água"
  - 🌳 Árvore: "Pressione **E** para cortar árvore"
  - 🪨 Pedra: "Pressione **E** para minerar pedra"
  - 🫐 Arbusto: "Pressione **E** para colher frutas"
  - 🌿 Grama: "Pressione **E** para coletar fibra"
  - 🔥 Fogueira: "Pressione **E** para usar fogueira"
  - 🔨 Bancada: "Pressione **E** para usar bancada"
  - 🏠 Cabana: "Pressione **E** para entrar na cabana"
  - 👧 Criança: "Pressione **E** para resgatar criança"

### 🔧 Alterações Técnicas

##### `js/world.js`
- Tile `WATER` agora tem `interactable: true` e `type: 'water'`

##### `js/player.js`
- `interactWithTile()`: case `water` restaura 20 sede, informa sobre cantil cheio

##### `js/game.js`
- `checkNearbyInteractions()`: detecta tipo do tile adjacente e mostra prompt contextual

##### `js/inventory.js`
- Itens `APPLE`, `BERRY`, `COOKED_MEAT` agora têm propriedade `healthRestore`
- `useItem()` retorna `healthRestore` ao consumir comida

##### `js/ui.js`
- `useSelectedItem()` aplica `healthRestore` ao consumir comida

### 🐛 Correções

- **Jogo trava ao pausar**: botão "Continuar" e botão touch agora chamam `game.togglePause()` ao invés de `ui.togglePause()`
- Botão "Usar" do inventário funciona para todos os itens (armadilhas, cabanas, cercas, comida, equipamentos)
- Construções (cerca/cabana) bloqueadas se jogador estiver sobrepondo o tile
- Barras de fome/sede visíveis (z-index do HUD corrigido)
- CraftingSystem e CabinUI null-safe (não crasham se HTML incompleto)
- Service worker atualizado para v3 (cache de `index.html` raiz)

---

## [1.6.0] - 2026-07-21

### ✨ Novas Funcionalidades

#### 🪤 Armadilha Funcional

##### Uso
- **Craftar**: 2 Madeira + 1 Pedra → 1 Armadilha
- **Colocar**: segure a armadilha no inventário e interaja com grama
- **Ativação**: inimigos que pisarem na armadilha recebem **30 de dano**
- Armadilha é **consumida** ao ser ativada (desaparece)

##### Comportamento
- Verificação contínua de colisão entre inimigos e armadilhas
- Dano aplicado automaticamente ao inimigo mais próximo
- Renderização visual: base de madeira com alça e pontas

### 🔧 Alterações Técnicas

##### `js/world.js`
- Array `activeTraps` para armazenar armadilhas ativas
- `placeTrap(x, y)`: adiciona armadilha ao mapa
- `checkTraps()`: verifica colisão inimigos × armadilhas, aplica dano
- `renderTraps()`: renderiza armadilhas no canvas

##### `js/player.js`
- Colocar armadilha: interagir com grama segurando item armadilha

##### `js/game.js`
- `renderTraps()` chamado no game loop de renderização

---

## [1.5.0] - 2026-07-21

### ✨ Novas Funcionalidades

#### 🏠 Sistema de Cabanas

##### Construção
- **Receita de crafting**: 8 Madeira + 4 Fibra → 1 Cabana
- Colocar cabana: segure o item da cabana e interaja com grama
- Cabana vira tile sólido no mundo

##### Gerenciamento (interaja com cabana)
- **Estoque da cabana**: guardar e retirar itens
  - Itens empilháveis se somam automaticamente
  - Cabe qualquer tipo de item
- **Crianças**: enviar para cabana ou chamar de volta
  - Crianças na cabana aparecem como ícone `👧×N` sobre a cabana
  - Crianças fora da cabana seguem o jogador normalmente

##### Consumo Automático
- Crianças em cabanas consomem comida/água do estoque automaticamente
- **Taxa reduzida** (~30% da normal) — mais lento que seguir o jogador
- Consome primeiro quando fome/sede < 50
- Comida → restaura fome, Bebida → restaura sede

##### UI de Cabana
- Painel com 3 seções: Estoque, Crianças, Inventário do jogador
- Botões: Guardar, Retirar, Enviar criança, Chamar criança
- Status de fome/sede das crianças visível

### 🔧 Alterações Técnicas

#### Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `js/cabin.js` | Classe `CabinUI` - Gerencia interface de cabanas |

#### Arquivos Modificados

##### `js/inventory.js`
- Adicionado item `CABIN` (tipo building)

##### `js/crafting.js`
- Adicionada receita de cabana (8 Madeira + 4 Fibra)

##### `js/world.js`
- `cabinStorage`: Map de estoque por posição
- `cabinChildren`: Map de crianças por cabana
- `updateCabinChildren()`: consumo automático de comida/água
- `renderCabinChildren()`: ícone de crianças na cabana
- Métodos auxiliares: `cabinKey()`, `getCabinStorage()`, `getCabinChildren()`

##### `js/player.js`
- `interactWithTile('cabin')`: abre painel de gerenciamento
- Colocar cabana: interagir com grama tendo cabana no inventário

##### `js/game.js`
- `CabinUI` instanciado e integrado no game loop
- Bloqueio de atualização quando cabana está aberta

##### `sw.js`
- Cache version v2 com cabin.js adicionado

---

## [1.4.0] - 2026-07-21

### ✨ Novas Funcionalidades

#### 📱 PWA (Progressive Web App)
- O jogo agora pode ser **instalado** em desktop e celular
- **Mobile**:菜单 do navegador → "Adicionar à tela inicial" → app standalone
- **Desktop (Chrome/Edge)**: ícone de instalar na barra de endereço
- Funciona **offline** após primeiro carregamento (cache de todos os assets)

#### 🗂️ Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `manifest.json` | Manifest PWA com ícones, nome, cores |
| `sw.js` | Service Worker com cache first + network fallback |
| `assets/icons/icon-192.png` | Ícone 192x192 para PWA |
| `assets/icons/icon-512.png` | Ícone 512x512 para PWA |

#### 🔧 Alterações Técnicas

##### `index.html` (raiz e jogo/)
- Adicionado `<link rel="manifest">` vinculando manifest.json
- Meta tags: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- `<link rel="apple-touch-icon">` para iOS
- `<meta name="viewport" user-scalable=no">` prevenir zoom indesejado
- Registro automático do Service Worker

##### `sw.js`
- Cache de todos os assets do jogo na instalação
- Estratégia **cache first**: assets servidos do cache, network como fallback
- Limpeza automática de caches antigos na atualização
- Fallback offline para navegação

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
