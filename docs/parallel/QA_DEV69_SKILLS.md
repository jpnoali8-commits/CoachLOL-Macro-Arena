# Dev69 — Handoff de skills (Chat 1)

**Fonte:** `dev69/skills` — base remota auditada `b6f9cea08273bef4968ad9503d62c1a5255de81f`, `V4.5.3-dev68`.  
**Destino de revisão:** [PR #6](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/6) → `dev69/integration` (draft, sem merge).  
**Estado:** `SOURCE_READY / RELEASE_BLOCKED`; esta entrega altera somente a lógica textual, **não** certifica o game completo nem a engine no navegador.

## Contrato de implementação e maturidade

| Sistema | Status | Detalhe |
|---|---|---|
| Nami R / Onda Violenta | **implemented_tested_partial** | Projétil temporal de 850 u/s, 2750 alcance, 500 largura; dano mágico + AP, múltiplos inimigos sem dupla colisão, knockup 0,5 s e slow 70% variando 2–4 s com percurso; escudo de feitiço absorve o impacto sem CC; barreiras de projétil interrompem a onda. |
| Nami — outros Q/W/E, passiva | **partial / planned** | Q/W já são implementações herdadas parciais; E e passiva Surging Tides ainda não possuem paridade certificada; benefício de movimento da passiva na própria onda **não implementado nesta PR**. |
| Vex R / Rajada Sombria | **implemented_tested_partial** | Projétil temporal 1600 u/s; alcance por rank 2000/2500/3000, largura 260; minions recebem colisão/dano e não param o primeiro golpe contra campeão, primeiro campeão recebe marca por 4 s e revelação restrita à equipe caso não bloqueado. |
| Vex R2 | **implemented_tested_partial** | Só para alvo marcado vivo, somente time autorizado, mana/CD uma vez no R1; root/grounded/CC impedem início; deslocamento temporal de 2200 u/s em direção ao alvo, dano na chegada, sem nova cobrança; estado serializável e idempotência no servidor. |
| Vex Q/W/E e passiva | **training/planned** | Não substituídos por implementações genéricas sob rótulo de completas. |
| Combos ofensivos/defensivos | **partial_verified** | Combos `R` de Nami/Vex passam pela nova trajetória; R2 marcada usa a mesma função autoritativa; proteção por escudo e barreiras testada. |
| Fog e PvP por equipe | **verified_bounded** | Intent privada; marca revela só alvo atingido ao lançador por 4 s; outros inimigos não ficam visíveis; sessões HTTP com autenticação independente, 1 humano por time controlando cinco campeões. Duas sessões em testes são **automatizadas**. |
| Checkpoint e reconexão | **verified_bounded** | Progresso do projétil e dash persistem; receipt do gateway mantém sequência; snapshot/replay de dano consistente; duplicação recusada. |
| Browser e assets | **not_certified** | `engine.browser.js` deliberadamente não foi editado; integrador realiza sincronização Node/browser após merge. |

### Testes reproduzíveis

- `node tests/v453_dev69_nami_vex_projectiles_pvp.test.mjs`: **PASS 64/64**, inclui ambos os times, windwall, desvio lateral, minions, escudo, stuns, root no recast, visibilidade por equipe, combos, HTTP duas sessões, idempotência de sequência e restauração.
- `node tests/v453_dev68_lux_projectile_pvp.test.mjs`: **PASS 40/40**, regressão de Lux Q.
- `node tests/v453_dev43_projectiles_irelia_e.test.mjs`: **PASS 19/19**, regressão de Irelia E e projéteis.
- `node tests/v42_champion_kits.test.mjs`: **PASS 16/16**, incluindo expectativa correta de voo de Vex R e chegada do R2. Mudança de teste valida comportamento novo, sem remover verificações.
- Sintaxe Node: **PASS**.
- `dev69-skills-qa.yml`: **PASS** — [GitHub Actions](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40749939677).
- `dev69-qa.yml`: **PASS** — [GitHub Actions](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40749945620), regressões selecionadas dev61/62/64/65/66/67/68.
- `npm test` **NOT_RUN** nesta entrega. Chromium visual HTTP/SSE em duas abas **NOT_RUN**. Partida humana manual e assets binários **NOT_CERTIFIED**. Não inferir paridade oficial 1:1.

### Falhas observadas e corrigidas

- Primeiro CI falhou ao registrar impacto de Vex no ledger de histórico não inicializado; commit de correção `540631c8a0b9269a1dc4a51ce42faed936394d33`, confirmado verde.
- Auditoria ampliada encontrou teste de fog incorreto que assumia que o lançador de habilidade continuaria invisível após causar dano. Ajustado para validar a não revelação de outros aliados/inimigos; commit `467617c04a43ba852b26eff7f1638abd3a3bb732`, confirmado verde.

### Limites e tarefas para integrador

1. Revisar colisão em bordas e cenários extremos de Rift/movimento e interrompibilidade do R2 no meio do deslocamento (ainda parcial).
2. Sincronizar `engine.browser.js` **a partir da fonte integrada** (`python tools/sync_browser_v43.py`) e testar paridade Node/browser; não fazer cherry-pick do browser antigo.
3. Executar `npm test` integral, Chromium HTTP/SSE com 2 sessões, regressões de `version.json`, economy/shop, Nexus, farm e Undo da fonte; conferir assets binários do integrador.
4. Testar e implementar em fases próprias Vex reset em abate, precisão de hitbox, passivas Nami/Vex, e Q/W/E ainda não certificados.
5. Manter PR como draft até revisão e gates; se necessário rollback via revert dos commits desta PR na branch de integração, sem `reset --hard`, push forçado ou escrita em `main`.

**Arquivos desta PR:** `engine.mjs` (apenas trechos kits/projéteis e ligação dos combos/tick), `tests/v453_dev69_nami_vex_projectiles_pvp.test.mjs`, `tests/v42_champion_kits.test.mjs`, `.github/workflows/dev69-skills-qa.yml` e este relatório. Nenhum arquivo da loja/itens, `version.json` ou `engine.browser.js` foi alterado.

**Fontes de números:** manifestos da engine `CHAMPION_KITS_V42` (patch PC 26.21) e referências consultáveis [Nami](https://wiki.leagueoflegends.com/en-us/Nami) e [Vex](https://wiki.leagueoflegends.com/en-us/Vex); as velocidades/simulações são contratos parciais até revisão oficial por patch.
