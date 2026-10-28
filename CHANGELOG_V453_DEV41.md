# CoachLOL Macro Arena — V4.5.3-dev41 (27/10/2026)

Base auditada: ZIP mestre `V4.5.3-dev40`. Esta entrega NÃO reconstrói a engine e não altera o catálogo jogável (70 itens) nem importa referências automaticamente.

## Implementações reais
- `engine.mjs`: `CHAMPION_ONHIT_SKILLS_V453_DEV41` com especificações próprias dos **Qs de Ezreal e Irelia**, além do mapeamento seletivo de alcance/mana/recarga em `CHAMPION_SPELL_RULES_V382`. Os demais QWER continuam com maturidade anterior.
- **Ezreal Q, Disparo Místico:** projétil linear, limite de alcance/largura, colisão com o primeiro minion/campeão inimigo, barreira do terreno autoral e bloqueio de projétil. Acerto chama `attack(..., 'skill_on_hit')`, respeitando escudos, resistências, efeitos de itens e eliminação. Um impacto real reduz em 1,5s a recarga das QWER ainda ativas. Acerto protegido por escudo de feitiço consome o escudo e ainda reduz recargas; bloqueios em parede/guarda não reduzem.
- **Irelia Q, Surto da Lâmina:** verifica caminho e ponto de chegada nas máscaras existentes antes de cobrar mana; executa deslocamento físico (não teleporte), acerto com itens on-hit, cura autoritativa e restauração da recarga do Q quando elimina o alvo. Estase e escudo de feitiço impedem dano/procs. Mantida a simplificação de deslocamento instantâneo dentro do tick.
- **Combos e ordens automáticas:** os dois Qs seguem seus resolvedores específicos, sem bônus abstrato `Q` no ataque básico; outras habilidades não são convertidas em on-hit por engano.
- `engine.browser.js` sincronizado de `engine.mjs` pelo gerador do projeto.

## Validação real
- **18/18** novos testes `tests/v453_dev41_champion_onhit_q.test.mjs`.
- `npm test` integral **PASS** (arquivo `docs/QA_EVIDENCE_V453_DEV41/npm_test_full.log`).
- Chromium usando `index.html`, `app.js`, assets originais, `engine.browser.js`: **PASS sem exceções JavaScript**, duas capturas e relatório estruturado.
- Partidas autônomas seed 26/36/42: **1626, 1525, 1458 segundos**, três Nexuses destruídos, sem invariantes violados, média **25min36s**.

## Referência e maturidade
Referência de mapeamento (não certificação da exatidão de todas as fórmulas): League of Legends Wiki [Ezreal](https://wiki.leagueoflegends.com/en-us/Ezreal), [Mystic Shot](https://wiki.leagueoflegends.com/en-us/Template:Data_Ezreal/Mystic_Shot) e [efeitos ao contato](https://wiki.leagueoflegends.com/en-us/On-hit_effects). Dados oficiais locais do projeto correspondem a PC 26.21 / Data Dragon 16.21.1. A simulação continua adaptada para turnos, sem alegar igualdade 1:1 ao LoL. Não há tempo de voo real, colisão integral com todos os objetos, cancelamentos completos, passivas próprias completas nem kits W/E/R finalizados desses dois campeões.
