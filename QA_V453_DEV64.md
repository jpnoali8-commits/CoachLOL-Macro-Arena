# QA — CoachLOL Macro Arena V4.5.3-dev64

## Regressões executadas

| Verificação | Resultado | Evidência no ZIP |
|---|---|---|
| `npm run test:v453:dev61` | **PASS 22/22** | `docs/QA_EVIDENCE_V453_DEV64/dev61.log` |
| `npm run test:v453:dev62` | **PASS 18/18** | `docs/QA_EVIDENCE_V453_DEV64/dev62.log` |
| `npm run test:v453:dev63` | **PASS 25/25** | `docs/QA_EVIDENCE_V453_DEV64/dev63.log` |
| `npm run test:v453:dev64` | **PASS 26/26** | `docs/QA_EVIDENCE_V453_DEV64/dev64.log` |
| `npm test` histórico completo incluindo dev64 | **PASS exit code 0** | `docs/QA_EVIDENCE_V453_DEV64/npm_test_full.log`, `npm_test_exit_code.txt` |
| Chromium real, UI de reação com dois contextos | **PASS 13/13** | `chromium_reaction_report.json`, `dev64_{blue,red}_reaction.png` |
| Engine Node ↔ browser | **PASS, 73 exports** | `python tools/sync_browser_v43.py` |
| Validação sintática `node --check` (motores e cliente) | **PASS** | Verificação local |

## Cenários de combate dev64

O motor PvP agora envia `pendingDecision` tanto para defesa **azul** quanto para defesa **vermelha** após um impacto real de `Arena.attack()`. Teste controlado posiciona MID azul e vermelho próximos (fixture espacial), registra `duelPermission`, aplica ataque real e avança o motor pelo servidor. **Não se injeta pendingDecision manualmente nem se reduz HP diretamente**. Em seguida, duas sessões HTTP independentes, com cookies reais, conferem que apenas o defensor recebe detalhes, o atacante não consegue responder pela vítima, e o tempo fica pausado.

Persistimos o estado na janela de reação e reiniciamos o servidor. Depois da reconexão, ambos os times preservam tokens, dono dos cinco campeões e pausa; R não aprendida é recusada sem consumir sequência, enquanto Q aprendida é aceita em um combo autoritativo. A resposta retoma a execução e o tick seguinte **consome a etapa Q**, com `comboIndex=1`. O mesmo comando repetido após a janela retorna o recibo idêntico, sem reaplicar efeitos; tentativa de reutilização de sequência com outro payload é rejeitada. Cada direção registra 13 contratos (total 26).

**Importante:** Esse é um teste de impacto real e retomada com clientes programáticos. Não houve uma partida competitiva completa manualmente operada por duas pessoas, nem teste completo de execução de todas as skills Q/W/E/R e dos feitiços na mesma luta. A dev63 continua certificando apenas duas partidas completas *roteirizadas*, com ambos os Nexus destruídos naturalmente em seeds conhecidas, e não paridade total.

## Chromium

Dois contextos independentes carregaram o cliente real `multiplayer.html` + `pvp_client_v453_dev47.js`, com snapshots de decisão obtidos do teste HTTP e injetados numa página offline. Ambos verificaram painel visível só para defensor, alvo do agressor, R desabilitado, step Q e POST enviado com `decision.reaction`, 0 erros JS. **Não certifica transporte HTTP/SSE browser-native**: localhost ainda é bloqueado pelo Chromium do ambiente. Capturas de tela não representam uma sessão browser navegando via servidor local.

## Fora de escopo / NÃO CERTIFICADO

- **Partida completa jogada por duas pessoas reais** usando browsers independentes do lobby até Nexus: `NOT_RUN`.
- **Browser-native HTTP/SSE**, e interação visual do mapa com servidor ao longo de uma partida real: `NOT_CERTIFIED` por bloqueio de rede do Chromium no ambiente. O Node HTTP/SSE nativo já foi coberto na dev63.
- **Todas habilidades, passivas e efeitos dos 173 campeões**: `NOT_CERTIFIED`. As novas verificações certificam a janela de reação e a etapa Q nos perfis usados.
- **100 itens ainda reference-only**: nenhuma promoção para playable nesta dev64. Dos 102 vinculados, muitos efeitos ainda requerem certificação individual. Não afirmar equivalência 1:1 com Riot.
- **Smite competitivo, disputas de objetivos, Neeko, Sylas, Viego e Mordekaiser R**: não ampliados nem certificados nesta dev64.
- **Farm/pacing multidraft após mudança de física**: não aplicável; a dev64 não alterou física, dano, minions, gold nem torres. O conjunto histórico `npm test` foi executado e passou; não equivale a nova amostra de 30 seeds.

## Garantias de continuidade

- Não alterada a regra dev61 de **Desfazer irreversível após saída física da fonte**.
- Sem IA avançada de bots; fora de `mode=pvp`, caminho histórico da resposta azul permanece como antes.
- Sem mudança de patch: **26.21 / Data Dragon 16.21.1** arquivado.
- Preservação de entradas do ZIP dev63 e `.git` verificada pelo relatório externo de integridade CRC/SHA-256.
