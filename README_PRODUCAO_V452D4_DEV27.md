# README — CoachLOL Macro Arena V4.5.2d-4-dev27

## Como executar
Abra `index.html` no navegador compatível. O projeto usa motor offline e assets locais. Para rodar testes, use `npm test`; contratos novos via `npm run test:v452d4:dev27`.

## Progresso
- Detecção Oracle e pink respeitam linha de visão até wards inimigas.
- Dados privados de wards inimigas não são enviados pela perspectiva pública da equipe.
- `perspective()` calcula fontes uma única vez por chamada.
- 10/10 Nexus em regressão, média 27min29s; 10/10 hashes iguais à dev26.

## Próximo incremento
- Fluxo browser mais abrangente; auditoria de custos densos; primeiro lote validado de itens, receitas e efeitos.

Leia `docs/{QA,MEMORIA,ROADMAP}_V452D4_DEV27.md` e `CHANGELOG_V452D4_DEV27.md`. Não limpe `.git` nem reescreva o motor a partir de versões antigas.
