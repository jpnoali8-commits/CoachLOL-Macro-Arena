# CoachLOL V4.5.2d-4-dev21 — Changelog

## Implementado
- Arauto invocado agora pode ser atacado por campeões inimigos. Ataques básicos, alcance, fog e cooldown de ataque usam o motor de combate existente.
- Olho **na traseira** do Arauto invocado: acerto com ataque básico causa **40% de HP máximo** em dano verdadeiro adicional; fecha por 3 segundos e reabre. Essa regra é exclusiva do Arauto invocado, diferente dos 12% do Arauto neutro.
- Ao escolher o campeão, clicar no Arauto inimigo **visível** cria ordem de ataque, sem dano instantâneo por UI. O campeão se aproxima respeitando pathfinding.
- A IA inimiga pode defender contra Arautos hostis dentro de alcance visível.
- Representação do olho aberto/fechado no mapa, atrás do Arauto, e barra de HP vinculada ao motor.
- O autopiloto de push deixa de prender o campeão em 28%/72% da rota quando há wave aliada à frente, após os primeiros 780 segundos simulados. Sem teleporte nem dano inventado.
- Dados de olho, direção, cooldown e última destruição persistem em snapshots.

## Preservado
- Arauto da dev20: escolha de portador, caminhada até rota, cabeçadas decrescentes e torres que o atacam.
- Golpear D/F, Rift elemental, visão/máscaras autorais, SVGs CC0, Ancião, farm calibrado e catálogo offline.

## Não implementado nesta etapa
- Pilotagem do Arauto por um campeão; habilidades QWER específicas contra o olho (apenas AA aciona o bônus); conclusão orgânica do Nexus.
