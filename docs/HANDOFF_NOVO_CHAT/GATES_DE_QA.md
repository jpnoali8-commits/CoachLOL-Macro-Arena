# V4.5.2d-3 — Gates de QA e integridade

## Preparação

- `git status --short` para preservar trabalhos não commitados.
- `node --check engine.mjs`
- `npm run test:v452c` (golden de farm + freeze parcial conhecido)
- `npm run test:v452d && npm run test:v452d2`
- `npm test` (registrar tempo e exit status; se travar, quebrar regressões por grupo SEM declarar a suíte completa aprovada)
- `python tools/sync_browser_v43.py` (comparar exports e garantir não divergir código navegador).

## Casos obrigatórios novos

1. **Stacks** 0/1/2/3 de dragão por elemento aplicados ao time correto; snapshot/restauração sem reaplicar stats em dobro; alterações de nível/itens preservam cálculo derivado.
2. **Hextech** alteração de AS/AH e CDR derivado, sem cooldown negativo; Chemtech tenacity/elegibilidade e heal/shield multiplicativos definidos.
3. **Baron** no abate: quem recebe? sobreviver/morrer/expirar/respawn; aura vale apenas perto de portador vivo; canhão/super, estruturas protegidas, Recall interrupção.
4. **Elder** burn e execução em alvo curado/escudado/invulnerável/em stasis, kill único, sem reativar Souls.
5. **Smite** simultâneo 2–10 campeões com regras de desempate, fog/visibilidade, sem duplo gasto, sem recompensas duplicadas, replay determinístico.
6. **Fog** eventos adversários ocultos redigidos; cliente de cada equipe só recebe eventos permitidos.
7. **Farm** normal mantém a banda local 35–47 nos cenários v452c; CS real; freeze TOP/MID identificado como pendência, sem falsear resultado.
8. **Speed 1×/2×** mesma história causal em tempo simulado, apenas latência de apresentação diferente.
9. **Performance** medir tick p50/p95 e taxa de eventos com 5v5 em objetivo; comparar pré/pós patch; não aceitar loop O(champions×minions) por frame sem justificativa.

## Estado herdado dos testes (não corresponde a teste novo)

| Teste | Último resultado registrado |
|---|---|
| `tests/v452d2_dragon_souls.test.mjs` | PASS 10/10 |
| `tests/v452d_objective_effects.test.mjs` | PASS 7/7 |
| `tests/v452c_farm_ai.test.mjs` | PASS_BOUNDED_LOCAL |
| `npm test` integral V4.5.2d-dev2 | TIMEOUT / inconclusivo |
| Chromium visual V4.5.2d-dev2 | NOT_RUN |
| Carga real milhares de usuários | NOT_RUN |

**Gates de entrega:** documentação atualizada, origens/patch para coeficientes, matriz de maturidade, testes com evidência verdadeira, snapshot e compatibilidade, archive CRC e jogo completo, nada apresentado como 1:1 sem validação específica.
