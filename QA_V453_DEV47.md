# QA — CoachLOL V4.5.3-dev47 (revisão de sobreposição de avatares)

## Base e limites
- Base: ZIP mestre dev46 do usuário. As alterações anteriores à dev47 foram preservadas; arquivos Git devem permanecer byte a byte iguais à base.
- Nova regra de renderização no tabuleiro: campeões mortos desenhados ANTES dos vivos, sem ordenar o motor. Retratos de mortos em cinza com opacidade reduzida e contador autoritativo (`deadUntil - gameTime`); vivos coloridos acima.
- A projeção da fog mantém ocultas as posições de campeões inimigos mortos fora da visão. O marcador de grupo agrega apenas campeões vivos.

## Testes executados
- `npm run test:v453:dev47`: PASS (23 testes multiplayer/salas, 9 kill attribution, 4 Florividente, 8 avatar layers).
- `npm test`: PASS, regressão integral (execução deste turno).
- `node --check app.js`: PASS.
- Chromium para retratos: NÃO VALIDADO. Navegação local e HTTP negadas com `ERR_BLOCKED_BY_ADMINISTRATOR`; nenhum screenshot novo deve ser classificado como prova.

## Contexto de funcionalidades implementadas nesta dev47
- Gate HTTP autoritativo por jogador, salas 2/10 participantes, sincronização ready, SSE filtrado, sessão com cookie e checkpoint; ainda não valida latência/produção pública.
- Atribuição de kill por dano adversário nos últimos 15 s em eliminações por unidades não-campeãs, conforme testes específicos.
- Florividente temporário em área direcional, revelação sobre terreno e moitas, por equipe.
- Representação dos objetivos com ícones/avatares, marcador `?` de fog e relógios públicos apenas onde autorizados; imagens Riot em rede usam fallback offline.

## Pendências NÃO declaradas concluídas
- Coração Congelado e outros itens ausentes do catálogo comprável; iconografia oficial/fallback e layout da árvore de receitas sem vazamento.
- Configuração de equipamentos vendidos por clique fora, HUD de cargas e recarga de trinkets, limite de wards/pinks e buff especial em partida.
- Rodapé de reação que desaparece em combinações específicas; ciclo de vida visual/respawn de plantas; divergência visual de 5 versus 6 minions.
- Certificação multiplayer de todos os kits Q/W/E/R, incluindo Sylas, Neeko, Viego e Mordekaiser; teste Chromium dos novos retratos.
- IA avançada dos bots permanece fora da prioridade.
