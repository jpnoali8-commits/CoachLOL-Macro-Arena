# CHANGELOG V4.5.3-dev66

- Novo summoner **Purificar (Cleanse)**: loadout e draft, cooldown autoritativo, remoção CC/removíveis, Ignite/Exhaust e tenacidade temporária, snapshots, validação de ownership.
- Exceções de supressão/estase à ativação de feitiços; stun/root/silence não bloqueiam feitiços não móveis. Flash permanece dash e bloqueado durante CC imobilizante.
- Exaustão agora reduz dano de habilidades do campeão, não somente dano baseado no ataque básico; `true` preservado e cálculos de farm inalterados.
- BARRIER→CLEANSE funcionam em combo de defesa, sem revelar combo ao adversário; `cleanse` válido nos três gates de combo (formato, dispatch e `setOrder`).
- Botão de autocast Purificar no HUD com seleção do campeão atual, sem exigir alvo visível; ícone SVG flat dourado autoral, sem asset externo.
- 43 novas verificações em dois testes Node, 13 no Chromium, registros de QA, sincronização 73 exports e regressão `npm test`.
- **Não incluído**: novos itens 100%-funcionais, kits de todos os campeões, browser HTTP/SSE nativo, partida PvP humana inteira.
