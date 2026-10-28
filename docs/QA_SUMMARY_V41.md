# Resultado de QA V4.1 (26/10/2026)

- `npm test` passou; **197 indicadores ✓** no log agregado, incluindo 20 testes V4.1 em `tests/v41_effect_resolver.test.mjs`.
- `node tests/v20_long_match.mjs 300 26` passou, `errors: []`, sem invariantes violadas.
- Chromium via HTML/CSS/JS injetados inline: **0 erros JS**, abertura de atributos e exibição de `root 5s` na HUD; isto NÃO valida assets remotos/locais via servidor.
- `npm run test:v41` roda a suíte nova isoladamente.
- A prova automática não significa paridade completa LoL, servidor autoritativo nem ausência universal de bugs.
