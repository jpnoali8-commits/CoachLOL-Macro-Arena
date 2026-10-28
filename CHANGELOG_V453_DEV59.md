# CoachLOL Macro Arena — V4.5.3-dev59

## PvP 1v1: um jogador controla cada equipe inteira

- Duas sessões, sempre: azul controla TOP/JG/MID/ADC/SUP azuis; vermelho controla TOP/JG/MID/ADC/SUP vermelhos. A sala de dez jogadores foi desativada. O tabuleiro continua com dez campeões, mas apenas dois jogadores humanos.
- Autoridade por token da sessão, validação dos cinco IDs da própria equipe, bloqueio do outro lado e de comandos repetidos modificados; sequência global por jogador.
- Confirmação simultânea de ordens sem passagem do turno por apenas um jogador. Defesa e reação associadas ao campeão correto, inclusive fora do MID.
- Visões privadas por equipe e reconexão com checkpoints mantêm a posse dos cinco campeões.
- Cliente web do PvP com seletor de cinco campeões próprios e seleção do defensor para uso de item em janela de reação. Interface compacta de referência, não HUD final.

## Itens do Summoner's Rift 26.21 / Data Dragon 16.21.1

- Bandana de Mercúrio (3140), 1300 ouro, +30 resistência mágica; receita Manto Anula-Magia.
- Cimitarra Mercurial (3139), 3200 ouro, +50 dano de ataque, +35 resistência mágica, +10% roubo de vida; receita Bandana + Picareta + Cetro Vampírico.
- Ativação no servidor para remoção de CC listado, inclusive supressão, exceto arremesso ao ar. Recarga compartilhada autoritativa preservada após trocas; Cimitarra ganha aceleração temporária. Valores de CD e velocidade são ADAPTAÇÕES do CoachLOL, não paridade Riot certificada.
- 100/202 itens gerais conectados ao motor; 102 ainda apenas de referência.

## QA

- 15/15 testes novos, 23/23 testes históricos de rede e regressão npm test integral PASS.
- Integridade do ZIP e preservação Git registradas na entrega.
- NÃO certificado: teste com dois humanos do lobby ao Nexus, condições extremas de combate/fog simultâneo, UI Chromium; ícones Riot offline ainda ausentes.
