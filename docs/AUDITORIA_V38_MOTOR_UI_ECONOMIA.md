# Auditoria rastreável — V37 → V38

**Escopo real inspecionado**: `engine.mjs`, `app.js`, `index.html`, CSSs de versões anteriores, dados do mapa/máscara e 11+ baterias de testes. A V37 original em ZIP permaneceu intacta; V38 contém todos os arquivos herdados e alterações incrementais.

| Domínio | Sintoma relatado / causa observada | Solução V38 | Validação / restante |
|---|---|---|---|
| Auto-level | Prioridades existentes sem editor curto | Entrada EWQ/WQE, validação e persistência no objeto de unidade | Teste v38; R com nível legal; Udyr especial |
| Multi-seleção | Seleção e alvo únicos; Shift arrastava câmera | `selectedUnitIds`, Shift+clique sem deslocar câmera; `setGroupOrders` atômico | Chromium e teste de ordens; formações são aproximações espaciais |
| Confronto | Steps em painel diferente, pouco espaço | mesmo modal de alvo com cartões independentes por campeão, ícones e HP/mana | Chromium: 2 cartões visíveis, sem exceptions |
| Visão/loja | Oracle disponível no core mas compra/troca não integrada | trinket exclusivo e troca na fonte, temporização de turno, ícone próprio | teste de alternância, alcance de loja, duração/cooldown |
| Placar | Nexus e kills sem contador de torres | três indicadores por equipe, glyphs e cores de torre | DOM e console sem erros |
| HUD de campeão | nível repetido em stats e ausência de MR | badge no retrato, slot MR na grade, HP/MANA preservados | DOM e teste de resistência |
| Lane CS | minions morriam quase sempre para minions e campeão não recebia CS | atribuição limitada a mortes REAIS e proximidade/autofarm, movimentação ajustada | 5m livres: TOP46/MID47/ADC45; rotação pode perder CS |
| XP/oro/jungle | valores simplificados por classe | MR efetiva, item MR, bases de Jinx/Ahri/Nami; tempos de waves existentes | jungle e economia global ainda necessitam auditoria/telemetria |
| Projectiles | Sem proteção no encadeamento de combos | abstração temporária de Yasuo W/Braum E/Mel W em `resolveQueuedCombos` | não é fiel a kits/hitbox reais; preservar aviso |
| Segurança PvP | Offline IA local | ordens não expostas pela perspectiva inimiga | sem proteção contra inspeção do JS local; não é multiplayer |

## Próxima etapa recomendada (V39)

**Prioridade 1**: modelo de economia verificável em dados versionados: gold/XP por minion, XP dividido entre aliados, jungling cronometrado com roteiro de 5min/10min, níveis, camps, retornos ao mapa e múltiplas sementes. Logs por tick (mortes reais, posição, gold, XP, CS). Criar fixtures individuais por campeão em vez de constantes de classe.

**Prioridade 2**: registro declarativo por habilidade (projetil/hitscan/AoE, velocidade, direção, janela, bloqueios, escudos, imunidades, cooldown, cast time, collision mask, efeitos/status); handlers individuais para Yasuo W/Braum E/Mel W. Garantir eventos simultâneos com reconciliação deterministicamente ordenada.

**Prioridade 3**: arquitetura servidor autoritativo para PVP, comandos privados/oponente visível apenas após resolução, anti-cheat, sync e replay; persistência de grupos/combo drafts e multiplayer confiável.

**Prioridade 4**: explorar trinket Farsight, craft/receitas oficiais, todos os dados da patch atualizada e QA visual de client/hud responsiva offline.

## Comandos

`npm test` — suíte integral com regressões.
`npm run test:v38` — seis contratos novos.
`node tests/v20_long_match.mjs 300 36` — simulação de estresse com IA e telemetria limitada (não é cenário de lane livre).

Os resultados em 5 minutos são cenários isolados para validar uma métrica, não prova de balanceamento geral, IA competitiva ou equivalência ao LoL.
