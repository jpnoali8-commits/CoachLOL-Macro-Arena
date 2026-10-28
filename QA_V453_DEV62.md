# QA — CoachLOL V4.5.3-dev62

## Evidências
- `npm run test:v453:dev61`: **PASS 22/22**.
- `npm run test:v453:dev62`: **PASS 18/18** em duas sessões HTTP distintas, diferentes cookies e autenticação Azul/Vermelho, 5 unidades por equipe, cotações privativas, escopo de catálogo, compra, venda, Undo, role/isolation e double-ready.
- `tools/chromium_pvp_dev62_two_sessions.py`: **PASS 13/13**, dois contextos Chromium separados; seletores reais, clique comprar, vender, Desfazer, desfazer venda, preços, referência não comprável, confirmação simultânea, capturas em `docs/QA_EVIDENCE_V453_DEV62`.
- Chromium `page.goto` localhost: `ERR_BLOCKED_BY_ADMINISTRATOR`. A validação DOM prosseguiu com `page.set_content` e ponte Python para endpoints reais do servidor Node; **não** certifica transporte HTTP/SSE nativo, `mapa_atualizado.jpg` ou streaming visual real.
- `npm test`: **PASS**, regressão integral incluindo dev62 (log `docs/QA_EVIDENCE_V453_DEV62/npm_test_full.log`).
- Engine browser sync: **PASS**, `python tools/sync_browser_v43.py`, 73 exports, sintaxe Node/browser PASS.

## Não certificados
- Partida de 2 jogadores humanos concluída naturalmente por destruição do Nexus: **NOT_RUN**.
- Combos completos QWER de todos os campeões, feitiços/reações em jogo longo, mutações de fog após 30min e permanência de ambos online: **NOT_CERTIFIED**.
- Ícones Riot Data Dragon offline e 100 itens SR reference_only tornarem-se jogáveis: **NOT_IMPLEMENTED**.
- Qualidade e fluidez do board em Chromium com todos os assets HTTP: **NOT_CERTIFIED** (mapa não carregou no modo ponte).
- Regressão de farm após alterações de motor: não aplicável, nenhum código de motor de farm alterado.

## Segurança
- Servidor mantém validação por cookie HttpOnly/SameSite Strict, ownership, sem aceitar valor do cliente como preço de compra ou devolução.
- Quotes não vazam dados de unidades da outra equipe; respostas Undo apenas para os cinco campeões da equipe autenticada.
- O cliente nunca pode reverter negócio após saída física da fonte nem após evento de estado invalidante (regras dev61 sem alteração).

## Comandos
```bash
npm run test:v453:dev61
npm run test:v453:dev62
npm test
python tools/chromium_pvp_dev62_two_sessions.py
```
