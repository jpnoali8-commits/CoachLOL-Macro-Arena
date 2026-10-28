# QA — CoachLOL dev59 (28/10/2026)

**Escopo canônico:** PvP 1v1 entre dois humanos; jogador azul possui os cinco campeões azuis e jogador vermelho possui os cinco vermelhos. **Não existe lobby 10 humanos neste modo.**

## Gates verificados

- `node tests/v453_dev59_pvp_1v1_mercury.test.mjs` → **15/15 PASS**.
- `node tests/v453_dev47_multiplayer_network.test.mjs` → **23/23 PASS**.
- `npm test` integral → **exit 0 / PASS**. Log: `docs/QA_EVIDENCE_V453_DEV59/npm_test_full.log`.
- Pacotes de comando não podem declarar equipe inimiga; cada sessão controla exclusivamente seus cinco IDs. Proteção de sequência/idempotência e validação por unidade.
- Duas confirmações para executar turno; uma confirmação mantém adversário em planejamento.
- Reação defensiva do ADC azul foi testada; o rival não vê nem pode responder à reação privada azul.
- Visão privada e nenhum snapshot bruto no payload público.
- Reinício do registro restaura dois tokens, 5+5 IDs e a sequência seguinte.
- HTTP real testado para criação da sala, segundo cliente e rejeição de terceiro cliente/sala de 10.
- QSS/Cimitarra: dados/receitas do Data Dragon 16.21.1 em SR 26.21, retirada de CC menos airborne, recarga e sprint em testes.
- Loja: **100/202** itens SR gerais vinculados; **102** referências somente leitura; `mismatches=0` no gerador do catálogo.

## Limitações honestas

- **Jogo humano até o Nexus NOT_CERTIFIED**: suite usa simulações controladas da sala, sessões HTTP e ações de rede, não dois jogadores reais completando partida. Não inferir ritmo de 30 minutos.
- **Chromium visual NOT_CERTIFIED**. O cliente PvP é um protótipo funcional compacto, distinto do HUD completo, que não recebeu certificação visual neste ciclo.
- **QSS/Cimitarra PARTIAL**: efeito CC em tipos resolvidos pelo motor; recarga 90 segundos e velocidade de Cimitarra +25% por 1,5s são adaptadores, não números oficialmente certificados; persistência mantém recarga após venda.
- **Ícones oficiais Riot offline NOT_ACQUIRED**: sem fallback Wiki.
- 102 itens gerais consultáveis sem execução; itens vinculados não equivalem a passivas/ativáveis integralmente certificadas.
- Kits de Sylas, Neeko, Mordekaiser, Viego e outros incompletos; IA dos bots não ampliada.
