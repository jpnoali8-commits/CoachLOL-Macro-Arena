# CoachLOL Macro Arena — Roadmap canônico V4.3 (26/10/2026)

**Linha oficial:** V37 → V38 → V38.1 → V38.2 → V3.9 → V4.0 → V4.1 → V4.2 → **V4.3**. Atenção: a V3.7 cinematográfica é fonte histórica de integração seletiva, não código-base. Builds novas sempre herdam o ZIP imediatamente anterior.

## Critérios de engenharia

1. Dados **por patch e modo** (LoL PC Summoner's Rift 26.21, patch notes de 20/10/2026 e hotfix 22/10/2026); não usar Wild Rift, Arena, Classic, ARAM como fonte de stats.
2. Marcar `training_or_unverified`, `prototype`, `audited_basic_stats`, `certified` separadamente; dado correto de preço não certifica efeito de item.
3. Compra/venda/receita devem ser consistentes em saldo, inventário e stats; multiplicadores (Rabadon) são derivados e recalculados ao mudar AP ou crescer nível.
4. Runa é camada independente das skills e dos itens; procs, CD, CC e visibilidade devem usar tempo simulado e API universal de dano/efeitos.
5. Visão e privacidade por equipe, snapshots determinísticos, seleções múltiplas e fog não podem regredir. Nenhum dado de debug da autoridade deve vazar ao PvP.

## Versões canônicas

| Marco | Entregável principal | Gate para conclusão |
|---|---|---|
| **V4.3 — atual** | Catálogo JSON parcial com maturidade, compras/receitas/venda local, Rabadon dinâmico, 3 efeitos de itens, páginas de runas com 3 protótipos, economia auditável e painel de loja | 13 contratos V4.3 + regressão anterior + Chromium + stress |
| **V4.4** | Jungle, paths, leash/aggro, criaturas, Smite concorrente, objetivos multilances, visão e batalha 5v5 | Duas equipes disputando objetivo sem duplicar reward/vision, balanceamento por minuto |
| **V4.5** | Ondas/CS/XP/gold completos, torres/inibidores/Nexus, macro 5v5, vitória/derrota legal e replay causal | Telemetria por 5/10/20 min; farm contestado e livre; seeds longas |
| **V4.6** | Lobby, fila e filtros 1×/2×, bots, busca de partidas, servidor autoritativo PvP, reconexão, fog seguro | Contratos anticheat, cliente observador, rollback de intenções/latência |
| **V4.7** | VFX e hitbox/skillshots corretos com stream cinematográfico sem controlar simulação | Projéteis, hit events, visibilidade e câmeras por time sem leak |
| **V4.8** | Assets GLB/3D low-poly, animações, vídeos, áudio e timeline opcional | Render opcional com fallback, sincronização via eventos, licença dos assets |
| **V4.9** | Banco de ações múltiplas/condicionais, combos conjuntos, sintaxe AST, parsing de prompts | Validação sem executar intenção inválida ou invisível |
| **V5.0** | Auditoria exaustiva e certificação 1:1 por patch/kit/item/runa, replay desde início | Matriz rastreável de 100% do conteúdo alvo, cobertura cruzada de casos especiais |

## Dívidas técnicas não ocultar

- **V4.3 não contém todos os itens e runas do LoL**. Os kits não estão 1:1; valores históricos do catálogo podem ser aproximados.
- Rune Comet usa hit imediato simplificado, Fleet usa cinco ataques e Grasp usa combate/4s; não possuem trajetórias exatas e todos os modificadores oficiais.
- `effectResolverV41` não foi migrado para TODOS os efeitos antigos; rollback transacional, economia completa por fonte, ativos on-hit/unique equipados e passivas continuam incompletos.
- A UI 2× acelera tempo REAL de planejamento/reprodução, não segundos simulados para cooldown/runa/DoT.
- `snapshotV40` é checkpoint offline e não protocolo de replay/PvP seguro.

**Próxima base exclusiva: V4.3.0**. Não substituir motor ou app por ZIP histórico.
