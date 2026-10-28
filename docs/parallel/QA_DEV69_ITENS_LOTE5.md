# CoachLOL Dev69 — Batch 5: utilidade e suporte (15 itens)

**Origem:** `dev69/items-batch4` no commit `b28ea12044791c35e68a19e388bfe1c69b803a63` (PR #12 não integrado). **Head:** `dev69/items-batch5`, PR empilhado em Batch 4; não mesclar até o usuário solicitar ao auditor. Patch PC 26.21 / Riot Data Dragon 16.21.1 arquivado no repositório.

## Matriz individual

| ID Riot | ID local | Preço/venda | Receita por Riot ID | Efeito executado no motor | Paridade |
| --- | --- | --- | --- | --- | --- |
| 2065 | shurelyas_battlesong | 2200 / 1540 | 3113+4642 | Ativo: velocidade para aliados próximos durante 4s, cooldown do portador | Parcial (aura móvel) |
| 3107 | redemption | 2300 / 1610 | 3108+3114 | Ativo com ponto de aliado, explosão retardada: cura de aliados e dano verdadeiro em inimigos visíveis | Parcial (área, efeitos em fog, valores de monstro) |
| 3190 | locket_of_the_iron_solari | 2200 / 1540 | 3067+1029+1033 | Ativo: escudo de equipe com tempo e proteção individual | Parcial (decaimento contínuo) |
| 3222 | mikaels_blessing | 2300 / 1610 | 3067+3114 | Ativo direcionado: remove CC exceto knockup/supressão; cura | Implementado; não certificado |
| 3109 | knights_vow | 2300 / 1610 | 3067+1031+1006 | Vínculo com aliado, 14% dano de HP redirecionado, 12% cura quando aliado ataca | Parcial (prioridade de dano/compartilhamento) |
| 3504 | ardent_censer | 2200 / 1540 | 3113+3114 | Curar/escudar aliado dá AS temporária e mágico on-hit em golpes reais | Implementado; não certificado |
| 6616 | staff_of_flowing_water | 2250 / 1575 | 3108+3114 | Curar/escudar aliado concede AP/haste temporários sem mutar stats permanentemente | Implementado; não certificado |
| 6617 | moonstone_renewer | 2200 / 1540 | 3067+4642 | Espalha 30% cura ou 35% escudo a segundo aliado sem recursão | Implementado; não certificado |
| 6620 | echoes_of_helia | 2200 / 1540 | 3067+4642 | Cargas por dano de campeão; cura extra ao proteger aliado; consome 1 vez | Parcial (fórmula por carga) |
| 6621 | dawncore | 2500 / 1750 | 1026+3114+3114 | Mana regen base converte em AP e cura/escudo derivados sem aplicar duas vezes | Implementado; não certificado |
| 4005 | imperial_mandate | 2400 / 1680 | 1052+4642+1052 | CC inimigo marca; amplifica dano campeão durante 4s | Parcial (regras de consumo da marca) |
| 3050 | zekes_convergence | 2200 / 1540 | 3067+1029+1033 | Ultimate válida ativa tempestade: dano periódico e slow AoE | Parcial (cooldown de proc e raio exato) |
| 2524 | bandocanos | 2300 / 1610 | 3067+1029+1033 | Slow/CC aciona aura de velocidade/AS de equipe | Parcial (duração não numérica na fonte) |
| 3137 | cryptbloom | 3000 / 2100 | 4630+3108+3108 | Eliminação creditada ativa cura radial para aliados com cooldown único | Parcial (curva precisa de cura) |
| 3146 | hextech_gunblade | 3000 / 2100 | 1053+3145+1052 | Ativo direcionado em inimigo visível: mágico + lentidão e cooldown | Parcial (valores dinâmicos na fonte) |

**Todos os 15 têm efeito real implementado, nenhum foi certificado 1:1 com LoL PC.** Existem aproximações explicitadas na coluna Paridade. Os 35 itens restantes ficam `reference_only`, indisponíveis no motor. Não liberar apenas por metadados.

## Arquitetura e segurança

- Registro de regra `ITEM_SUPPORT_RULES_V453_DEV69_B5` e callbacks `afterSupportProtectionV453Dev69B5`, `afterSupportCCV453Dev69B5`, `afterSupportDamageV453Dev69B5` e `afterSupportKillV453Dev69B5` na **engine Node autoritativa**, sem imports ESM ou duplicar motor.
- `EffectResolverV41.heal/apply` emitem efeitos somente após cura/escudo ou CC válidos; `this._supportRelayV453Dev69B5` impede cascatas recursivas. Alvos secundários são escolhidos pelo servidor apenas entre aliados, vivos e próximos.
- Ação `item.activate` usa `targetId` opcional em `multiplayer/authoritative_actions_v453_dev44.mjs`, com validação no motor de team, owner, equipamento, alcance, HP, status e visão do inimigo, e cooldown individual. O cliente não escolhe dano, cura, visão nem preço.
- Estado do campeão em snapshots registra cooldowns, buffs, cargas, alvo do Juramento e explosões de Redenção pendentes. Redirecionamento do Juramento ocorre após escudos e antes de dano à vida, sem novo redirecionamento recursivo.
- Revenda encerra efeitos próprios e impede uso posterior de ativos removidos. Economia com receita recursiva consome componentes físicos uma única vez. Undo LIFO é revogado definitivamente ao sair fisicamente da fonte, inclusive ao retornar ou reconectar.
- **Restrições de integração:** manter 2 humanos x 5 campeões, fog por equipe, Nexus natural, Skills inalteradas, `engine.browser.js` somente na integração; `main` intocada. Não há UI nova de seleção de alvo neste PR; a ação autoritativa já aceita `targetId`.

## QA FAST

Executado localmente em workspace dev68 + patches cumulativos dos lotes, **não checkout binário idêntico ao GitHub combinado**:

- `node --check engine.mjs` e `node --check multiplayer/authoritative_actions_v453_dev44.mjs` — PASS.
- `node tests/v453_dev69_items_batch5_support_family.test.mjs` — **23/23 PASS**.
- Anteriores: B4 **26/26**, B3 **19/19**, B2 bulk **23/23** + Anular **11/11**, B1 **8/8**, dev61 **22/22**, dev62 **18/18**, dev64 **26/26**, dev68 **40/40** — PASS.
- **216 testes locais aprovados**, sem omitir ou desativar contratos anteriores.

## Não certificado / gates do auditor

- Paridade exata de áreas/decadência, valores por versão de patch, gatilhos de passivas com múltiplos itens, reação real em duas sessões, VFX e controle HUD para ativáveis direcionados.
- GitHub CI de Skills + Items, `npm test` integral e Chromium **não executados neste lote especializado**. Esperar a integração sequencial PR #10 → #11 → #12 → Batch 5 pelo Chat Auditor, por solicitação do usuário.
- Browser gerado por `python tools/sync_browser_v43.py` **apenas na integração**. Release condicionada também aos assets remotos (Issue #1), Nexus/Undo/fog/reconexão e ZIP CRC/SHA.
- Rollback por `git revert` deste PR. Não force push, reset hard nem sobrescrever `engine.mjs`.