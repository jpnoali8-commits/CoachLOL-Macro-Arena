# CoachLOL Macro Arena — v2.4 (25/10/2026)

## Nova camada de comandos de evolução

- Ordens digitadas por função ou apelidos de campeões: `Voli focar upar Q depois W`, `Jinx focar Q depois E` e `Vayne upar 3 pontos no Q depois focar W`.
- Um plano de evolução é guardado no estado de cada campeão e continua entre rodadas, salvo quando alterado.
- Abertura de skills distribuída entre as três básicas (p.ex. Q→W→E). Depois, etapas de rank-alvo: Q até rank 3, W até rank 5, Q até rank 5, E até rank 5.
- Rank e níveis são restritos: básicos geralmente 5 ranks (limite por nível); ultimates convencionais 6/11/16. O R convencional é priorizado automaticamente nestes níveis.
- Udyr tratado como exceção: R é quarta habilidade básica, não ultimate gratuita; pode ser priorizada e receber até 6 ranks, com sexto rank habilitado a partir do nível 16.
- Auto upar permanece junto aos medidores de HP/mana e exibe o resumo compacto do plano. Ctrl+Q/W/E/R e evolução manual preservados.

## Interface e experiência

- Direção visual retomada: preto dominante, dourado discreto; controles secundários com menor contraste.
- Barra de ordens táticas em uma linha, flutuante e sem grande painel opaco. Prévia expandida somente quando solicitada.
- Tabuleiro ampliado para ocupar o viewport (corrigida uma regressão CSS de 300×150).
- Placar/tempo no cabeçalho, próximo às ações; cabeçalho compacto.
- Painel de jungle `JUNGLE · PATH · GANK` ao selecionar JG; outras funções recebem `PATH · GANK`.
- Três roteiros de full clear: Red→Krugs→Raptors→Wolves→Blue→Gromp→Scuttle; inverso iniciando Blue; contextual pelo lado mais próximo. A rota permanece por rodadas.
- Configurações de texto e densidade; redimensionamento dos painéis via divisórias arrastáveis.
- Chat arrastável e auto-ocultável (45 segundos); no modo offline, a resposta do adversário é um **bot local de frases prontas**, sem transporte de mensagens pela rede.
- Reconhecimento de voz **somente no dispositivo**, se o navegador disponibilizar `SpeechRecognition.processLocally` e pacote pt-BR. Sem fallback silencioso a reconhecimento remoto. Prévia obrigatória antes de aplicar a ordem. Link de ajuda para instalação do idioma.
- Feitiços de invocador no painel do campeão com indicação de recargas apenas onde o motor suporta. Teleporte, Curar, Incendiar e alguns efeitos de kits ainda não estão completos: controles indisponíveis são rotulados como em desenvolvimento.
- HUD de confronto com retratos, HP e nome das duas unidades, mantendo pausa para reação.
- Loja mantém troca de campeão, compra múltipla e filas da etapa v2.2; miniaturas dos campeões no seletor.

## Engenharia e testes

- Código de comandos do navegador gerado do mesmo interpretador `.mjs` do motor.
- Combos Q/W/E/R não são mais cancelados pelo modo de ataque básico; AA continua durante/apos a execução ordenada.
- Regressão: 70 testes automatizados de contrato aprovados, incluindo 8 cenários novos (evolução, Udyr e sequência de combo).
- Chromium autocontido: interface abre sem erros JavaScript; mapa com assets, três caminhos de clear visíveis, full Red criando rota de sete etapas, campo de texto convertido em ordens válidas, configurações, chat e loja.
- Navegação HTTP local completa não validada neste ambiente (bloqueio do navegador); o usuário deve executar `INICIAR_WINDOWS.bat` para integração final.

## Pendências e limites (não chamar de concluídos)

1. **P0**: verdadeira engine de habilidades/passivas *por campeão*, inclusive interação com itens/range/CC/recursos/escudos; hoje o combate ainda contém fórmulas genéricas.
2. **P0**: auditoria de confrontos simultâneos complexos e 20–40 minutos com vitória por Nexus e objetivos válidos.
3. **P1**: summoner spells completos (teleporte, heal, ignite, etc.) e CDR confiável por unidade, com cooldowns sincronizados no mapa.
4. **P1**: sprites/retratos e ícones originais completos de todos os campeões e itens. Alguns arquivos ainda são placeholders SVG; conferir licenças para distribuição.
5. **P1**: multiplayer autoritativo para chat de jogador real, rival humano e ranked; **o chat atual é offline**.
6. **P1**: validação da disponibilidade real do pacote pt-BR para voz local por navegador/SO, com testes de privacidade.
7. **P2**: balanceamento, matchmaking, MMR, PDL, temporada, reconexão e prevenção de abuso.
