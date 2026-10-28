# Roadmap após dev64

1. **Dev65 – integração competitiva de combos ao fluxo inteiro:** novos E2E com dois jogadores automatizados que se encontram por ordens autenticadas, disparam projéteis, QWER e feitiços; cobertura de duel_request/pickoff/retreat, fog em combate e mortes. Nenhum auto-bot oculto no PvP. Validar sessão Chromium HTTP/SSE nativa apenas fora do bloqueio deste sandbox.
2. **Lotes certificados de itens SR 26.21 / Data Dragon 16.21.1:** entre 100 reference_only selecionar 1-3 e implementar todos os stats/receita/passiva/ativa/cooldowns/on-hit/compra-venda-Desfazer/snapshot; manter reference_only se efeito ausente. Reconciliar assets oficiais offline, não presumir CDN.
3. **Kits individuais:** Sylas R roubo, Neeko, Viego, Mordekaiser R viewport quadrada e arena circular com cenário clonado/colisores/brush. Não generalizar ultimates.
4. **Farm/estruturas e pacing multi-draft:** auditoria seeds/CS antes de alterar física.
5. **UI 16:9:** validar combo QWER e Smite overlay em Chromium com mapa/visão reais, inputs físicos e interação entre dois perfis independentes; tela final já em dev63.

**Limites atuais:** testes HTTP programáticos não equivalem a humanos jogando. Itens 102/202 ligados ao motor mas seus efeitos NÃO todos certificados; 100 apenas referência. Regra Desfazer da fonte é imutável.
