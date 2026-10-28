# Auditoria V4.5.1 — Implementado versus pendente

## Implementação validada por novos contratos

1. Duas torres do Nexus independentes, respawn de 180s a 40% HP; inibidor após 300s. Regra de vulnerabilidade mantém Nexus protegido até que as duas torres não estejam vivas.
2. Superminions condicionados à rota e ao estado de inibidores, inclusive dois por rota com três inibidores abatidos.
3. Ondas temporizadas e composição intermediária/tardia conforme fontes oficiais 2026.
4. CS/outro fixo apenas para último golpe efetivo, XP por proximidade.
5. Push de wave como ataque antecipado, com presets freeze/slow/fast. Auto-clear reutiliza APENAS Lux E e Nami Q com kits de geometria, mana e cooldown.
6. Seleção por área substitui lista anterior; seleção incremental exclusiva para Shift+clique; foco de múltiplos campeões aplica dano cumulativo.

## Dívida técnica crítica ainda aberta

- O cenário legado V38 de 35–62 CS aos 5 minutos não atingiu a faixa após remoção do prêmio falso por proximidade. Exige IA de last hit, velocidade de caminhada para o encontro de wave, ataques preditivos e controle de prioridade. Não reclassificar esse teste como sucesso.
- Habilidades e spells isoladas de muitos campeões NÃO possuem suporte individual no motor e não podem ser usadas livremente com equivalência 1:1.
- Regras de gold, XP, torres (placas/armadura/regeneração), minion speed/AI, freeze/slow push são aproximações onde não auditadas.
- Entrada manual de Nami W existe; nenhuma permissão para conjurar uma habilidade não cadastrada de outro campeão só por ser um ícone Q/W/E/R.
- Banco de ações por prompt e PvP seguro ainda são contratos de projeto, não disponíveis na versão offline.
- Timers persistem em tempo simulado; 2× só altera o ritmo real de apresentação, sem cooldowns gratuitos.

## Fontes principais

- https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
- https://wiki.leagueoflegends.com/en-us/Minion
- https://wiki.leagueoflegends.com/en-us/Inhibitor
- https://wiki.leagueoflegends.com/en-us/Turrets

Todos os valores podem mudar em patches futuros. A versão de referência e maturidade devem acompanhar cada entidade.
