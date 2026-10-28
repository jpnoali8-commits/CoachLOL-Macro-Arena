# Auditoria V4.2 — Kits por campeão, motores compartilhados e limites

## Causa raiz anterior

- `abilityRule()` possuía fallback genérico para Q/W/E/R de vários campeões; os combos de dano calculavam valores por classe, sem diferenças por skill.
- Nami W já tinha caminho próprio, Lux/Nami/Vex R possuíam geometria de linha, mas habilidades de chão e recasts não tinham API geral para mira e resolução.
- O renderer de eventos esperava sempre `vfx.from`/`vfx.to`; novos efeitos circulares causariam exceção ao serem desenhados.
- O crescimento de atributos dos campeões com growth auditado era linear; fórmula de crescimento é não linear. AP de classe artificial também aparecia como atributo base e crescia por nível; corrigido para os cinco campeões auditados.

## Contratos V4.2 executáveis

- `CHAMPION_KITS_V42`, `kitSpellV42()`, `KIT_PATCH_V42=26.21`: dados por campeão/skill com certificação `partial`/`data_only` e estágios por habilidade.
- `skillshotHitsV42`: geometria de linha, largura e colisões em ordem com cap; `areaHitsV42`: raio e hit determinístico. Lux Q possui no máximo **duas colisões**, incluindo minions, e spell shields não deixam o root atravessar.
- `queueKitSkillV42`: valida equipe, fase, ranque, mana, recarga, ponto e acesso navegável; não consome recursos enquanto se aproxima; `resolveKitSkillsV42` chama `performActionV40` **uma vez** no cast efetivo. Estados persistem em `snapshotV40`.
- **Nami Q**: deslocamento até alcance 850, AoE e dano por rank; CC de *suspension* está representado provisoriamente por stun tenacidade-sensível, sem marcador separado de airborne.
- **Lux Q**: skillshot limitado a duas unidades, enraizamento por 2s e bloqueio por escudo de feitiço. Wall collision e tempo de voo ainda são protótipos.
- **Lux E**: zona com raio 310, slow por status ledger, detonação manual/automática após 5s simulados e sem custo duplicado na segunda ativação. Mira por clique no mapa, VFX circular.
- **Vex R**: primeiro disparo e marca, segunda ativação com dano distinto sem nova mana. Dash, resets por abate e imunidade a deslocamento ainda não são totalmente fieis.
- **Nami W/R e Lux R** mantêm adapters legados (revisados nos números). Ainda não seguem todo o pipeline de efeitos/tempos de voo.
- **Atributos base e crescimento** para Nami, Lux, Vex, Jinx e Ahri: HP, mana, AD, armadura, MR, velocidade de movimento, alcance de ataque e AP natural igual a 0. Base/aumento por nível exportados para `data/champion_stats_v42.json`; não inclui velocidade de ataque e regeneração certificados.
- **Jinx e Ahri** possuem metadados/status básicos; não são kits implementados e mantêm `data_only`.

## Riscos conhecidos e pendências explícitas

1. Kits completos e passivas: **nenhum campeão certificado 1:1**. Nami E, Lux W, passivas e habilidades QWER restantes de Vex/Jinx/Ahri precisam de handlers próprios.
2. Skillshots resolvem impacto no tick lógico em vez de simular trajetórias contínuas com velocidade, paredes e interações complexas de bloqueio. Nami Q não modela o atraso de ~0,99s.
3. VFX em tela são marcadores flat 2D temporários; modelos, vídeo e efeitos cinematográficos finais continuam em V4.7/4.8.
4. O replay atual usa snapshots restauráveis; reconstrução causal integral ainda está pendente. A visibilidade do cliente PvP depende de um servidor autoritativo futuro.
5. Salvos históricos continuam em snapshot v4 e `CHAMPION_KITS_V42` é compatível com fallbacks; a mudança de growth audita cinco campeões com atributos base específicos, não toda a lista.
6. Licença: usar informações públicas como referência de lógica; não distribuir recursos proprietários adicionais sem direitos de uso.

## Referências (Summoner's Rift PC, acessadas em 26/10/2026)

- Riot, notas oficiais Patch 26.21: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Nami, incluindo Q/W/R: https://wiki.leagueoflegends.com/en-us/Nami
- Lux, incluindo Q/E/R: https://wiki.leagueoflegends.com/en-us/Lux
- Vex R e recast: https://wiki.leagueoflegends.com/en-us/Vex
- Jinx atributos base: https://wiki.leagueoflegends.com/en-us/Jinx

**Atenção:** a Wiki pode mudar e não fornece contrato de API estável. Novos patches exigem reauditoria e atualização dos testes de fórmula.
