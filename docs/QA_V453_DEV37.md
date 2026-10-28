# QA — V4.5.3-dev37

## Fonte e método

Base imutável proveniente do ZIP mestre `CoachLOL_MacroArena_V453_Dev36_Catalogo_Oficial_26_21_173Campeoes_JogoCompleto.zip` (140.404.489 bytes). Descompactação reproduziu `CoachLOL_MacroArena/.git` e os arquivos preexistentes. O Data Dragon 16.21.1 foi distribuído pelo usuário via coletor Windows, verificado na dev36 contra hashes registrados no manifesto de coleta; isso não substitui assinatura criptográfica emitida pela Riot.

**Não foi executado download adicional de dados de patch ou substituição por dados genéricos.** Verificações feitas sobre os arquivos oficiais brutos que estavam dentro do pacote recebido.

## Reconciliado (IDs Riot → local)

| ID | Item | Receita local antes | Receita após | Custo local | Preço oficial |
|---|---|---|---|---:|---:|
| 1011 | Cinto do Gigante | nenhum | 1028 | 900 | 900 |
| 3094 | Canhão Fumegante | 3086+1018 | 3086+3144 | 2650 | 2650 |
| 3134 | Punhal Serrilhado | nenhum | 1036+1036 | 1000 | 1000 |
| 3135 | Cajado do Vazio | 1026+1052 | 4630+1026 | 3000 | 3000 |
| 3157 | Ampulheta de Zhonya | nenhum | 1058+2420 | 3250 | 3250 |

Anel de Doran, Riot ID 1056: preço 450→400, HP 70→90, retirado bônus local indevido de mana. Zhonya 90→105 AP. Evoluções de missão 3866 e 3867 continuam com custo interno 0 por não serem compras convencionais; não usar o campo 400 `gold.total` para vender essas evoluções ao jogador.

## Status verificável

- Arquivos de cobertura: `QA_EVIDENCE_V453_DEV37/item_coverage_dev37.json`, `official_reconciliation_dev37.json`.
- Contratos: **10/10 PASS** em `tests/v453_dev37_item_reconciliation.test.mjs`.
- Regressão integral: **PASS**, log em `QA_EVIDENCE_V453_DEV37/npm_test_full.log`.
- Chromium: **PASS**, 0 exceções em `QA_EVIDENCE_V453_DEV37/chromium_dev37_report.json`. Capturas `canhao_fumegante_receita_dev37_chromium.png` e `armaguarda_ativa_dev37_chromium.png`. Fixture usa a mesma interface e motor compilado pelo projeto, com imagens de mapa embutidas para contornar bloqueio de `file://`.
- Partidas: seeds 26/36/42, perfil `baseline`, limite 2700s, **3/3 vitória por Nexus**. Tempos 1471 / 1388 / 1392 segundos, média 1417. Sem alterações forçadas em HP de torres ou Nexus; 0 problemas em validação de invariantes. Relatórios `match_*.json`.
- Integridade da referência: 863 entradas e 173 fichas versionadas continuam disponíveis. Novo catálogo de consulta tem 70 itens vinculados localmente e mantém `BROWSE_ONLY_DO_NOT_BUY`.

## Lacunas e próximos testes

1. Bullseye no Estilingue e energização/range temporário do Canhão precisam de implementação e testes de proc/cooldown/ataque à distância; não certificados nesta entrega.
2. Passiva de regeneração e bônus contra minions do Anel de Doran ainda pendentes.
3. Auditar all-in, consumíveis, especiais de missão, buffs e restrições dos próximos grupos de itens, sem habilitação por leitura de descrição.
4. Nenhum navegador real com sessão remota, integração PvP online ou partida jogada manualmente ponta a ponta foi testado.
5. Monitorar média de duração com mais perfis/seeds. Os 3 jogos executados duraram menos de 25min; não extrapolar para o balanceamento geral.
