# 📋 Changelog - Sobreviva 105 Dias

Todas as alterações notáveis neste projeto estão documentadas neste arquivo.

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
