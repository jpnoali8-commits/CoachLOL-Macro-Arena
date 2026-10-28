# CoachLOL Macro Arena v1.5 — Placar, reações, combos e reequilíbrio

Atualização: 25/10/2026. Base: v1.4 (assets e atlas 4096 preservados).

## Placar HUD / Tab
- Novo botão **▦ Placar · Tab** na barra superior. O atalho `Tab` alterna entre abrir e fechar. `Esc`, o botão X e clique fora fecham.
- Overlay contextual escuro e compacto, não consome espaço permanente do tabuleiro.
- 10 campeões divididos em 2 equipes (TOP/JG/MID/ADC/SUP), portraits locais, nível, K/D/A, CS, ouro, wards, vida/tempo para reviver e 6 slots de build.
- Catálogo local de itens fornece símbolos e nomes em tooltip. Build acompanha compras reais da loja, sem dados demonstrativos na versão entregue.
- Total de abates por time aparece também na faixa superior do mapa ao lado da integridade do Nexus.
- O motor agora registra morte e participação (assistência dentro de janela de 12 s), impede contagem duplicada e persiste os dados no save existente.

## Controle, combate e automação
- Inclinação inicial de 55% (limite do slider), tecla `P` para alternar perspectiva, sem alterar máscaras físicas.
- **Seguir lane** mantém os comportamentos automáticos de rota/farm. Ordens manuais de movimento não são revertidas assim que o destino é alcançado; reativar Seguir lane devolve o autopiloto.
- Dano inicial de personagens reduzido/progredido por nível, para evitar golpes excessivos no início da partida.
- Em **Lutar**, o jogador monta uma sequência de habilidades `Q`, `W`, `E`, `R` antes de solicitar combate. O alvo em confronto normal recebe uma oportunidade de resposta (defender, curar, peel, lutar, recuar) antes do primeiro dano direto. Ganks e roamings são exceções explícitas dessa barreira.
- 20 perfis de reação automáticos por categorias (defesa, cura, escudo, kite, proteção do ADC, countergank, objetivos etc.). Perfis afetam o motor e possuem recursos/recargas.
- Ao **renascer** ou concluir recall, a HUD oferece **Abrir loja** e **Seguir lane**; o campeão aguarda na fonte até o jogador escolher sair.
- Jungle / path / gank / objetivos em menu recolhível com presets de múltiplas rotas.

## Validação
- `npm test`: **51 testes passando** (21 core, 8 live, 6 HUD v1.4, 11 mecânicas v1.5, 5 placar).
- Chromium em versão temporária autocontida, sem erros JS: painel lateral, 55%, 20 perfis, presets táticos, atalhos e painel de placar (Tab/botão/Esc/fundo, 10 campeões/60 slots, compra/build e KDA). A prévia de placar foi produzida com cenário demonstrativo de teste e NÃO está fixada na simulação.
- A execução via servidor local no computador de destino ainda é recomendada para homologação final.

## Escopo e limitações
- **Simulador offline experimental, não LoL oficial**. As habilidades QWER são sequências abstratas, e os itens ainda vêm de catálogo reduzido com símbolos, não de ícones/estatísticas oficiais sincronizados com patches.
- Negociação de duelo funciona neste motor local; partidas online justas ainda precisam de servidor autoritativo e confirmação de ambos os clientes. Nem todas as regras Riot, fog e informação de oponente estão completas.
