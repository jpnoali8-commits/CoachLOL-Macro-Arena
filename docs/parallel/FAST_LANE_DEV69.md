# CoachLOL — Produção paralela rápida (dev69+)

**Ativo a partir de 2026-10-28.** Base de engenharia: `dev69/integration` contendo PRs #6/#7; referência V4.5.3-dev68 preservada no ZIP mestre. `main` bloqueada para release até os gates.

## A regra que reduz o custo dos três chats
- **Chat 3 é o único integrador**: servidor PvP, engine consolidada, `engine.browser.js`, QA integral, versionamento e release. Decide contratos comuns e conflitos.
- **Chat 1 Skills**: trabalha apenas em `dev69/skills`, com *um lote coerente* de kits/projéteis/recasts por PR. Não mexe em catalogação, UI geral, browser nem versão.
- **Chat 2 Itens**: trabalha apenas em `dev69/items`, com *um lote coerente* de itens/efeitos/receitas por PR. Não mexe em skills, UI geral, browser nem versão.
- **Não é necessário abrir novo chat/PR para cada correção pequena.** Fazer múltiplos commits no mesmo lote, executando localmente testes específicos. Somente enviar o PR quando o lote estiver pronto; abrir um novo PR apenas para um lote novo.
- Cada chat **só executa trabalho quando acionado pelo usuário**; múltiplos chats não são jobs assíncronos. Podem ser abertos em paralelo e alternados. Não esperar que ajam sem comandos.

## Fluxo de cada lote (não burocrático)
1. Especialista confere head e estado da branch `dev69/integration`. Incorpora a base nova por merge seguro na branch de trabalho antes de iniciar lote; **nunca `git reset --hard` / force push / sobreposição completa da engine**. Se o trabalho existente divergiu, preservar os commits e adaptar somente conflitos de função.
2. Implementar o lote com testes de contrato: comportamento anterior falha, comportamento novo passa, e invariantes básicos (fog, ownership, receipt, custos/CC, Undo, farm).
3. Rodar **somente testes focalizados** e `node --check` na branch do especialista. Citar no PR os comandos executados e o SHA testado. Sem tabelas gigantes de QA ou reproduzir documentos de versões anteriores.
4. Abrir **um PR** por lote para `dev69/integration`, com 5 informações curtas: efeito implementado, arquivos/funções tocados, QA, pendências honestas e rollback por revert. Não editar `engine.browser.js`.
5. Integrador revisa funções/hunks, evita substituição total de `engine.mjs`, mescla **um PR por vez**, roda CI rápido no estado conjunto e corrige testes antigos apenas quando sua semântica realmente mudou.
6. Após receber os **dois lotes** ou ao atingir um milestone, gerar browser pelo script oficial e executar **`npm test` integral uma vez na integração consolidada**. `npm test` não precisa ser repetido em cada branch, mas deve estar verde antes de promover release.
7. Para release: conferir assets do remoto, browser real, HTTP/SSE duas sessões, fog, Undo, reconexão, Nexus natural, resultados, versão, ZIP completo CRC/SHA e histórico legado. **Nunca mesclar `main` sem isso.**

## Três níveis de QA
- **FAST (especialistas):** testes novos, Node syntax e regressões da área afetada; ordem de segundos/minutos.
- **INTEGRATION (Chat 3):** `npm run test:v453:dev69:integration`, igualdade `tools/sync_browser_v43.py` e regressões dev61–68; executa após merges.
- **RELEASE (Chat 3):** `npm test` completo + Chromium visual 2 sessões + assets do clone + Nexus/Undo/fog + auditoria de ZIP, Git, licença e hashes. Só essa etapa permite declarar dev69 release.

## Contratos invioláveis
- Um humano controla cinco campeões azuis e outro controla cinco vermelhos, turnos simultâneos e servidor autoritativo. Não trocar por bot/10 humanos.
- Último golpe real e waves 3 melee+3 caster (+ canhão); Nexus natural; visão privada, incluindo reconexão, sem ID escondido no payload.
- Undo de compras é revogado irrevogavelmente após **sair fisicamente da fonte**, mesmo que retorne ou reconecte.
- Sem `engine.mjs` substituída, `engine.browser.js` gerada somente pelo integrador. Sem atalhos de itens reference-only virarem jogáveis.
- Persistir status real: `implemented`, `partial`, `reference-only`, `certified` somente com evidência.

## Os dois próximos lotes (sugestão de escopo, não trabalho assíncrono)
- **Skills:** completar contratos interrompíveis da Vex R2 e Nami R (CC, colisão, knockup/slow, passiva aplicável), testar paths de duas sessões; evitar refatorações globais.
- **Itens:** ampliar pequeno conjunto SR por risco baixo, com receitas/revenda/origem documentadas e testes de gold/Undo/kill; manter estado dos não implementados.
- **Integração:** corrigir o teste legado v39 da Nami/Vex temporal, garantir CI verde após os merges anteriores, avançar plano de distribuição binária sem atrasar desenvolvimento de lógica.

## Sobre modularização
A engine `engine.mjs` ainda é monolítica e `tools/sync_browser_v43.py` apenas remove exports do texto para gerar um único browser JS. **Não** inserir imports ESM/arquivos novos na engine sem primeiro introduzir um build/bundle dual que preserve Node e browser e passe as regressões. Enquanto isso, isolar código por funções e contratos, extraindo módulos somente depois de provar o build.
