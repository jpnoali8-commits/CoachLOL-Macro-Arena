# CoachLOL — V4.5.3-dev50 (2026-10-28)

**Base:** V4.5.3-dev49, sem reset/rebase/commit e sem perda de alterações herdadas.

## Implementações concretas

- Cinco itens novos de **Summoner’s Rift PC 26.21 / Data Dragon 16.21.1**: Botas da Rapidez (3009), Botas Galvanizadas de Aço (3047), Couraça Lunar Alada (3066), Aljava Vespertina (6670) e Cintilação Etérea (3113).
- Receitas exatas, preços e atributos importados dos registros oficiais de mesmo patch. Compra de componentes e desconto por inventário reaproveitam o motor autoritativo.
- **Pés Velozes**: 25% de resistência a lentidão de Botas da Rapidez, aplicado a lentidões diretas e do EffectResolver, sem aplicação em duplicidade.
- **Barricada**: 10% de mitigação no dano principal de ataques básicos recebido por campeões com Botas Galvanizadas; não se aplica a habilidades, dano verdadeiro, DOT ou efeitos secundários independentes, em adaptação documentada ao motor.
- Manifesto versionado e engine.browser.js atualizados. Catálogo SR: 202 itens gerais = 78 ligados ao motor + 124 apenas referência; 5 evoluções condicionais e 3 exclusivos inalterados. Entradas totais locais: 81 (inclui trinkets/missões).

## Certificação e limites

- `npm run test:v453:dev50`: 14/14 PASS; `npm test`: PASS — log em `docs/QA_EVIDENCE_V453_DEV50/npm_test_full.log`.
- Testados: atributos reversíveis, preços, receitas, árvore, descontos, compra/venda indireta de componentes, escudos, ataques básicos vs habilidade, resistência a slow, snapshots.
- Abertura de `index.html` em Chromium bloqueada por `ERR_BLOCKED_BY_ADMINISTRATOR`, sem screenshot válido de loja — **NÃO certificado visualmente**.
- Ícones Riot oficiais: pacote offline ainda incompleto; DNS/HTTP indisponível neste ambiente. O instalador `tools/download_sr_icons_dev49.mjs` continua restrito a Data Dragon 16.21.1, sem fallback da Wiki. Não foram incluídos PNGs que não possuímos.
- Minion block integral e farm calibrado **não alterados**. Não declarar concluída a colisão física completa.
- 124 itens de SR gerais ainda somente referência; 78 ligados ao motor não significam 78 passivas integralmente certificadas.

## Próxima etapa

Dev51: minion block autoritativo (minion↔minion/champion), formação 3+3/3+1+3 e aggro/farm sem queda de CS; paralelo: ampliar itens por família, certificação PvP e cache Riot offline em ambiente com CDN acessível. Priorizar PvP e habilidades próprias dos 173 campeões, não IA estratégica dos bots.
