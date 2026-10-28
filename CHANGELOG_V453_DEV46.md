# CoachLOL Macro Arena — V4.5.3-dev46

## Objetivo
Correção autoral do **Point-Vision-Buff-map** e certificação parcial da entrada PvP para posicionamento de sentinelas. Esta versão **não** prioriza IA dos bots nem declara multiplayer online finalizado.

## Alterações de código e dados
- Incorporada a nova imagem `Point-Vision-Buff-map.jpg` enviada pelo usuário, sem reduzir sua resolução original **4096×4096**.
- Reconciliados **12/12 marcadores de ativação** com os 8 polígonos de visão inicial e 4 tardios. O novo marcador corresponde ao `faelight_03`, aproximadamente no pixel `(1374.04, 1704.98)`.
- Marcador de ativação e área de bônus continuam conceitos **diferentes**. O ponto pode estar na borda/fora do polígono de visão correspondente.
- **Ward amarela (`stealth`), sentinela de controle (`control`/pink), sentinela azul (`farsight`) e sentinela aprimorada de suporte (`support`)** ativam bônus temporário quando colocadas em um marcador disponível. Lente Oracle não coloca uma sentinela e não ativa bônus.
- Preservadas áreas adicionais por polígono do autor, duração dos 45 s configurados, desbloqueio 8/4, visão apenas da equipe, supressão e extinção do bônus após o prazo. O raio temporário adicional de +25% também expira.
- Motor Node e motor browser atualizados sem bifurcação das regras.
- `multiplayer/authoritative_actions_v453_dev44.mjs`: `order.ward` agora admite `wardType` validado (`stealth`, `control`, `farsight`) e encaminha ao motor com identidade/equipe derivada da sessão autenticada no servidor, nunca de dados declarados pelo cliente. O gateway permanece **independente de transporte**, sem servidor online.

## QA
- `node tests/v453_dev46_vision_pvp.test.mjs`: **16/16 PASS**.
- `node tests/v453_dev45_gameplay_ui.test.mjs`: **18/18 PASS**, expectativas corrigidas para os assets atualizados e a nova regra aprovada.
- `npm test`: **PASS**, regressão integral.
- Chromium real em 1366×768: 12 sites carregados, 8 disponíveis no início; ward amarela ativou novo local `faelight_03`, `visionSources(blue)` retornou 1 região extra e `visionSources(red)` retornou 0; **0 exceções JavaScript**. Captura em `docs/QA_EVIDENCE_V453_DEV46/`.

## Limitações e próximos marcos
- Ainda falta certificar em partidas PvP online com dois clientes conectados, latência, reconexão e replay em transporte real. A dev46 valida a fronteira de comandos do motor, não uma sessão online completa.
- A certificação integral de todos os campeões, passivas, Q/W/E/R e interações como Sylas/Neeko/Viego/Mordekaiser continua pendente; não antecipar IA estratégica dos bots.
- Revisar regras de substituição de múltiplas wards simultâneas no mesmo marcador em um marco futuro, conforme a regra autoral escolhida.
