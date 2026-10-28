# QA — CoachLOL Macro Arena V4.5.3-dev57

## Base e escopo
Partida da dev56 canônica, sem reconstrução. Catálogo congelado no patch 26.21 / Data Dragon 16.21.1, exclusivamente Summoner's Rift normal. A lógica estratégica dos bots não foi aprimorada.

## Alterações verificadas
- **Formação física de engajamento PvP**: guerreiros se aproximam da frente do alvo e se distribuem lateralmente, catapultas ficam em apoio, magos retêm a retaguarda. O deslocamento do alvo ideal é limitado a 72 unidades e fica sujeito aos colisores e ao resolvedor autoritativo de corpos. A progressão econômica e o farm não foram reescritos. **Habilitado somente em salas PvP (`mode:pvp`), após cinco minutos**; em testes automatizados (`mode:bot`) permanece a formação comprovada, pois a primeira tentativa de habilitação universal alterou gravemente a economia e a duração.
- **Brasa de Bami (ID 6660)**: receita oficial Cristal de Rubi + Partícula Brilhante, custo 900, 150 vida, 5 aceleração, aura de dano mágico próxima por 3s depois de causar/sofrer dano. **8 dano/s e 300 unidades são números da adaptação CoachLOL**, não certificados como valores oficiais Riot.
- **Hexdrinker (ID 3155)**: receita oficial 2 Espadas Longas + Manto Anula-Magia, custo 1300, 25 AD e 25 MR. Um escudo **exclusivamente contra magia** é ativado quando o golpe levaria a vida para abaixo de 30%. Duração de 2,5s. **Escudo 200 e CD 90s são adaptações numéricas**, sem certificação de valores Riot neste lote. O estado é limpo ao vender o item.
- **Catálogo**: agora 96 de 202 itens gerais têm vínculo com motor, 106 continuam apenas consultáveis. O vínculo não implica que os 96 estejam integralmente certificados.
- **Browser**: `engine.browser.js` sincronizado do mesmo ESM; nenhuma screenshot Chromium foi produzida/validada neste marco.

## Resultados dos testes reais
| Verificação | Resultado |
| --- | --- |
| Testes específicos dev57 | **16/16 PASS** |
| Regressão integral `npm test` | **PASS** |
| Seed 26 bot 2400s | Nexus natural, 1284s, vencedor vermelho, CS MID 44/52, 0 issues |
| Seed 42 bot 2400s | Nexus natural, 1400s, vencedor azul, CS MID 28/40, 0 issues |
| Testes de multiplayer anteriores | Incluídos na regressão integral, PASS |
| Chromium visual | **Não certificado** |
| Ícones oficiais Riot offline | **Pendente** |

## Limitações e próximas correções
- Formação PvP ainda requer simulações reais 5v5 com jogadores, congestionamentos densos, last hits e interação com torres. A colisão minion-vs-minion em toda a partida não está certificada integralmente.
- Bami e Hexdrinker têm adaptadores com números provisórios. Não declarar paridade Riot integral.
- Ícones oficiais offline ainda incompletos. Não importar imagens de Wiki como fallback.
- Sylas R, Neeko passiva, Viego, Mordekaiser Realm e restante das habilidades individuais continuam pendentes de catálogo integral.
