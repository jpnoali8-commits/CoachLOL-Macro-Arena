# QA — CoachLOL Macro Arena V4.5.3-dev66

## Implementações verificadas

- PvP mantém **1 humano azul (5 campeões) contra 1 humano vermelho (5 campeões)**, servidor autoritativo e snapshots por equipe.
- Novo feitiço `cleanse` (Purificar) disponível no draft, `SUMMONER_LOADOUT_V452`, ação autoritativa `summoner.queue`, combos `order.combo` e `decision.reaction`. Smite permanece obrigatório no JG.
- Purificar consome um cooldown de 240 segundos (afetado por aceleração de feitiços), remove CCs removíveis; NÃO remove `suppression`, `knockup` e `stasis`. Cancela as futuras instâncias `ignite_dot` no alvo e o efeito `exhaustUntil`; NÃO remove `grievous_wounds` de Incendiar. Fonte secundária externa: <https://wiki.leagueoflegends.com/en-us/Cleanse>.
- Durante três segundos após Purificar, aplica uma redução de CC de 75% combinada multiplicativamente com a tenacidade existente. É **adaptador parcial de treino**; não houve certificação 1:1 para todas as interações de CC persistente e tenacidade oficiais.
- Corrigido `performActionV40`: feitiços não associados a movimento continuam disponíveis sob stun/root/silence; supressão e estase bloqueiam. Flash permanece bloqueado por imobilização e sujeito a destino, visão, alcance e cooldown.
- Corrigida redução de dano de Exaustão para efeitos de habilidades do campeão; AA conserva seu fluxo existente para evitar aplicação dupla. Não alteradas tabelas de farm, IA, economia, ondas ou estruturas.
- HUD de Purificar pode enfileirar autocast **sem alvo inimigo**. O builder PvP tem CLEANSE como etapa condicionalmente habilitada; combate conserva privacidade de comandos.

## Evidências executadas

| Gate | Resultado | Arquivo |
|---|---|---|
| Feitiços CC / sessões HTTP 2×5, snapshots, autenticação | **PASS 29/29** | `dev66.log` |
| Combos Barreira → Purificar / Exaustão / privacidade, duas equipes | **PASS 14/14** | `dev66.log` |
| Chromium real 2 contextos offline usando snapshots privados do HTTP | **PASS 13/13** | `chromium_cleanse_report.json`, `dev66_{blue,red}_cleanse.png` |
| Sincronização Node/navegador | **PASS 73 exports** | `sync_browser.log` |
| Sintaxe Node `engine.mjs`, navegador `engine.browser.js`, gateway/client JS | **PASS** | `syntax.log` |
| `npm test` integral (dev16 até dev66) | **PASS saída 0** | `npm_test_full.log`, `npm_test_exit_code.txt` |

## Limitações honestas

- HTTP E2E autenticou duas sessões independentes por cookies no servidor real; **não** é uma partida humana completa de ponta a ponta.
- Chromium usa DOM original e projeções HTTP capturadas, com o POST interceptado. **Não** certifica localhost HTTP/SSE nativo nem partida inteira visual.
- Barreira, Exaustão e Cleanse foram validados somente nos casos acima. Flash e as habilidades de 173 campeões NÃO têm paridade oficial completa; não certificamos supressão interagindo com todos os estados antigos/individuais.
- Catalogação permanece **102/202** itens SR ligados ao motor e **100** somente de referência. Nenhum item foi promovido nesta entrega.
- O patch de catálogo permanece **26.21 / Data Dragon 16.21.1**. A descrição do Purificar foi validada com fonte externa, não a matriz oficial completa do patch.
- Sem mudanças em farm de lane, dano a estruturas e calibragem de duração; regressão histórica integral executada, nova amostra de 30 seeds **não rodada**.
- Desfazer da dev61, seu limite por visita física à fonte, permissões PvP, fog of war, histórico Git e assets preservados.
