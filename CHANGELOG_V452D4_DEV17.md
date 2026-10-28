# Changelog — CoachLOL V4.5.2d-4-dev17

## Implementado

- Corrigido um caso em que um canhão fortalecido pelo Barão acertava uma torre **fora do alcance efetivo**, porque o motor usava somente proximidade na spline da rota.
- Nova função `minionCanHitStructureV452d4Dev17`: verifica equipe, vulnerabilidade da estrutura e alcance em **unidades reais do mapa**, incluindo o raio físico da estrutura convertido dos pixels do atlas 4096×4096.
- `minionAttackTargetV452c` agora prevê alvos usando o mesmo alcance fortalecido usado pelo motor de combate; não atribui alvos distantes fictícios.
- `predictMinionAttackDamageV452c` passou a chamar `baronMinionAttackDamageV452d`, eliminando divergência da multiplicação genérica anterior durante o cálculo de last-hit.
- Nenhum atributo-base dos minions foi alterado. Aura do Barão continua derivada dos portadores vivos, sem armazenar mutações permanentes no minion.
- Ícones vetoriais CC0 da dev16, aura roxa, máscaras, Florividente, Champ Select D/F, Golpear competitivo e sistemas elementais preservados.

## Evidência numérica controlada

Canhão normal: primeiro ataque na torre aos 6 ticks, **36 HP** acumulados até sua morte.
Canhão com Barão: primeiro ataque no tick 2, **148 HP** acumulados até sua morte.
Esses números descrevem uma fixture específica, não o balanço geral do jogo.

## QA

- Novos contratos: **8/8 PASS**.
- `npm test`: **PASS exit 0** após correção do teste legado V16.
- Chromium: **PASS**, dois PNGs capturados a partir do render real, 8 ticks controlados, 15 SVGs e atlas carregados, zero erros JS.
- Sincronização Node/browser: **68 exports**.
