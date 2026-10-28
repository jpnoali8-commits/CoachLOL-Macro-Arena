# CONTRATO — TURNO SIMULTÂNEO, TEMPO E MOVE SPEED

## Versão 0.9 implementada

`roundStartMonotonic` marca o começo; cada equipe apresenta ordens privadas e trava sua própria decisão (`LOCK`). O processamento só começa após a confirmação de ambas ou timeout. `elapsedSecs = ceil(max(lockTimestamps)-roundStart)` limitado a `[1, maxDecisionSecs]` (10/30/60). Timer de humano e bot local compartilham o mesmo limite. O UI/servidor é responsável pelo relógio; o core recebe `elapsedSecs` validado.

### Sequências de referência

| A | B | Evento | Ticks game | Distância ideal com 325 MS em trajetória reta |
|---:|---:|---|---:|---:|
| 10 | 10 | segundo lock em t=10 | 10 | 3.250 unidades |
| 10 | 30 | segundo lock em t=30 | 30 | 9.750 unidades |
| 20 | 25 | segundo lock em t=25 | 25 | 8.125 unidades |
| 5 | timeout 30 | timeout | 30 | 9.750 unidades |

**Observação:** números de distância são limite cinemático, não distância efetiva de uma partida com colisões, casts, ganks e movimentos condicionais.

### Transformação entre representação do mapa e unidade LoL

Atlas `4096 × 4096 px` → posição normalizada `[0..1]^2`. Escala inicial de coordenadas de mundo por Meraki/Cassiopeia: `worldWidth=14870 - (-120)=14.990`, `worldHeight=14980-(-120)=15.100`. Esses números **são dados de georreferenciamento de referência, não prova de que os 4096 px do atlas coincidem perfeitamente com o mapa do cliente**. O editor deve fornecer quatro ou mais pares de pontos correspondentes para ajustar transformações geométricas.

Para deslocamento de `(x1,y1)` até `(x2,y2)`:

`Dworld = sqrt(((x2-x1)*worldWidth)^2 + ((y2-y1)*worldHeight)^2)`.

`MSraw = (baseMS+flatMS)*(1+additivePercentMS)*∏multiplicativeMS*(1-largestSlow)`.

Softcaps resumidos: `raw∈[220,415] → raw`; `415..490 → raw×0.8+83`; `>490 → raw×0.5+230`. Movimentos reais requerem check de terrain collisions, duration of cast, CC, animation-lock, path curvature, dashes e fear/charm displacement.

Exemplos de Boots em um campeão-base 325: `325 MS → 350 MS` após botas simples +25. Em 10 segundos ideais, 3250 → 3500 unidades.

### Pseudocódigo autoritativo

```
phase = PLANNING
startsAt = monotonic_server_now()
maxSecs = match.settings.decisionSecs
while phase == PLANNING:
    receiveOrders(team, allowedVisibleInfo(team))
    if teamConfirms(team): sealOrders(team)
    if bothSealed() or now() - startsAt >= maxSecs:
       elapsed = min(maxSecs, max(1, ceil(now() - startsAt)))
       if timedOut: autosealRemainingWithPersistentPlanAndPolicy()
       phase = RESOLVING
       for i = 0 .. elapsed-1:
           deterministicTick(bluePlan, redPlan, worldState)
       storeReplayFrame(elapsed, seed, locks, outcomes)
       phase = NEXT_PLANNING
```

### Riscos de UX

- Curto tempo de decisão gera menos tempo simulado e **não** move campeão muito longe; movimento continua sozinho no próximo turno.
- Um jogador que terminar antes não obriga o outro a terminar e não recebe movimentos antecipados.
- Timer não deve usar tempo de renderização da GPU para determinar segundos simulados.
- Client clock e latência não podem ser autoridade no multiplayer.
- Quando ambos passam sem ordens, políticas prévias e timers continuam, desde que o tempo avance.
- Em save/load, salvar estado lógico e histórico de segundos simulados; janela de planejamento local recomeça ao abrir, não resume relógio obsoleto.

### Source-of-truth e aceitação

- https://wiki.leagueoflegends.com/en-us/Movement_speed
- https://github.com/meraki-analytics/cassiopeia/blob/master/cassiopeia/data.py
- 26 regressões automatizadas do core JS são fornecidas em `tests/core.test.mjs`.
- Estrutura JSON de frames inclui `seconds`, `startGameTime`, `endGameTime`, `orders` e `round`.
