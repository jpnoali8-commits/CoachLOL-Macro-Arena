# CoachLOL dev69 — Status de colaboração

**Atualizado em 2026-10-28. Status: SOURCE_READY / RELEASE_BLOCKED.**

A base dev68 **textual funcional** foi importada na branch `import/dev68-staging`: **1.624 arquivos** JS/MJS/JSON/HTML/CSS/MD/PY/SVG/testes, sem substituir por stubs. Uma cópia leve está na Biblioteca ChatGPT em `/CoachLOL/Dev69/CoachLOL_Dev68_Fonte_Textual_Para_3_Chats.zip` (5.443.580 bytes; SHA-256 `561563dbc3984b2188275a48da3ada1bfaa228556331e2b60e410ea705e4be8c`).

**Agora liberado:** trabalho de programação e testes de lógica nas branches `dev69/skills`, `dev69/items` e `dev69/integration`, desde que cada uma tenha sido avançada ao mesmo commit de base importada. As duas primeiras fazem commits e PR para a terceira, nunca diretamente para `main`.

## Evidências

- Os arquivos remotos `engine.mjs`, `engine.browser.js`, `app.js`, `version.json`, `package.json` e `tests/v453_dev68_lux_projectile_pvp.test.mjs` foram comparados com o conteúdo de origem: igualdade exata dos conteúdos textuais.
- Em workspace local isolado reconstruído **somente desses 1.624 arquivos**, passaram: `test:v453:dev61` (22/22), dev62 (18/18), dev64 (26/26), dev65 (28/28), dev66 (ambos scripts, saída 0), dev67 (48/48) e dev68 (40/40).
- **Não** foi executado `npm test` integral no pacote textual reduzido; não declarar aprovado.
- Testes de assets, renderização visual e paridade de navegador **não certificados** nessa importação.

## Limites — não declarar release/dev68 integral no GitHub

- O ZIP mestre original é `CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`, 160.356.099 bytes, SHA-256 `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`.
- De 2.549 entradas do ZIP mestre, **1.624 arquivos textuais foram importados**; imagens, assets binários, caches e outros arquivos não textuais ainda precisam ser tratados para um clone completo.
- Os **566 arquivos internos .git do ZIP** continuam preservados no ZIP original da Biblioteca, mas **não foram migrados como histórico ao novo remoto**. A história remota foi inicializada separadamente; não alegar equivalência de históricos.
- `main` continua com documentação bootstrap, sem game completo. **Não mesclar PR dev69 em main nem publicar ZIP mestre de dev69 até resolver o bloqueador #1 e validar o full clone.**

## Estrutura

- **Chat 1**: [CHAT_1_SKILLS.md](CHAT_1_SKILLS.md), Issue #2, branch `dev69/skills`.
- **Chat 2**: [CHAT_2_ITENS.md](CHAT_2_ITENS.md), Issue #3, branch `dev69/items`.
- **Chat 3**: [CHAT_3_INTEGRACAO.md](CHAT_3_INTEGRACAO.md), Issue #4, branch `dev69/integration`.
- Protocolo: [FLUXO_DE_PR_E_QA.md](FLUXO_DE_PR_E_QA.md); [MODELO_HANDOFF.md](MODELO_HANDOFF.md); [ESCOPO_E_CONFLITOS.md](ESCOPO_E_CONFLITOS.md).
