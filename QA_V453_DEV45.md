# QA — V4.5.3-dev45

## Execucoes verificadas

- `npm run test:v453:dev45`: 14/14 PASS.
- `npm test`: regressao integral PASS (log completo em docs/QA_EVIDENCE_V453_DEV45/npm_test_dev45.log).
- Chromium 144 headless: verificacao real via pagina HTML carregada em contexto local com rotas interceptadas do proprio diretorio do projeto; scripts e imagens executaram normalmente. ZERO excecoes de pagina durante abertura da loja, item selecionado, arvore de receita e Champ Select com 5 seletores de runas. Esta tecnica NAO constitui teste E2E de um servidor de deploy.
- Clique na Loja inicialmente bloqueado por cronometros de objetivos sobrepostos. Corrigido na CSS; nova execucao confirmou clique real sem forcar a acao.
- Botao Finalizar Turno anteriormente aparecia por cima do modal. Corrigida a ordem de empilhamento e revalidado por screenshot.
- Verificacao de caminhada no motor: distancia ao abrigo diminuiu apos atualizacao, recuo nao ficou apenas em flag.
- Wave comum 3+3, com catapulta 3+3+1 em fases iniciais e tardias.
- Todos os 70 itens jogaveis possuem um vetor de fallback local: 45 anteriores + 25 criados. Artes oficiais via CDN podem exigir rede; vetores novos sao representacoes esquematicas e nao artes da Riot.

## Limites conhecidos

- Nao foi executado um teste E2E de deploy por HTTP/servidor real: a navegacao direta local apresentou ERR_BLOCKED_BY_ADMINISTRATOR. A verificacao do Chromium usou injecao HTML local e roteamento isolado dos assets.
- O uso de plantas foi testado no motor por intencao de movimento e ativacao por proximidade; a automacao da movimentacao longa ate diferentes plantas do mapa continua necessitando rodada de testes adicionais com colisores e variantes do Rift.
- Nao ha certificacao funcional integral dos 173 campeoes, nem PvP online completo. A IA dos bots permanece fora da prioridade.
- Estatisticas/economia de partidas completas apos mudar a composicao das waves nao foram recalibradas nesta dev45; monitorar nas proximas etapas, sem alterar artificialmente o tempo ate Nexus.
- Qualquer divergencia entre passivas oficiais e implementacoes parciais continua sob matriz de cobertura; recursos incompletos nao sao declarados certificados.

## Revisao de interface de reacao e visao (27/10/2026)

- Reagir ao Golpe: estrategia e foco na mesma linha em resolucoes desktop; habilidades em grupo compacto; Voltar, Executar resposta e Fechar no rodape FIXO, fora do painel rolavel.
- Chromium real 1366 x 768, navegador isolado: modal e rodape contidos no viewport, 3 botoes visiveis e clicaveis, Voltar reabre escolhas de reacao. Zero excecoes JavaScript observadas nessa verificacao.
- Reconciliação nativa dos arquivos 4096x4096: Point-Vision-Buff-map.jpg define ativacao. Mascaras 8 early + 4 late definem polígonos de bonus de visao por tempo limitado. 11 de 12 regioes tem marcador de ativacao confirmado. A ultima permanece inativa ate referencia de ponto identificavel, SEM inventar localizacao.
- Visao extra apenas ao colocar pink (controle) ou sentinela azul (farsight) em marcador confirmado e liberado. Ward amarela nao ativa bonus. Bonus +25% de raio e poligono desaparecem apos 45s, mesmo que a sentinela permaneça ativa.
- Sentinela azul equipada pela loja como trinket gratuito (catalogo passa a 71 entradas locais); trata-se de implementacao funcional adaptada ao CoachLOL, sem certificacao integral de mecanicas e balanceamento de LoL. Fallback SVG local claramente distinto da arte oficial.
- Revisao de testes legados: expectativas antigas da ward amarela ou raio perpetuo substituidas pelo contrato atualizado, sem ignorar falhas.
- `npm test` PASS apos todas as mudancas; `node tests/v453_dev45_gameplay_ui.test.mjs` 18/18 PASS.
- Verificacao do navegador ocorreu com HTML em contexto local e roteamento de assets; nao demonstra ambiente de servidor PvP online.
