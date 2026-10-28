# QA — V4.5.3-dev34 (27/10/2026)

## Gates executados
- `npm test` integral: **PASS (exit 0)**, saída preservada em `docs/QA_EVIDENCE_V453_DEV34/npm_test_full.log`.
- `tests/v453_dev34_future_patch_gates.test.mjs`: **20/20 PASS**.
- `tests/v453_dev33_patch_center.test.mjs`: **7/7 PASS** (herdados).
- Verificação de sintaxe dos arquivos alterados: **PASS**.
- Feed offline (26.22/16.22.1): detectado como **PREVIEW**, não ativo; só usa fixture, não confirma arquivo oficial baixado.
- Hashes SHA-256 do `engine.mjs`, `engine.browser.js`, `app.js`: idênticos à dev33; nenhum patch aplicável ao combate.

## Simulações da mesma composição — dev34 vs dev33
| Seed | Duração (dev34) | Vencedor | Nexus destruído naturalmente | Hash final | CPU dev34 |
|---|---:|---|---|---|---:|
| 26 | 25:50 | red | sim | c6909b2f4a28e4408f58f4c6 | 3983 ms |
| 36 | 27:21 | red | sim | 2dee82d278108fa0e1727197 | 3868 ms |
| 42 | 20:53 | red | sim | 2424b06d3ce5ecf8ed90b301 | 2517 ms |

- **3/3** terminaram naturalmente e **3/3** mantiveram **exatamente os mesmos hashes, vencedores e tempos** que a dev33.
- Média dessas três seeds: **24:41**; amostra pequena, não uma estimativa universal. O usuário aceita partidas um pouco abaixo de 30 minutos.
- Nenhum timer de término forçado.
- **Chromium nesta etapa:** não executado; UI e motor não sofreram alterações. Capturas de etapas anteriores não são apresentados como testes novos.

## Limitações/pendências
- Download externo do `item.json` oficial integral falhou por resolução de rede; referência completa **não carregada**.
- Nenhum update 26.22 foi publicado como ativo na data desta etapa.
- Candidatos de patch após lançamento ainda exigem validação de fontes, kits QWER, aprovação humana e testes; o gate não altera binários do motor.
- A loja contém **67 itens locais**, sem certificação de catálogo integral nem de todos os ativos/passivos.
- Simulação de toda a variedade de composições não foi repetida; apenas três seeds de controle para garantir ausência de regressão.

## Git
Histórico `.git` incluído no pacote, alterações preexistentes preservadas. Nenhum reset/checkout/commit ou limpeza automática foi realizada.
