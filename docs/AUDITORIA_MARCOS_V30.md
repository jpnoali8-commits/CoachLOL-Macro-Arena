# CoachLOL — Auditoria e marcos após v3.0

## Natureza da versão
Alfa offline-first, real HTML/CSS/JavaScript. Arte e UI de reserva vetorial própria. Data Dragon para dados estáticos/arte versionada quando o CDN estiver disponível; não é motor de simulação Riot.

## Situação verificada — COMPLETO para esta etapa
- As ações da HUD usam imagens vetoriais locais, não emoji monocromático; 12 botões têm semântica de cor independente.
- Os 4 upgrades flutuam acima da habilidade correspondente quando há pontos, com R convencional bloqueada antes dos níveis 6, 11 e 16. A caixa redundante inferior não aparece.
- O Auto Upar permanece acima de Q/W/E/R na mesma seção; nenhum painel foi deslocado para fora dos docks.
- A proibição de upgrade repetido no mesmo nível segue `skillRankCap` (um ponto de skill por nível e limite de ranks conforme nível).
- O círculo de ataque básico segue o campeão interpolado, usando a projeção orbital do mapa; não significa alcance de QWER.
- Alcances iniciais de AA dos dez campeões predefinidos associados ao motor; para outras escolhas, ficam os valores genéricos, pendentes de dados específicos.
- A loja inclui filtro/busca, seletor de cinco campeões, fila de compras, itens por função; ícones offline vetoriais em vez de lacunas.
- O placar continua usando valores reais de K/D/A; miniaturas de invocadores e de itens aparecem com fallback offline.
- Botões exclusivos de produção são escondidos por padrão. F10 ou Configurações ativam desenvolvimento sem apagar eventos JS existentes.
- Regressão executada por npm test, além de Chromium para inicialização, upgrade de Q, loja e placar; sem erros JS nesses fluxos testados.

## Bloqueios críticos do jogo
### M0 · Conclusão da partida (P0)
A IA ainda não demonstrou encerrar sistematicamente partidas de 20–40 min por cerco legal a torres/inibidores/Nexus. Criar suites determinísticas cobrindo fechamento real, wards, fog, automações e morte/respawn, inclusive seeds adversas.
### M1 · Campeões e combate (P0)
Implementar templates por campeão com passivas/QWER reais: targets, cast time, alcance em unidades, hitbox, AOE, custo, CC, escudo/cura, on-hit, autoataque, geração de recursos, cooldowns, interações com visão/terreno. Nami W é exceção inicial existente; combos genéricos não reproduzem kits Riot.
### M2 · Data Dragon e assets (P1)
Inventário/cache versionado e verificável com manifest; atualizar somente depois de validar licenças, compatibilidade por patch e IDs. Não substituir regras do motor por JSON cosmético do Data Dragon. Completar portraits (vários são SVG genéricos), spell icons reais e summoner spells.
### M3 · Loja completa (P1)
Fazer receitas, componentes, venda, desfazer transação, itens únicos, limites de slots, efeitos e recomendações dependentes de função/matchup. Estado de compras programadas deve manter determinação e isolamento por campeão.
### M4 · Banco de comandos/IA local (P1)
Ampliar gramática com condições temporais, múltiplos atores e alvos em fog, desambiguação, IA WebGPU opt-in local com parser para uma AST validada pelo motor e prévia obrigatória. Testar combinações e rejeitar ações desconhecidas sem alucinar efeitos.
### M5 · UI e apresentação (P1)
Auditar gaps por resolução, inputs mouse/middle/right, performance 60 FPS, fog/pose sincronizadas, overlays/context menus reposicionáveis, tema CC0/ISC/DDragon segregado. Redesenhar shop com receitas em árvore após motor oferecer componentes reais.
### M6 · Multiplayer/ranked/lobby (P2, depois de M0–M4)
Estado autoritativo, commits simultâneos ocultos entre jogadores, reconexão, espectador/anti-cheat, matchmaking, classificação/MMR/PDL, histórico/sistema de temporada, UX de lobby e configuração de privacidade. Sem alegar multiplayer real antes da infraestrutura.

## Controles de regressão mínimos em cada entrega
`npm test`; script de navegador de integração; simulação longa com múltiplas seeds; validadores de colidir/vision/time; verificar nenhum fallback ou erro no console; fotografias de execução reais em 16:9.
