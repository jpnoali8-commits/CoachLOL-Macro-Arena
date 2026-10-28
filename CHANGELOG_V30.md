# CoachLOL v3.0 — Correção de produção, sem imagem conceitual

## Implementado
- Upgrade de Q/W/E/R é um controle flutuante em cada slot. A grade duplicada de pontos deixa de ser visível. Os botões são reconstruídos após gastar um ponto e ficam ocultos automaticamente quando pontos acabam; skills bloqueadas por rank/nível não podem ser elevadas. Motor preserva portões 6/11/16 para ultimates convencionais.
- 12 ícones de ações em SVG local, independentes da rede e com cores individuais; não depende do Data Dragon nem do gerador de imagens.
- Aro de alcance aplica projeção perspectivada em torno da **posição visual interpolada** e representa AA, não o alcance de todas as habilidades.
- Ajuste de AA dos 10 campeões do elenco-padrão, usando range base em unidades / 15.000; habilidades têm alcance independente a implementar por kit.
- Itens do placar ganham imagens Data Dragon quando mapeadas; retratos e spells aparecem no placar com fallback local.
- Loja recomendada mantém pet/quest na frente e explica hierarquia; modal ampliado, fundo realmente escuro e scrollbar harmonizada.
- Ações coloridas por tipo; estatísticas com cores semânticas; botão de desenvolvimento oculto para jogadores e acessível via F10 (ou em Configurações).

## Ainda não concluído
- Artes oficiais de todos os itens/skills 100% offline: o Data Dragon funciona como CDN e o catálogo local não cobre todo o LoL.
- Escalonamento de range por passivas individuais e fórmulas específicas de Q/W/E/R para todos os campeões.
- Itens completos, receitas, componentes e balanceamento atualizado; imagens não substituem regras.
- Lobby/multiplayer/ranked e sincronização autoritativa de turnos.
- Auditoria de uma partida completa em browser real.

Este trabalho modifica arquivos do jogo executável, não apenas uma prévia estática.

## Reserva visual offline adicional
- 4 ilustrações vetoriais de habilidades, 6 feitiços e 22 ilustrações de itens geradas como SVG próprio. Ícones oficiais (Data Dragon) têm preferência quando disponíveis; o fallback não representa as artes oficiais e não altera kits.
- O inventário e o placar também usam as ilustrações de itens de reserva, em vez de espaços vazios.
