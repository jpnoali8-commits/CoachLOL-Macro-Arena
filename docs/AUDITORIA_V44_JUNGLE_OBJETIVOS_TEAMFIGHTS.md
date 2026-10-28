# CoachLOL V4.4 — Auditoria de engenharia: jungle, objetivos e teamfights

## Mudanças verificáveis

- `OBJECTIVE_PHASES_V44` define abertura e expiração dos encontros no mesmo poço: Vastilarvas 08:00–14:45, Arauto 15:00–19:45, Barão desde 20:00; Dragão desde 05:00. Respawn de Baron 6:00; dragão 5:00 (Ancião adaptado após alma).
- Monstros do poço superior coexistem no *mapa* mas **não** no mundo ativo; encontro de um estágio não revive depois da saída/morte. Registro por `timerKey` permite rotas e Smite programado.
- `useSmite` valida ≤500 unidades; Smite é lançado independentemente do timer de ataque comum. Carga e cooldown não são gastos à distância. Concorrência é arbitrada pela mesma HP inicial; não depende da ordem de iteração.
- `objectiveLedgerV44` registra equipe, vencedor, dano por ator, contestação, participantes, Smite vencedor. O adversário recebe apenas anúncio público de captura, não os dados internos da disputa.
- Assistência: o vencedor mantém a recompensa antiga; aliados vivos e presentes com participação real recebem bônus *de treinamento*; não se transfere ouro/XP para todos no mapa.
- `teamfightLedgerV44` registra agregado de golpes próximos a poços épicos quando ambas equipes têm ao menos 2 campeões no local; a perspectiva pública não contém IDs de personagens.
- `Arena.fromSnapshotV40` restaura dados V4.4 e adiciona encontros futuros quando carrega um snapshot mais antigo; schema V4.0 permanece compatível.
- UI passa a mostrar quatro tipos de objetivos, com cronômetro pré-spawn, estado observado ou `?` sob fog, e os dois novos ícones SVG em fundo flat.

## Limitações importantes

- **Não há** IA de Arauto real, detecção precisa de olho, contagem individual de Vastilarvas, buffs fielmente reproduzidos ou teamfight 5v5 com todos os kits certificados. Adicionar na V4.5–V5.0 com testes.
- O Smite usa a progressão simplificada 600/1000/1400 já presente; a distribuição de créditos num tick é determinística e adaptada para o tabuleiro, não prova de paridade Riot.
- Ainda restam múltiplos caminhos legados de dano e skill. Aplicar caminho único completo e replay de comandos end-to-end antes de multiplayer seguro.
- Erros de mídia em ambiente com URLs sem disponibilidade não foram confundidos com regressões do motor; medir assets na distribuição offline real.

## Fontes públicas de referência

- Riot Games — Patch 26.21: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Riot Games — Swiftplay difere de SR padrão: https://support.riotgames.com/en-us/league-of-legends/gameplay/swiftplay-game-mode
- Referência comunitária (timer de objetivos; verificar por patch): https://boostpirate.com/tools/lol-objective-timer

## Regras de migração dos testes

Os testes legados v19 e v37 aplicavam Smite com o campeão no outro extremo do tabuleiro. Seus fixtures foram corrigidos para posicionar o jungler junto ao monstro antes da conjuração **sem remover as asserções de dano/carga**. Novo teste V4.4 confirma que um Golpear remoto é rejeitado sem consumir cargas.
