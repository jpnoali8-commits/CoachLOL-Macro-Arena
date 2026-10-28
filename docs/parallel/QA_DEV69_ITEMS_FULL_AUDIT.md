# CoachLOL — Itens: Auditoria Integral DEV69, Marco A (em andamento)

**Branch exclusiva:** `dev69/items-full-audit` (partiu de `dev69/items-batch7` em `74dda4bc6a5b05ca9a490c416767b5fa8fe2cd2d`). **Destino do PR:** `dev69/items-batch7`. Não integrar, não editar `dev69/integration` ou `main`, não sincronizar `engine.browser.js` nesta branch.

## Escopo e contrato de evidência

- Referência Riot PC patch **26.21**, snapshot **Data Dragon 16.21.1** (ambos versionados neste repositório).
- **202/202 `engine_playable` é disponibilidade, NÃO certificação de mecânicas.** Registros condicionais, missões, transformações e itens exclusivos precisam de testes próprios.
- `tools/audit_sr_items_full_dev69.mjs` produz `artifacts/items_full_audit_dev69/matrix.json`, `matrix.csv` e `discrepancies.json`, com ID, família, preço, revenda, receita, flag de efeito e problemas de integridade por linha. Todos os itens permanecem `uncertified` até QA e confirmação específica dos comportamentos; o relatório não mascara lacunas.
- O workflow `.github/workflows/dev69-items-full-audit.yml` publica os arquivos como artifact, verifica sintaxe e roda testes novos e regressões de todas as famílias. Status do workflow deve ser consultado no GitHub; **nenhum PASS é declarado sem run confirmado**.

## Correções no motor autoritativo — missão MID

**Decisão de produto preservada:** a evolução gratuita de botas T2 → T3 pertence **somente** à missão individual do MID de cada equipe; não há desbloqueio global nem compra direta. O limiar de 1350 pontos e o mapa das sete botas permanecem.

1. **Patch 26.9:** ao completar Recall, iniciar pausa de 12 segundos simulados no progresso passivo. A pausa é persistida no campeão para snapshots/reconexão.
2. **Patch 26.9:** a partir do nível 3, 120s em lane geram até 60s de direito de roaming (taxa de crédito 0,5s/s, máximo 60s). Fora da lane, o crédito é consumido no tempo autoritativo e mantém temporariamente a taxa de 1,5 pts/s; sem crédito, 1 ponto a cada 3s.
3. **Patch 26.11:** após concluir a missão, conceder 8% do **AD bônus** e 8% do **AP total**, calculados como estatísticas derivadas, sem mutar `u.ad`/`u.ap` e sem duplicar bônus em compras, vendas, level-up, snapshot ou replay. A base nativa usa dados de campeão existentes para os campeões auditados e o fallback de classe já existente para os demais; **paridade universal de base AD permanece pendente**.
4. Os novos contratos verificam pontuação, recompensa, idempotência, limites do banco de roaming, recall, morte, isolamento e restauração de snapshots.

**Fontes para alterações oficiais:**
- [Riot Patch 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) — missão MID de 1350 pontos e botas gratuitas.
- [Riot Patch 26.9](https://www.leagueoflegends.com/en-au/news/game-updates/league-of-legends-patch-26-9-notes/) — janela após recall, crédito de roaming, ajuste para 1,5/s.
- [Riot Patch 26.11](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-11-notes/) — recompensa de 8% AD bônus/AP.

## Lacunas explicitamente NÃO certificadas

- MID: pontos por placas de torre, multiplicador por objetivos fora da lane que diminui conforme a progressão, eventual comportamento de crédito de roam sob simultaneidade, definição exata das áreas em torno da rota, base AD precisa de cada campeão e modificadores de experiência/gold fora da rota até nível 3.
- Itens Batches 1–7: curvas de dano e cura dinâmicas que aparecem como zero no Data Dragon, geometria/colisores/área de ativos, limites em tropas/monstros/estruturas, interações cruzadas de dezenas de itens, descidas de cooldown, procs de habilidades incompletas.
- Certificação específica por item e regressão do navegador PvP 2 sessões ainda pendentes. Todo `engine_playable` segue `uncertified` até ser avaliado por contrato comportamental.
- `engine.browser.js` e artefatos binários ficam com o integrador somente após integração autorizada.

## Invariantes

- Um humano por equipe controla cinco campeões; planejamento simultâneo e resolução autoritativa.
- Sem alterar o motor de Skills, nenhuma compra/ativação inimiga, nenhum vazamento de fog, nenhum proc repetido por replay.
- Undo irrevogável ao sair fisicamente da fonte, inclusive após retorno; evoluções MID são gratuitas.
- Sem merge, force push, reset destrutivo ou release.

## Próximo trabalho, usando a própria matriz

1. Resolver divergências econômicas reais em lote amplo, com regressões de receitas repetidas, venda, exclusividade e Undo; não certificar por contagem.
2. Auditar famílias ofensivas, defensivas, suporte e visão por gatilhos universais, usando entradas de toda a cadeia B1–B7.
3. Completar MID/placas/objetivos somente quando o hook de torre e a semântica de patches estiverem validados.
4. Cruzar itens × kits × PvP × fog × replay determinístico × performance, então revisão pelo integrador, sem integrar antecipadamente.

## Marco B: paridade de itens confirmada por contrato 26.20–26.21

Implementado em `engine.mjs` sem alterar Skills ou a interface do integrador:

| Item/sistema | Problema anterior | Correção de escopo |
|---|---|---|
| Hexoplaca Experimental | 30% AS/15% MS sem distinção de alcance; sem recarga separada | 50% AS/20% MS corpo a corpo, 25% AS/10% MS distância, duração 8s e recarga autoritativa 30s; venda encerra efeito |
| Húbris | Sempre 10 AD +2 por stack (tratava melee como ranged) | 15 +3 para melee; 10 +2 para ranged após abate/assistência elegível |
| Furacão de Runaan | Projéteis a 40% AD | 60% AD, até dois alvos secundários visíveis com hit legal |
| Explocinturão Hextec | Ativo em 130 +25% AP | 135 +15% AP conforme patch 26.20, preservando alcance/cooldown autoritativo |
| Classificação por alcance | `u.range>.05` em coordenadas normalizadas classificava 525/550/650 unidades como melee | `isRangedChampionV453Dev69Audit` centralizado, em unidades do Atlas (15.000), aplicado a BotRK, Serpentes, Modo DPS/escudos, Youmuu, aceleração de itens, Kraken, Riftmaker, missão MID e bônus novos |

**Evidência de paridade:** Riot [26.20](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-20-notes/) (Hexoplaca, Explocinturão, Runaan), Riot [26.21](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/) (Húbris). O snapshot 16.21.1 confirma atributos estruturais, mas apresenta zero na descrição dinâmica de certos efeitos e não certifica seus escalamentos.

**QA:** `tests/v453_dev69_items_full_audit_patch2621.test.mjs` adiciona 7 testes de comportamento real, recarga, venda, snapshot e isolamento de ataques secundários. Workflow executa-os junto dos 11 testes MID e 215 regressões FAST. Suíte integral `npm test` executada em job separado com falha visível, não ignorada.

**Limites explícitos:** classificação de ranged para campeões ainda não cadastrados usa a faixa de ataque do tabuleiro e necessita exceções oficiais (p.ex., campeões melee de alcance atípico); não certificar todo o roster só com esse heurístico. Ativos de deslocamento exigem QA adicional de colisores e line-of-sight. Não temos QA Chrome de dois clientes. Todos os 210 registros permanecem não certificados até evidência por item.

### Discrepâncias estruturais, após correções

Análise remota da matriz contra Data Dragon 16.21.1: **202 itens normais, 0 divergências de integridade estrutural** (IDs/custos/receitas/revenda). Anteriormente, a auditoria identificou 47 IDs legados sem `riotId` explícito e um falso erro de ordem de receita em Navori; ambos corrigidos. Restam **8 implementações condicionais/exclusivas bloqueadas** por ausência de vínculo de motor:

- `3330` (Efígie Fiddlesticks), `3599/3600` (Lança Negra Kalista);
- `3869/3870/3871/3876/3877` (cinco evoluções da missão SUP).

Não converter esses casos em `certified` nem disponibilizar compra direta até existir resolução real de ação, evolução e ownership. Devem ser tratados em integração com os kits das duas campeãs e catálogo de missões.
