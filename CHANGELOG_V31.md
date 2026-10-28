# CoachLOL Macro Arena v3.1 — Correções funcionais de HUD e táticas

## Bugs reproduzidos e corrigidos

1. **Habilidades desaparecendo após carregar Data Dragon.** O `updateInspector()` recebia o objeto assíncrono do campeão e montava uma imagem QWER com `onerror` apontando para uma variável `type` inexistente. Se o CDN falhava, o erro interrompia a atualização do inspetor. A imagem oficial agora é opcional e, quando não carrega, é removida sem afetar o SVG local original. A resolução do metadado também trata falhas inesperadas.
2. **Overlay de pontos não aparecendo.** Forçada a exibição dos quatro slots e do botão de upgrade dentro de cada slot, com clipping controlado e sem o antigo quadro `quickSkillUp`. O botão atualiza o inspetor após gastar o ponto; o motor continua decidindo elegibilidade por level, número de pontos e ranks.
3. **PATH · GANK abaixo de Reação.** `tacticPanel` é movido acima de `policyPanel` no DOM (sem clonar ou substituir nenhum nó); todos os listeners continuam conectados. Selecionar campeão passa a deixar PATH visível tanto para jungle quanto para outras lanes.
4. **Ícones vazios/antigos e tonalidade azul nos painéis.** 19 ícones SVG autorais incluídos em `assets/ui/tactics`, cobrindo full clear, invade, gank, rotação, freeze, push, defesa de lane, dragão, barão, visão e outros. O novo `styles-v31.css` prevalece sobre os temas antigos, com cores semânticas por ação e controles predominantemente preto/dourado.
5. **Reorganização não persistente de widgets.** A ordenação dos widgets táticos passa a ser registrada em `localStorage`, restaurada com IDs permitidos ao recarregar. O botão de arrastar foi colocado no `summary` de painéis `details`, respeitando sua semântica nativa.

## Validação

- `npm test`: todos os contratos da versão anterior e os 4 grupos novos de v3.1 passaram.
- `python tests/e2e_v31.py`: interface Chromium autocontida e sem rede. Verificou 4 slots QWER, imagens locais carregadas, 4 setas iniciais, evolução consumindo ponto, QWER restauradas após metadados assíncronos, seis ícones para JG, quatro opções de lane, disposição dos painéis, loja, scoreboard de 10 campeões e zero erros JavaScript.
- Capturas feitas pela execução Chromium estão em `PREVIEW_V31_ARENA_REAL.png` e `PREVIEW_V31_JUNGLE_HUD_REAL.png`. **Não** são mockups de IA. O teste embute ícones e mapa apenas para contornar a navegação HTTP bloqueada no ambiente de validação; o jogo entregue preserva os caminhos de assets reais.

## Limitações desta entrega

- Nem todos os kits QWER, passivas e feitiços de invocador estão implementados nas regras do jogo. Artes SVG offline são substitutas visuais, não prova de kit oficial.
- No modo offline alguns retratos continuam sendo SVG genéricos quando o asset oficial não estiver no cache; isso não paralisa a partida.
- Navegador/desktop e máquinas GPU diferentes ainda precisam de validação interativa de desempenho e responsividade.
