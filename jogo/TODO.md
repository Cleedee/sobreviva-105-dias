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
- [ ] Criar interface de crafting
- [ ] Sistema de receitas descobertas
- [ ] Bancada de trabalho funcional
- [ ] Receitas iniciais:
  - [ ] Lança de madeira (2 madeira + 1 fibra)
  - [ ] Picareta (2 madeira + 2 pedra)
  - [ ] Bolsa (3 fibra)
  - [ ] Cerca (3 madeira)
  - [ ] Armadilha (2 madeira + 1 pedra)

### Crianças
- [ ] Sistema de fome/sede das crianças
- [ ] Alimentar crianças (arrastar comida ou interagir)
- [ ] Crianças morrem se não cuidar
- [ ] Opção de devolver para a cela
- [ ] Diálogos/emoções das crianças

---

## 🟡 Prioridade Média (Importante)

### Sons
- [ ] Música de fundo (dia)
- [ ] Música de fundo (noite)
- [ ] Efeito de passos
- [ ] Efeito de ataque
- [ ] Efeito de coleta
- [ ] Sons dos inimigos
- [ ] Sons ambientes (vento, pássaros, etc.)

### Arte
- [ ] Sprite sheet do jogador
- [ ] Sprite sheet dos inimigos
- [ ] Tiles da floresta (pixel art)
- [ ] UI pixel art
- [ ] Animações de personagens

### Save/Load
- [ ] Salvar estado do jogo no localStorage
- [ ] Carregar jogo salvo
- [ ] Menu de slots de save
- [ ] Auto-save a cada X dias

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
- [ ] Suporte a mobile (touch controls)

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

*Última atualização: 2026-07-21*
