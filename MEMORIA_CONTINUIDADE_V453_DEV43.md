# Memória dev43

- Base herdada dev42 completa, 2189 entradas ZIP; históricos .git devem permanecer byte a byte. Arquivos modificados incluem engine.mjs, engine.browser.js, app.js, package.json e version.json; documentação dev43 e testes adicionados.
- Motor de projéteis incremental implementado em advanceChampionProjectilesV453Dev42; campo traveledV453Dev43, contrato de projectileBarriersV453Dev43. Sem interpolação de movimento contínuo de alvos em um mesmo subintervalo.
- Irelia E: castIreliaFlawlessDuetV453Dev43 e advanceIreliaBladesV453Dev43. Segundo E aceita recast por ação do usuário / combo. Scripts automáticos de bot ainda não usam E.
- Testes dev43 19/19 e npm test integral passaram; browser original aprovado. Draft 2 partidas reais com Ezreal e Irelia, Nexus 2/2, Q do Ezreal em 198 usos agregados.
- Q da Irelia 70% AD herdado precisa ser reconciliado com 80% após 26.17 e seus testes. Seu dash continua instantâneo no tick.
- Preservar especificação de Mordekaiser R completa, sem protótipos visuais.
