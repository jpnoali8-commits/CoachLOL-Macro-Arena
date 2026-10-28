# AUDITORIA DE PRODUÇÃO — CoachLOL v3.2

## Resultado da revisão

A interface não deve ser confundida com o motor: efeitos bonitos e ícones são apresentação; dano, alcance, controle de grupo, visão, pathfinding, builds e XP são regras de simulação. Esta revisão corrigiu interações específicas sem declarar fidelidade 1:1 ao patch de LoL.

### Correções efetivamente entregues neste marco

| Subsistema | Contrato novo / correção | Teste |
|---|---|---|
| Turnos | `Finalizar Turno` separado de ordens e mantendo pausa estratégica | JS e screenshot em Chromium |
| Loja | selecionar → detalhes/receita → comprar/programar; sem compra acidental por clicar no ícone | Chromium, teste v3.2 |
| Componentes | consumir 2× Bastão ao finalizar Rabadon, pagar apenas o restante, evitar double-apply de stats | teste v3.2 |
| Quest | únicos pets/Atlas protegidos contra duplicação direta ou em fila | teste v3.2 |
| Jungle | MID pode ordenar clear de acampamento; pet e Smite são exclusivos do jungler | teste v3.2 |
| Fog | permite planejar visita a camp sem visão; não revela estado oculto | código + regressões de visão |
| Suporte | pode farmar; aproximação de penalidade de role quest fora da bot lane abaixo do lv5 | teste v3.2 |
| Feitiços | fila para TP, Heal, Ignite, Exhaust, sem sobrescrever ordem de movimentação | testes de fila/Curar/TP |
| Configuração | restaura interface, câmera e largura dos painéis | inspeção do JS |

### P0 — próximos bloqueadores para um jogo completo

1. **Combate por kits individuais e alvos**: sistematizar hitboxes, skill range, cooldown, cast time, projéteis, CC, status, shields/heals, alcance do AA e valores por rank. Começar por Jinx, Nami, Caitlyn, Leona, Ahri, Vex e Warwick. Não multiplicar casos `if(champ)`; criar registro declarativo `ChampKit`, `AbilityDef`, `Effect` e motor de resolução.
2. **Feitiços exatos**: targeters de TP, Ignite/Exhaust, Heal, cooldowns e disponibilidade conforme escolha em Champ Select. A v3.2 é simulador básico.
3. **Encerramento legal da partida**: cerco com minions, torre atacando unidades, inibidor, Nexus e vitória. Testes longos atuais detectam bugs, mas não garantem finalização.
4. **Travas de turno**: telemetria das fases `preparation / planning / executing / decision` e decisão pendente; watchdog, `resumeExecution` determinístico, testes de tab switch, cliques simultâneos e eventos no último segundo.
5. **Jungle real**: colisão/posição de monstros, múltiplos alvos por campo, leash, counterjungle, buffs, Gold/XP exatos e penalidades conforme o patch, sem vantagens arbitrárias.
6. **Loja real**: migrar catálogo reduzido para catálogo completo Data Dragon versionado, aplicar `from`, `into`, recipe discount, inventário com stacks, venda/desfazer e receita legível. Não presumir que Data Dragon implementa regras: é uma fonte de dados estáticos.

### P1 — UX e acessibilidade

- Separar HUD operacional, overlays temporários e modais (sem nested-box excessivo); manter acessibilidade de teclado, zoom/font scaling e tema escuro, inclusive scrollbars.
- Ícones oficiais versionados com cache local; atlas/portraits adicionais e direitos/licenciamento para distribuição pública.
- Editor de comandos por texto com gramática/aliases e parser com erros explícitos; versão opcional de LLM local com validador de comandos determinístico e fog segura.
- Minimapa, seleção multi-campeão, câmera e indicador real de alcance básico vs skills.
- Mais testes end-to-end reais com imagens/frames de caminhada e fog, em resolução 1080p e ultrawide.

### P2 — plataforma e competitivo

- Lobby, amigos, perfis, client limpo, cosméticos, múltiplos jogadores.
- Backend de partidas autoritativas, determinismo contra replay, segurança anti-cheat, sincronização de turnos, conexão e reconexão.
- Matchmaking/MMR, rank, PDL, temporadas, antifraude, histórico, replays e telemetria.

## Gate de aceite para v3.3

- Habilidades de pelo menos 4 campeões com testes de alvo/range/CD/nível e 2 interações entre campeões.
- Combate e segunda spell nunca bloqueiam decisões pendentes.
- Dez partidas bots completas com vencedor válido, sem violação de invariantes e desempenho reproduzível.
- Pelo menos 1 fluxo real de componente → item concluído e desfazer/sell correto (Rabadon v3.2 é fluxo parcial, sem vender/desfazer).

**Status:** BLOQUEADO para certificação competitiva e multiplayer. ADEQUADO para desenvolvimento local e avaliação incremental de UX.
