# Handoff oficial — CoachLOL Macro Arena (para continuar em outros chats)

## Missão

Produzir um trainer tático de League of Legends em formato de tabuleiro por **turnos simultâneos**, offline-first contra bot determinístico, com expansão futura para multiplayer. Resolução comum após os locks; cada campeão mantém seu plano sem clique repetitivo.

## Decisões aprovadas e não negociáveis

1. O **mapa verdadeiro é o atlas 4096x4096 e as máscaras aprovadas** no CoachLOL Map Studio v6. Não usar as imagens antigas como mapa lógico.
2. Conservar a Champ Select aprovada (Azul vertical à esquerda, Vermelho à direita, campeões no centro, 5 bans por lado, janela de 20s/pick e picks 1–2–2–2–2–1).
3. Interface preta/dourada, cenário como foco, HUD **flutuante sobre o mapa**, sem painéis laterais gigantes de comandos.
4. Clique no campeão e depois no mapa = deslocamento persistente. Trocar unidade não perde planos dos outros quatro.
5. Movimento usa MS × segundos reais até fim comum da escolha (10/30/60), mantendo planos ativos nas próximas rodadas.
6. Farm, autoataque e seguir lane são independentes do movimento. Minions andam e lutam sozinhos. CS somente no last hit, XP por proximidade.
7. Moitas ocultam sem visão interna; aliados/minions/wards revelam áreas sob regras de LOS e fog. Bot não usa coordenadas inimigas ocultas.
8. Uma ameaça dispara reação automática preselecionada. Alertas e escolhas seguintes não dão privilégio temporal a um lado.
9. Conteúdo Riot e Data Dragon é versionado por patch. Não tratar ícones/estatísticas como implementação de habilidades.
10. O produto final poderá usar Rust/WASM no núcleo e Web/Three.js na interface, após estabilizar a mecânica.

## Último pacote

`CoachLOL_MacroArena_v12_Farm_Combat.zip` (pasta principal `CoachLOL_MacroArena_v12_Farm_Combat/`).

Arquivos relevantes: `engine.mjs`, `engine.browser.js`, `app.js`, `index.html`, `styles.css`, `data/coachlol_map_v6.json`, `data/masks_128.json`, `draft.*`, `tests/core.test.mjs`.

## Estado factual da v1.2

- 30 verificações de núcleo passaram no Node.
- Cenário 360s passou de 0 CS/XP para valores positivos nos laners, com XP, níveis e morte/eventos funcionais, **sem conceder farm sintético**.
- Bot vermelho aparece como composição conhecida; posições no mapa ainda obedecem à fog.
- Movimento, automatismos e modais foram integrados em código, mas navegador de testes no ambiente desta revisão bloqueou ou atingiu timeout. **Falta smoke test humano visual.**
- Jungle, XP/farm preciso por patch, torres, visão e todas as skills ainda são parciais. 3D e Rust/WASM ausentes.

## Próxima tarefa de maior valor (Gate G03)

Testar em Chrome no Windows 1440x900 e 1920x1080: selecionar TOP/MID/ADC/SUP/JG, clicar destino sem clicar mover, alternar cinco planos, rota de pontos, clicar tower/camp/inimigo visto e verificar popups, avançar 12 turnos, detectar reação a ataque e morte. Corrigir qualquer quebra visual, sem regressar a desenho 2D genérico nem tocar no mapeamento.

Depois avançar Gate G02 (benchmarks de farm em múltiplas seeds, freeze/slow push) e G04 (patrulha de jungle/bot). A Bíblia geral M00–M15 permanece em `docs/BIBLIA_PRODUCAO_COACHLOL.md`.

## Como usar num novo chat

Anexe este ZIP ou o `CONTINUIDADE_ENTRE_CHATS.md` e diga: “Continue o CoachLOL pelo gate G03 da v1.2, preserve o atlas v6 e a Champion Select; não conclua novos marcos sem testes”. Isso elimina a dependência de contexto implícito do histórico.
