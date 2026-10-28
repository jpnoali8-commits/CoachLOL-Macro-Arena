# CoachLOL — Changelog V4.5.2d-4-dev27

Base: ZIP completo da dev26. Incremento focado em **sigilo e custo da visão**, sem alterar dano, ouro, HP, farm ou relógio de partida.

## Corrigido
- **Pink e Oracle:** a detecção de sentinelas inimigas exige LOS entre o detector e a ward; outra fonte aliada enxergando a posição não permite atravessar paredes.
- **Privacidade:** sentinelas inimigas *já reveladas* são enviadas na perspectiva da equipe somente com `id, team, type, x, y, hp, maxHp`. Campos internos como owner, timestamps e status táticos deixam de ser transmitidos. Wards aliadas mantêm o estado necessário à interface.
- **Custo:** `perspective(team)` constrói as fontes de visão uma vez, passando-as para os filtros de campeões, minions, campos, wards e Arauto. Sem cache entre ticks (mudanças no mesmo tick continuam válidas).
- Os predicados de supressão e Lumes da dev26 permanecem em vigor.

## Evidência
- 8/8 contratos novos.
- `npm test` PASS.
- Chromium com atlas autoral e 15 SVGs: Oracle atrás da parede, aproximação e revelação válida; sem erros JS.
- 10/10 partidas de cinco perfis e duas seeds reproduzindo o estado final da dev26; 10 Nexus naturais, média 1.649s (27:29).
- Microteste controlado: fontes de visão por perspectiva de 69 para 1. CPU 16,51ms vs 8,98ms para 10 perspectivas, números sensíveis ao ambiente.

## Limitações
- A validação Chromium ainda é uma **fixture controlada**, não uma partida orgânica completa.
- O motor permanece offline JavaScript. Uma futura arquitetura multiplayer requer filtragem e autorização no servidor, não apenas no cliente.
- Paridade integral com LoL, kits e catálogo de itens continuam pendentes.
