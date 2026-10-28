# CoachLOL Macro Arena v2.9 — Câmera estável, interpolação, loja e HUD

Data: 2026-10-25 | Estado: alfa experimental offline-first.

## Correções funcionais
- A câmera inicial usa orientação horizontal de **0°** em vez de diagonal 45°, com inclinação controlada em 55%. A imagem do mapa não recebe reenquadramento/zoom automático durante yaw.
- RMB + arrastar: gira horizontalmente. Botão esquerdo + arrastar **ou** botão do meio + arrastar: pan. Scroll: zoom centrado no tabuleiro; Ctrl+scroll preservado para o navegador. Botão Centralizar restaura eixo 0°, zoom 1 e inclinação 55%.
- Corrigida a mudança abrupta de escala causada pela textura orbital que usava diferentes envelopes em 0° e ângulos não nulos.
- Interpolação temporal de campeões/minions alinhada à cadência de simulação (650 ms); a fog faz transição gradual entre os últimos dois estados de visão em vez de trocar instantaneamente. As máscaras são calculadas em ticks; renderização do plano projetado é cacheada até mudar câmera/visão. Os cálculos de alcance e visão do motor NÃO são interpolados; apresentação apenas.
- Recuperação defensiva do laço de turnos: decisão pendente é reapresentada, execução interrompida pode ser retomada quando legal, decisão concluída no tick final termina a rodada. Erros de motor pausam com aviso em vez de esconder um travamento.
- Mensagens contextualizadas no caso de ordem para campeão morto ou após confirmação de ações.

## HUD/Loja
- Atributos AD/AP/ARMOR/OURO/FARM/NÍVEL/WARDS/KDA em grade compacta, cores e pictogramas distintos por atributo. Ações diferenciadas por tipo tático.
- Removida parte do aspecto de caixas aninhadas, painéis transparentes escuros e bordas Hextech de precisão.
- Habilidades QWER acima de Ordens/Ações; Auto Upar pertence ao widget de habilidades. Pontos de evolução aparecem na área das habilidades sem grande caixa adicional.
- Mais widgets arrastáveis, incluindo reação, automações, táticas, smite e perspectiva; a reorganização mantém nós existentes e handlers de gameplay.
- Loja ampla até 1500 px, seleção dos cinco campeões, categorias Todos/Recomendados/Iniciais/Dano/Defesa/Utilidade, busca normalizada sem acentos, compra contínua, arsenais e fila. Ícones oficiais em CDN Data Dragon com fallback de símbolo local se indisponível.

## Testes
- `npm test` usa a suíte anterior mais verificações v2.9 para nova câmera. A expectativa v2.8 de yaw 45° foi substituída por 0° conforme solicitação do usuário.
- 648 transformações tela↔mundo validadas em diferentes ângulos, inclinações e zoom, além de invariância da escala durante rotação.
- Simulação de 300 segundos de jogo, 30 rodadas e 11 decisões, sem erros de invariantes monitorados.
- **Limitação:** o navegador Chromium disponível neste ambiente bloqueou a navegação tanto para arquivos locais quanto para a origem localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`); portanto, a revisão estética não foi certificada por captura atual desta v2.9. Testes estáticos e de motor não substituem avaliação visual ou testes de interação reais no computador do jogador.

## Pendências
- Kits individuais dos campeões e efeitos de itens completos; partidas finalizadas com cerco real; mais catálogo local de assets oficiais; otimização GPU/WebGL/WebGPU opcional no futuro; QA em hardware real, várias resoluções, scroll/pan no navegador e períodos de longa execução.
