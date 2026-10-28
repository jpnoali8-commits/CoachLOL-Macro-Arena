# Auditoria de engenharia V4.3 — Itens, Runas, Economia

### Resumo do diff

- `engine.mjs` é autoridade de compras, vendas e status; `engine.browser.js` gerado pelo script em `tools/` para espelhamento. Nenhum preço/stats calculado pela UI.
- `catalog` recebeu 7 itens/ampliações selecionadas, `long_sword` corrigido para +10 AD; receitas de upgrades adicionais; fonte obrigatória; limites únicos legados preservados.
- `sellItemV43` devolve 70% do custo (inteiro sem imprecisão de float) e reverte HP/mana/resistência/AP/penetrações corretamente. Itens de missão e jungle pets não podem ser vendidos neste protótipo.
- `removeRabadonV43`/`reapplyRabadonV43` fazem os +30% sobre a base atual de AP, inclusive no level-up, compra, venda e mudança de runa. Não multiplicar retroativamente um bônus já aplicado.
- `ITEM_EFFECTS_V43`: Feridas Dolorosas em dano físico/mágico por três segundos para Carrasco/Orbe; aplica inclusive quando escudo convencional absorve HP. Fonte de evento segue o resolvedor V4.1.
- `RUNE_PAGES_V43`: seleção durante pré-partida, shards estatísticos e três *efeitos protótipo*: Cometa, Fleet e Grasp, todos usando gameTime (segundos simulados).
- `economyLedgerV43`: registro local de compra/venda, minions e kills. **Não abrange TODAS as fontes de ouro** ainda. Ledger é estado da autoridade, não UI de adversário.
- `app.js`/`index.html`/`styles-v43.css`: inventário vendável em fonte e escolha de runas na loja, mantendo estilo flat preto/dourado.
- `tests/v43_items_runes_economy.test.mjs` e `tests/browser_v43_shop_runes.py`: estatísticas, passivas, privacidade básica dos snapshots, regressão e UI.

### Fontes checadas — patch e escopo

- Riot https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/ — notas de 20/10/2026, hotfix 22/10/2026 (Hubris, Dawncore, Gluttonous Greaves alterados: não classificados como completos neste catálogo).
- https://wiki.leagueoflegends.com/en-us/Long_Sword — 350g, +10 AD, venda 245g.
- https://wiki.leagueoflegends.com/en-us/Rabadon%27s_Deathcap — 3500g, +130 AP, +30% total AP.
- https://wiki.leagueoflegends.com/en-us/Ionian_Boots_of_Lucidity — 900g, +10 AH, 10 summoner haste.
- https://wiki.leagueoflegends.com/en-us/Oblivion_Orb e https://wiki.leagueoflegends.com/en-us/Executioner%27s_Calling — 800g, efeito de 3 segundos; Feridas Dolorosas aplica através de escudo normal.
- https://wiki.leagueoflegends.com/en-us/Void_Staff — 3000g, +95 AP, 40% magic pen.
- https://wiki.leagueoflegends.com/en-us/Sorcerer%27s_Shoes — 1100g, +12 magic pen.
- https://wiki.leagueoflegends.com/en-us/Mercury%27s_Treads — 1250g, +20 MR, 30 tenacity.
- https://wiki.leagueoflegends.com/en-us/Arcane_Comet — dano/alcance/cooldown variam com nível e distância, em Riot PC atual NÃO é hit imediato; nossa rune é protótipo.

### Riscos e não-conclusões

1. Legado: `CLASS_STATS` de vários campeões, números de alguns itens Doran e passivas do catálogo antigo permanecem treinamento; não extrapolar números atuais para todos.
2. `runePageV43` define uma página simplificada, não 6 slots de runas, escolhas secundárias e shards completas.
3. Não existem compra/desfaz (Undo) do LoL, loja fora da base sob regras oficiais específicas nem slot de quest da role 2026 (modelo antigo de seis slots).
4. Economia de assistência, tributo, recompensas globais, XP jungle, morte de monstros, shutdown, objetivas e wave distribution exigem revisão de V4.4–V4.5.
5. A área da skill, projectile travel-time, on-hit, crítico, regen, penetrações e regras de vários campeões ainda NÃO são certificadas.
6. Runes que provocam dano não podem causar dupla eliminação/recompensa. A V4.3 deslocou o proc após a resolução da morte do dano original, mas isso é uma medida intermediária antes do event queue transacional completo.

**Nunca alegar que V4.3 concluiu 1:1.** O programa de paridade por patch permanece em V5.0 após marcos de integração.
