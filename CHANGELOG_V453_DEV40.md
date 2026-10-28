# CoachLOL Macro Arena — V4.5.3-dev40 (27/10/2026)

**Fonte:** ZIP mestre da dev39; mantendo patch de referência PC 26.21 / Data Dragon 16.21.1, **70 itens jogáveis locais**, 863 registros de referência e 173 perfis de referência de campeões. Nenhum catálogo foi promovido automaticamente à loja jogável.

## Mudanças no motor
- `damage`: on-hit de Arco Recurvo, Dente de Na'Shor e Mata-Cráquens é resolvido com base na validação do acerto, mesmo quando um escudo de tipo genérico absorve todo o dano à vida. Camadas de escudo físico/mágico mantêm seu comportamento do resolvedor V41. Estase, invulnerabilidade, proteção de estruturas e golpes inválidos continuam bloqueados.
- `attack`: disparo Energizado agora distingue tentativa de ataque de **golpe realmente autorizado**; escudo completo e golpe primário letal consomem a carga e concedem 6 de recarga pelo ataque básico. Cegueira/estase/invulnerabilidade não geram ou consomem cargas. Ataques contra aliados também não geram cargas.
- `attack` aceita dois tags *opt-in* `skill_on_hit` (físico) e `skill_on_hit_magic` (mágico), que resolvem um feitiço com efeitos ao contato; não transformam feitiços em ataques básicos e, portanto, não concedem Energizado nem reduzem recargas Navori. Escudos de feitiço barram o tag e os procs associados. O caminho foi testado pelo motor real, porém a sua vinculação individual a habilidades QWER ainda é pendente.
- Proc letal por item é contabilizado pelo próprio evento de dano aninhado, sem crédito duplo no acerto primário. Caso o primeiro acerto tenha sido letal, não há dano posterior em cadáver.
- `engine.browser.js` regenerado do código-fonte ESM por `tools/sync_browser_v43.py`.

## Evidências verificadas
- **16/16** novos testes em `tests/v453_dev40_shield_onhit_lethals.test.mjs`.
- `npm test` regressão integral: **PASS** (log de execução anexo).
- Chromium executado com engine real, UI principal original, loja/HUD e dois ataques controlados: **PASS, 0 erros JS**, quatro capturas e relatório estruturado.
- Seeds 26, 36 e 42: **1626 / 1525 / 1458s**, 3/3 Nexuses destruídos, média 1536,3s (**25min36s**). Sem alterações artificiais em HP, dano, ouro ou tempo.

## Não concluído/sem alegação de paridade integral
A etiqueta `ability_onhit_v453_dev40` é uma infraestrutura explícita de combate; nenhuma habilidade de campeão foi convertida indiscriminadamente. A geometria de projéteis individuais, multi-hit, multiplicadores específicos de habilidades e alguns casos de redirecionamento/evitação ainda exigem implementação por campeão. Não foi adicionada rede online nem atualizada a versão oficial do patch.
