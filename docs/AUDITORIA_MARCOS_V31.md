# Auditoria e próximos marcos — CoachLOL após v3.1

## Base atual verificada

- Turnos simultâneos em fases de preparação e execução; ordens persistentes por campeão; ações por texto com prévia; loja por função e compras programadas; Golpear por acampamento e HP; evolução com restrições por nível.
- HUD de quatro habilidades com fallback SVG; `Auto Upar` no mesmo painel; mensagens de Reação e PATH separadas; cada ação tática tem ícone local; os widgets de PATH e Reação são móveis sem recriar objetos DOM.
- Integração offline de regressão confirmou imagens locais, troca de função, nivelamento, painel tático, loja, placar e ausência de erros nos cenários cobertos.

## Bloqueios de produção — priorizados

**P0 — Encerramento real de partidas.** Repetir simulações determinísticas até ocorrer vitória legal (torres → inibidores → Nexus) com ataque às estruturas, wave management, transformação de vantagens em push e respeito à fog. Partidas de 40 minutos anteriores ficaram sem vencedor.

**P0 — Kits e alvos de habilidades.** Separar totalmente a lógica de efeito do ícone Data Dragon. Regras por campeão para passivas, autoataque, custos, cast, alcance, AOE, CC, shields, heal, on-hit, dano verdadeiro e interações. Incluir hitboxes e alvos de aliados/inimigos/terreno, com teste de resposta de confronto em turnos. Nami W é uma implementação inicial; demais kits permanecem incompletos.

**P0 — Persistência/determinismo de turnos.** Travamentos em condições adversas, visão sincronizada com a animação, câmera em máquinas reais e input duplo devem ser testados com telemetria de tempo de frame e cenários de regressão multiseed.

**P1 — Assets/data pipeline.** Criar manifesto por patch e baixar/cachear localmente apenas as imagens pertinentes (retratos, skills, feitiços, itens). Data Dragon é fonte de metadados visuais, não regras autoritativas para o motor. Auditoria de licenças e segregação de ícones autorais, CC0 e assets Riot.

**P1 — Loja completa.** Componentes, receitas, build tree, limites de slots, efeitos de equipamentos, venda/desfazer e recomendações adaptadas ao matchup e função.

**P1 — Gramática/IA tática local.** Normalização de gírias e ações condicionais; AST validada, resolução de ambiguidade, múltiplos campeões, objetivos ocultos sem vazar informação. WebGPU para modelo local é uma possibilidade opt-in, não implementada como motor de decisão.

**P1 — UI fina.** Cache de preferências de dock (iniciado), responsividade em 1280×720/1920×1080/ultrawide, escalas de ícones por DPI, tooltip acessível, contraste e atalhos. Evitar mais caixas decorativas e mais opções competindo com o mapa.

**P2 — Multiplayer/ranqueada.** Fluxo lobby, servidor autoritativo de commit-reveal para turnos, sincronização/reconexão, espectadores, segurança/anti-cheat, matchmaking, MMR, PDL, temporadas e histórico. **Não lançar ranked antes de partidas consistentes e completas.**

## Próximo marco ideal — v3.2

**Vertical slice de combate com duas duplas completas** (por exemplo, Jinx+Nami contra Caitlyn+Leona), com ataque básico, alcance, QWER reais, alvos próprios, mana, cooldown, estado de CC e sistema de resolução por turnos. Cobrir com 100% dos contratos de interação entre esses quatro kits e com testes de alvo visível/invisível, cast válido/inválido e movimentação simultânea. Depois ampliar para top/mid/jg. Esse marco é mais importante do que acrescentar novas janelas visuais neste momento.

## Executar testes

```bash
npm test
python tests/e2e_v31.py
```

A suíte de navegador monta uma página de teste autocontida (sem internet). Para jogar, use `INICIAR_WINDOWS.bat` após extrair todos os arquivos.
