# CoachLOL Macro Arena — V4.5.3-dev37 (27/10/2026)

## Origem e preservação

- Continuada diretamente a partir do ZIP mestre da **V4.5.3-dev36**, com `.git`, código, imagens, máscaras originais e documentação legada preservados.
- Não houve `git reset`, `git clean`, `rebase` nem `commit`. O projeto recebido continha alterações já não consolidadas no repositório; nenhuma foi descartada.
- Patch de referência mantido em **26.21 / Data Dragon 16.21.1**. Nenhuma mudança automática de patch altera o motor.

## Motor de itens e economia

- **70 itens jogáveis locais**, antes 67. Novo lote: `scouts_slingshot` (3144), `blighting_jewel` (4630), `seekers_armguard` (2420).
- **Cinco receitas reconciliadas com os IDs oficiais**: Giant's Belt (1011), Rapid Firecannon (3094), Serrated Dirk (3134), Void Staff (3135), Zhonya's Hourglass (3157).
- **Anel de Doran**: preço corrigido 450→400 ouro; HP 70→90; removido bônus incorreto de +35 mana. Regeneração e dano extra contra minions ainda não codificados.
- **Zhonya**: 90→105 AP, com base no item JSON 16.21.1 coletado. Estase alterada de 3 para **2,5 segundos** (ação real e status com controle de cooldown).
- **Joia da Ruína**: +25 AP e 13% penetração mágica agora aplicados pelo `damage()` do motor.
- **Estilingue do Patrulheiro**: +20% velocidade de ataque, receita 2× Adaga; efeito passivo Bullseye **não implementado** por ausência de escala comprovada e QA próprio.
- **Armaguarda da Caçadora**: +40 AP/+25 armadura; ativo real de estase por 2,5 segundos **uma vez por compra**, com estado persistente em snapshot e trava no comando autoritativo. O item permanece após o uso. UI de reações e painel de habilidades permitem usá-la.
- Descontos e consumo de componentes múltiplos testados; venda e recompras preservadas. Bloqueio adicional contra agendar trinkets como se fossem itens normais.
- `engine.browser.js` sincronizado a partir de `engine.mjs` via `tools/sync_browser_v43.py`.

## Catálogo e interface

- Referência oficial de **863 itens** permanece somente consulta. Novas saídas versionadas: `data/riot_reference/catalog_26_21_dev37.json` e `.js`, sem sobrescrever os arquivos `dev36`.
- **70/70** IDs locais ligados a registros oficiais; nenhuma receita divergente permanece para esses 70; apenas os **dois preços de evolução por missão** diferem do campo bruto Data Dragon por motivos de regra.
- `catalogo_riot_26_21.html` agora aponta para o snapshot atualizado; a loja jogável foi expandida em apenas três itens revisados.
- SVGs locais originais adicionados para os três novos itens como fallback de ícone.

## QA executado

- `node tests/v453_dev37_item_reconciliation.test.mjs`: **10/10 PASS**.
- `npm test`: **PASS** (inclui toda a regressão histórica).
- Chromium, código original da interface e motor: **PASS**, 0 erros JavaScript. Testadas árvore profunda do Canhão Fumegante, compra e ativação da Armaguarda por clique; dois PNGs reais.
- Partidas automatizadas, seeds 26/36/42, perfil baseline: **3/3 Nexus destruídos organicamente**, sem erros de invariantes. Tempos: **1471s / 1388s / 1392s**, média **1417s (23min37s)**. Não calibrar artificialmente para ~30min.

## Limitações explícitas

- Ainda não há passiva Bullseye do Estilingue, nem energização funcional certificada do Canhão; sua `ITEM_EFFECTS_V43` continua `registered_not_implemented` para a passiva.
- Estase de Armaguarda e Zhonya testada como adaptação do CoachLOL; não alegar correspondência perfeita com todas as regras da Riot.
- Apenas os atributos selecionados e receitas do lote foram reconciliados; passivas de outros itens, 246 candidatos da loja e 173 kits de campeões exigem auditoria individual.
- A simulação de 3 partidas é uma amostra, **não prova estatística de balanceamento**. Duração média foi ligeiramente menor que a faixa almejada.
- Ícones de CDN externa não são certificáveis no fixture Chromium offline (`page.set_content`); SVGs locais existem no ZIP. Integração ponta a ponta servida por HTTP e partidas orgânicas manuais em navegador não foram executadas.
