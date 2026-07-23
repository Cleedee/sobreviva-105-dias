# 📋 TODO - Sobreviva 105 Dias em uma Floresta

Lista de funcionalidades a implementar e melhorias.

---

## 🔴 Prioridade Alta (Essencial)

### Monstro Bugado
- [ ] Criar classe `BugMonster` (inimigo especial)
- [ ] Aparece todas as noites
- [ ] Mais forte que lobos e ursOS
- [ ] Mecânica de lua cheia (devora criança)
- [ ] Animações e efeitos especiais

### Crafting
- [x] Criar interface de crafting
- [x] Sistema de receitas descobertas
- [x] Bancada de trabalho funcional
- [x] Receitas iniciais:
  - [x] Lança de madeira (2 madeira + 1 fibra)
  - [x] Picareta (2 madeira + 2 pedra)
  - [x] Bolsa (3 fibra)
  - [x] Cerca (3 madeira)
  - [x] Armadilha (2 madeira + 1 pedra)
- [ ] Novas receitas:
  - [ ] Arco e Flecha (3 madeira + 2 fibra)
  - [ ] Fogueira (5 madeira + 2 fibra)
  - [ ] Cantil melhorado (2 pedra + 1 fibra) - carrega mais água

### Crianças
- [x] Sistema de fome/sede das crianças
- [ ] Alimentar crianças (arrastar comida ou interagir)
- [ ] Crianças morrem se não cuidar
- [ ] Opção de devolver para a cela
- [ ] Diálogos/emoções das crianças

### Sistema de Caça
- [ ] Animais para caçar (coelhos, veados, javalis)
- [ ] Ferramentas de caça:
  - [ ] Arco e Flecha (novo - craftar: 3 madeira + 2 fibra)
  - [ ] Lança (já existe - eficiente para caça)
  - [ ] Armadilha (já existe - captura animal vivo)
  - [ ] Mãos vazias (difícil, menos recompensa)
- [ ] Drop de carne e peles ao caçar
- [ ] Animais fogem do jogador
- [ ] Som de caça e coleta

### Fogueira
- [ ] Fogueira se extingue após um tempo
- [ ] Craftar fogueira (novo - receita: 5 madeira + 2 fibra)
- [ ] Religar fogueira (precisa de madeira)
- [ ] Luz da fogueira ilumina área ao redor na noite

### Sistema de Chaves
- [x] Chaves espalhadas pelo mapa
- [x] Cada chave abre uma cela específica
- [x] Chaves ocupam slot no inventário
- [x] Visual com brilho dourado pulsante
- [x] Número da cela indicado na chave
- [x] Minimapa mostra chaves (dourado) e celas (cinza)
- [x] Save/Load das chaves

---

## 🟡 Prioridade Média (Importante)

### Sons
- [x] Música de fundo (dia)
- [x] Música de fundo (noite)
- [x] Efeito de passos
- [x] Efeito de ataque
- [x] Efeito de coleta
- [x] Sons dos inimigos
- [x] Sons ambientes (vento, pássaros, etc.)

### Arte
- [ ] Sprite sheet do jogador
- [ ] Sprite sheet dos inimigos
- [ ] Tiles da floresta (pixel art)
- [ ] UI pixel art
- [ ] Animações de personagens

### Save/Load
- [x] Salvar estado do jogo no localStorage
- [x] Carregar jogo salvo
- [ ] Menu de slots de save
- [x] Auto-save a cada 5 minutos

### Fadas e Animais
- [ ] Implementar dádivas das fadas
- [ ] Tipos de dádivas:
  - [ ] Pó de fada (cura)
  - [ ] Asas (velocidade)
  - [ ] Escudo mágico (proteção)
- [ ] Animais com diferentes dádivas

---

## 🟢 Prioridade Baixa (Polimento)

### Gameplay
- [ ] Sistema de clima (chuva, neve)
- [ ] Eventos aleatórios
- [ ] Mais tipos de inimigos
- [ ] Boss fights
- [ ] Sistema de dificuldade progressiva
- [ ] Conquistas/achievements
- [ ] Necessidade de calor (fogueira) em noites frias
- [ ] Sistema de fome mais realista (digestão, peso)

### UI/UX
- [ ] Tutorial introdutório
- [ ] Dicas na tela
- [ ] HUD melhorado
- [ ] Animações de transição
- [ ] Tela de configurações

### Conteúdo
- [ ] Mais tipos de árvores
- [ ] Mais recursos
- [ ] Mais receitas de crafting
- [ ] Locais especiais (cavernas, ruínas)
- [ ] NPCs (recluso da floresta?)

### Técnico
- [ ] Otimização de performance
- [ ] Colisão mais precisa
- [ ] Pathfinding para inimigos
- [ ] Sistema de partículas
- [x] Suporte a mobile (touch controls)

---

## 📝 Notas de Design

### Lua Cheia
- Acontece a cada 7 noites
- Monstro Bugado fica mais forte
- Devora UMA criança se não estiver protegida
- Efeitos visuais especiais

### Crianças
- Nomes: Luna, Sol, Estrela, Nuvem, Aurora, Céu
- Seguem o jogador ou ficam na cabana
- Podem morrer de fome/sede
- Alimentação pelo Monstro (mecânica de risco)

### Dificuldade
- Dia 1-30: Fácil (aprender mecânicas)
- Dia 31-60: Médio (mais inimigos)
- Dia 61-90: Difícil (monstros mais fortes)
- Dia 91-105: Extremo (preparação final)

---

*Última atualização: 2026-07-23*
