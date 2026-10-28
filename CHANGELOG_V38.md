# CoachLOL Macro Arena V38 — Combos coordenados, visão e macroeconômia
Data: 26/10/2026. Base: V37. Build: 3.8.0.

## Funcionalidades implementadas

- Seleção acumulativa de aliados com **Shift + clique esquerdo** sobre o mapa ou no roster, sem alterar câmera com Shift. Movimento do grupo mantém destinos de formação e permite ordens múltiplas válidas com aplicação atômica.
- **Lutar / montar combo** abre editor em etapas no **mesmo modal**, com retratos, HP, mana do confronto, uma sequência independente de Q/W/E/R, Flash e Incendiar para cada aliado selecionado. Confirmação sincronizada de ordens; o adversário offline vê apenas sua própria perspectiva. Limite de 12 ações/campeão.
- Inclusão de bloqueio defensivo *simplificado* de projéteis no motor de combos para Yasuo W, Braum E e Mel W. Não corresponde à geometria precisa/efeitos completos dos kits oficiais.
- Loja: Ward Amarela e Lente Reveladora como trinkets gratuitos, exclusivos, trocados na fonte; lente acompanha o campeão durante a janela tática, detectando wards inimigas. Trocas não resetam livremente recarga. Sentinela de controle permanece como item consumível separado.
- Prioridade de auto-up editável por sequência de letras (ex.: EWQ, WQE, QEW), R automaticamente nos níveis legais e Udyr podendo priorizar R conforme o kit especial.
- HUD: ícone/taxa de HP do Nexus, abates, torres vivas por time, cores distintas; nível no canto do retrato, MR na tabela de atributos sem repetição de nível.
- Balanceamento inicial: morte real de minion é pré-requisito para CS/ouro, atribuição determinística por semente próxima a campeão que esteja realmente farmando, menos last hits sob pressão inimiga. Ajustada caminhada/colisão das ondas. Sem crédito por estar longe da lane.
- Resistência mágica entra no cálculo de dano mágico; Jinx, Ahri e Nami receberam baseline individual verificado, demais continuam com fallback por classe. Adicionado Manto Anula-Magia (+20 MR, 400 de ouro, referência 2026).
- Assets SVG locais para ícones dos trinkets, camada CSS adicional compacta e responsiva.

## Testes

Execute `npm test` na pasta extraída. O comando roda **todas as baterias herdadas** e `tests/v38_group_combo_trinket_farm.test.mjs` (6 contratos novos). `npm run test:v38` executa somente os novos. Teste do navegador com Chromium/Playwright injetando os JS locais passou sem exceções no fluxo: prioridade EWQ, grupo com Shift, loja e modal multi-campeão.

**Simulação repetível de 300 segundos, semente 36, oponentes ausentes e lanes livres**: TOP 46 CS, MID 47 CS, ADC 45 CS. O alvo de aproximadamente 50 CS em 5 minutos é atingido por aproximação, não garantido para todo campeão/rota. Afastar o ADC da lane elimina a receita de farm de minions daquela rota.

## Limitações e riscos conhecidos

1. **Não é uma reprodução 1:1 de League of Legends**. A lista de campeões, kits, estatísticas oficiais, receitas de itens, efeitos especiais e jungle ainda precisa de auditoria individual; dados de três campeões foram atualizados nesta etapa.
2. Combos são resolvidos por etapas dentro de um motor offline de turnos; gestos, blocos defensivos e Flash são abstrações. Yasuo W/Braum E/Mel W não possuem hitboxes completas, orientação, trajetória de projéteis, prioridade nem todas as exceções oficiais.
3. Privacidade de combo é apenas por perspectiva no modo offline IA; uma partida PVP real requer **servidor autoritativo** e protocolo que não transmita ordens ocultas ao oponente.
4. Oracle Lens original em 2026 tem 8 s; neste tabuleiro está adaptado a 10 s (um turno). As cargas/cooldowns e o terceiro trinket Farsight Alteration ainda não espelham integralmente o LoL.
5. Farm de jungle, gold, XP, aggro de monstros, balanceamento de duelo e draft com todos os campeões **não estão certificados**; o experimento reproduzível isolou a lane para mostrar a melhoria. Não tratar as fórmulas de classe como dados oficiais.
6. Retratos e ícones oriundos do Data Dragon podem depender de conexão, dependendo do arquivo; assets SVG locais foram mantidos como fallback. Validar licenças dos assets antes de publicar/distribuir.
7. A interface pode precisar de revisão manual adicional em diferentes telas/dispositivos. O teste visual automatizado foi realizado sem acesso à rede de imagens.

## Referências e rastreabilidade

- Riot 26.1, mudanças de visão: https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
- LoL Wiki, calendário de waves: https://wiki.leagueoflegends.com/en-us/Minions
- LoL Wiki, Oracle Lens (duração/cooldown/cargas): https://wiki.leagueoflegends.com/en-us/Oracle_Lens
- LoL Wiki, Jinx (V26.21): https://wiki.leagueoflegends.com/en-us/Jinx
- LoL Wiki, Nami: https://wiki.leagueoflegends.com/en-us/Nami
- LoL Wiki, Ahri: https://wiki.leagueoflegends.com/en-us/Ahri
- LoL Wiki, Null-Magic Mantle: https://wiki.leagueoflegends.com/en-us/Null-Magic_Mantle

As fontes são referências de pesquisa; o CoachLOL é um jogo de treinamento de macro independente e adaptado a turnos.
