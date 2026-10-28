# CoachLOL Macro Arena — V4.5.3-dev45

## Correcoes funcionais e visuais

- Interacoes com Florividente, Florividente Quimtec e Fruta Explosiva: intencao de acao, aproximacao pela navegacao original e ativacao somente no alcance. Fruta Explosiva usa painel direcional compacto com dial da Florividente.
- **Recuar**: ordem autoritativa, cancela perseguição, reacoes e tentativas de interagir com plantas, prevalece na atualizacao de movimento; nao ignora paredes nem concede imunidade a ataques.
- Waves: sempre 3 guerreiros + 3 magos; waves com canhao/catapulta possuem +1. As regras de frequencia da catapulta e supers existentes continuam.
- Loja mais limpa: icone + ouro, texto no hover, abas Recomendados/Todos e categorias simbolicas, itens separados por tier, detalhamento apenas na lateral e arvore horizontal com melhorias acima.
- 45 vetores CC0 herdados + 25 vetores locais simbolicos novos. Imagens oficiais sao solicitadas ao Data Dragon quando disponiveis; reserva local evita icone quebrado, **nao equivale a arte oficial**.
- Selecao individual de paginas de runas movida ao Champ Select; preservada ao iniciar a partida; controles antigos da loja ocultos por compatibilidade de DOM.
- Textos internos de producao removidos da interface de jogo, link do catalogo oficial deslocado para area oculta de auditoria. Cabecalho e modais corrigidos para nao interceptar cliques nem cobrir o tempo.
- Verificacoes automatizadas e evidencias de navegador armazenadas em docs/QA_EVIDENCE_V453_DEV45.

Nao altera IA estrategica dos bots, nao declara kits completos ou multiplayer online funcional.

## Revisao final dev45 — Visao autoral e HUD de reacao
Mapeamento 4096px dos 11 marcadores efetivamente identificaveis e 12 regioes 8+4; 12a sem marcador fica bloqueada. Pink e sentinela azul ativam bonus temporario; ward amarela nao. Modal Reagir ao Golpe tem rodape de acoes sempre visivel e seletores alinhados. Loja adiciona trinket Sentinela Azul: 71 itens locais, com identidade de implementacao parcial. Nao confundir com paridade integral de LoL.
