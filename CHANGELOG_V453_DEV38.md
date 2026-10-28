# CoachLOL Macro Arena — V4.5.3-dev38 (27/10/2026)

## Base imutável e escopo

- Desenvolvida sobre o ZIP mestre original da dev37, cuja integridade CRC foi confirmada antes da extração.
- Nenhuma ação destrutiva de Git, nenhum commit/reset/rebase. Histórico `.git` e alterações herdadas mantidos.
- Patch de referência congelado em **26.21 / Data Dragon 16.21.1**; **863 itens de consulta, 70 itens jogáveis locais**, **173 fichas** arquivadas, sem liberar registros estáticos sem implementação.
- Arquitetura Node (`engine.mjs`) e navegador (`engine.browser.js`) mantidas sincronizadas por `tools/sync_browser_v43.py`.

## Lote de passivas aplicadas no motor real

**Estilingue do Patrulheiro (3144):** Bullseye com dano mágico adicional de 40 em alvo campeão efetivamente ferido, recarga simulada de 40s e abatimento de 1s por ataque básico real. Condicionado ao item permanecer equipado; venda/recompra recomeçam a disponibilidade. Não dispara outra cópia de si próprio por recursão de proc. O modelo de dano integrado ao CoachLOL é uma adaptação, não LoL 1:1.

**Canhão Fumegante (3094):** Energize de 0–100 cargas: +6 por ataque básico e 1 a cada 24 unidades de movimento efetivo por caminhos (`moveAlong`), com precisão subinteira, persistência em snapshots e teto de 100. Ao alcançar 100, o **próximo ataque válido** tem alcance +35% limitado a 150 unidades e aplica dano mágico 40, consumindo a carga e gerando as 6 cargas normais do ataque. Funciona no motor autoritativo de combate e na busca de candidatos, não somente texto. Evolução do Estilingue não mantém Bullseye; consumo de componentes e desconto continuam válidos.

**Anel de Doran (1056):** +5 de dano físico aos minions em ataque básico (inclusive previsão de last hit), regeneração adicional de 1 mana/s, ou 2 mana/s durante 5 segundos após ferir campeão adversário com fonte `basic` ou `spell`. Campeões sem recurso de mana convertem 45% dessa regeneração em cura. Modelo de segundos discretos do CoachLOL, somado à regeneração-base já existente.

## Contratos, snapshots, HUD e isolamento

- Estados por campeão isolados (tempo do Bullseye, carga Energizada, bônus temporário do Anel) persistem por snapshot. Snapshots de versões antigas ganham defaults seguros sem descarte de estado.
- Venda/recompra reinicializam a carga ou recarga do item pertinente; efeitos não permanecem após consumir componente.
- Loja exibe as condições funcionais (alcance, dano, mana) e distingue as adaptações parciais do pacote de referência.
- Fórmula de alcance é checada antes de escolher alvo e volta ao valor original após uso. Colisores, moitas, fog, disputa de Golpear, Rift Elemental, objetivos e UI original não foram substituídos.
- Fontes aninhadas `item_bullseye_v453_dev38` e `item_energized_v453_dev38` não encadeiam procs de runa/alma/Ancião indevidos.

## Evidências executadas

- `node tests/v453_dev38_item_passives.test.mjs`: **13/13 PASS**, incluindo dano, cooldown, minions, alcance efetivo, movimentação `moveAlong`, escudos/estase, inventário, upgrade, venda/recompra e snapshots antigos/atuais.
- `npm test`: **PASS**, abrangendo todos os testes prévios mais os 13 novos (log na pasta de QA).
- Chromium: **PASS** com app original, screenshot real de cada item, compra Estilingue → Canhão e proc energizado confirmados no motor do cliente; nenhum erro JavaScript capturado.
- 3 simulações baseline com seeds 26/36/42: **3/3 Nexus destruídos naturalmente**, 1626s / 1525s / 1458s, média 1536,3s (25min36s), sem falhas de invariantes. Não foram aplicados encerramento temporizado nem alterações artificiais de HP/dano/ouro para ajustar a duração.

## Fontes e ressalvas

- Primária arquivada: dados de itens oficiais 16.21.1 recolhidos e integrados na dev36 (descrições e stats). Complemento para números omitidos pelo Data Dragon: LoL Wiki: https://wiki.leagueoflegends.com/en-us/Scout%27s_Slingshot e https://wiki.leagueoflegends.com/en-us/Rapid_Firecannon (fontes secundárias sujeitas a revisão).
- Energize ainda não leva em conta todos os blinks, dashes, deslocamentos e habilidades on-hit, nem modelos completos por campeão. O movimento modelado é o percurso realmente caminhado via `moveAlong`.
- O dano energizado no CoachLOL precisa de ataque original que conecte; não é uma emulação exaustiva das regras de efeitos ao contato do LoL.
- Mana do Anel usa ticks inteiros; sua taxa atua **além** da regeneração-base do motor. Escudos e aplicação em outros modos não foram certificados em equivalência total.
- Não afirmar que os 70 itens possuem todas suas passivas, ou que as 173 fichas equivalem a campeões completos.
