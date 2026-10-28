# CoachLOL V4.5.2d-4-dev28 — Radar Oracle correto e partida automatizada no navegador

Esta é a **base canônica dev28** construída sobre a dev27, sem limpar, rebasear ou resetar o Git herdado.

## Executar
1. Abrir `index.html` offline, preferencialmente em navegador Chromium atualizado, ou servir a pasta por servidor estático local.
2. `npm test` executa todas as suites históricas e os dez novos testes do Oracle.
3. `python tests/browser_v452d4_dev28_oracle_through_walls.py` exercita o radar no Chromium (carga de 15 SVGs e atlas originais reduzidos só para teste).
4. `python tests/browser_v452d4_dev28_full_match.py` executa um jogo 5v5 automatizado **dentro da página do jogo**, até o Nexus e o pós-jogo, seed 26, duração simulada 33:10. Não é jogo manual completo, draft interativo nem certificação de PvP.

## Alteração de regra
* **Oracle/Radar:** detecção radial sem teste de raycast, passando por paredes e moitas. Não dá visão normal do local nem permite ataque através de parede.
* **Pinks / sentinelas de controle:** continuam com linha de visão e não desativam outras pinks.
* **Supressão:** wards camufladas, suporte e região extra de Lume ficam desativadas sob varredura; a cauda de dois segundos é serializada na ward para replay/snapshot.
* **Privacidade:** a perspectiva da equipe exibe apenas dados sanitizados sobre uma ward inimiga detectada.
* O tempo ativo do trinket permanece uma **adaptação tática de 10 segundos ou mais**; charges, recarga 2026 por nível, detecção granular de campeões e renderização de silhuetas especializadas ainda não têm paridade certificada.

## Fontes consultadas (mecânica do LoL; dados não copiados no jogo)
- https://wiki.leagueoflegends.com/en-us/Oracle_Lens
- https://wiki.leagueoflegends.com/en-us/Control_Ward
- https://lol.fandom.com/wiki/Oracle_Lens (descrição da detecção independentemente do terreno)

## Estado de qualidade
Testes dev27 corrigidos 8/8; dev28 10/10; `npm test` integral PASS; Chromium scanner e pós-jogo PASS; 10/10 partidas offline preservam vencedores, durações e hashes dev27; média 27:29 (amostra de 10). O jogo ainda **não tem paridade 1:1 de campeões/itens**, nem PvP competitivo verificado. Próximo marco: V4.5.3 itens/receitas em lotes e validação interativa ampliada.
