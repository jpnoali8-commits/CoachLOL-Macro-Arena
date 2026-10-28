# CoachLOL — Auditoria e gates após a revisão v1.2

## Gate G00 — Integridade dos dados do editor [APROVADO NOS TESTES]

- Não mover torres, nexus ou campos por estimativa.
- Preservar `data/coachlol_map_v6.json`, máscaras e atlas 4096×4096 como fonte dos objetos.
- Referência visual do atlas sem perspectiva obrigatória, orientada pelo mapeamento aprovado.

## Gate G01 — Motor base de tempo e ordens [PARCIAL]

- **Aprovado:** simulação só após ambas as confirmações (ou timeout), com tempo compartilhado, planos persistentes por campeão e testes determinísticos.
- **Faltando:** servidor autoritativo, replay com hash e validação de desconexões.

## Gate G02 — Waves, XP e farm [CORREÇÃO ENTREGUE; CALIBRAÇÃO PENDENTE]

- **Corrigido:** parada fora de alcance, acompanhamento automático da frente da lane, auto last hit, XP por proximidade e aumento de nível.
- **30 testes gerais passaram.** Um cenário de 360 s agora concede CS/XP a TOP/MID/ADC sem script artificial de gold.
- **Aceite final:** centenas de partidas/seed reproduzíveis; waves equilibradas sem intervenção; freeze/slow push/fast push; prioridades de minions e campeões; last hits por classe, torre e alcance; benchmark de CS por 10 min com perfis jogáveis; XP compartilhado conforme dados do patch.

## Gate G03 — Movimentação e ergonomia [CÓDIGO INTEGRADO; QA VISUAL PENDENTE]

- Selecionar aliado → clicar livre no mapa → destino persistente.
- Seleção contextual de torre, camp, inimigo visto; HUD inferior flutuante sem painel lateral de comandos.
- Last hit/autoataque/seguir lane funcionam como automações independentes da rota.
- **Aceite:** browser smoke test em 1440x900 e 1920x1080, troca entre cinco campeões, rota de 2+ etapas, zoom e pan, nenhum elemento bloqueando cliques.

## Gate G04 — Bot local e jungle [PARCIAL]

- Bot usa estado e RNG sem vazamento intencional de visão, compra item inicial, reage a ameaças, segue sua lane e recebe farm/XP.
- Junglers podem iniciar limpeza heurística; há composição de camps e timers ainda aproximados.
- **Aceite:** TOP/JG/MID/ADC/SUP do bot nos caminhos corretos em 30 partidas; camps do lado correto; clearing de grupos, dano/XP real, respawn, leash e invasões não aleatórias; sem atravessar colisores; mais de 30 seeds sem travamento.

## Gate G05 — Fog, ameaça e resposta [PARCIAL]

- Motor filtra inimigos fora da visão e inclui visão de aliados/minions/wards/estruturas; moitas e paredes são tratadas na rasterização experimental.
- Eventos de dano e morte ficam no log privado da equipe; HUD oferece postura/resposta **para o próximo turno**.
- **Aceite:** teste coordenado de entrada/saída de moita e pink/ward, clone de mapa 4096, linha de visão correta nos 2 times, nenhuma ordem inimiga privada revelada, nenhuma morte silenciosa; decidir se haverá fase extra de reação com travas simétricas.

## Gate G06 — Combate e estruturas [PARCIAL]

- Aggro de torres e wave-vs-wave existem como simplificação; ataque automático e foco básico funcionam no motor.
- **Aceite:** DPS por classe, ataque/casting, tower dive e resets de aggro, target priority, minion tankando torre, negação de ataque a estruturas sem wave quando houver ordem de pressão, morte e respawn por tempo/nível.

## Gate G07 — Conteúdo LoL 1:1 [AUSENTE / ETAPAS FUTURAS]

- Q/W/E/R/passiva por campeão; cooldown e recursos (mana, energia, fúria ou nenhum); habilidades de peel, engage, deslocamento e CC.
- Dois summoner spells por campeão durante draft, Smite/Flash/TP/Exhaust/Ignite etc, com compatibilidade e cooldown.
- Todas as runas, páginas e shards, efeitos combinados de itens, loja de seis slots, trinket e ativáveis, upgrades de suporte, receitas e recomendações por patch.
- Dragões, Alma, Ancião, Barão, Arauto, Vastilarvas e missões/lane quests; mecânicas exactas dependentes do patch.

## Gate G08 — 3D low-poly e multiplayer [AUSENTE]

- Geometria 3D gerada de colisor/brush/rotas originais; navmesh, obstáculos/elevação, animações, LOD, instancing, orçamento de renderização.
- Rust + WASM para simulação e host nativo; persistência/replay; servidor autoritativo; ranqueado/PDL e calibragem de Elo por win rate.

## Histórico técnico

- v0.9: relógio dependente da confirmação, velocidade e máscara + dados v6.
- v1.2: corrigida paralisação de waves; inserido last hit real, XP, level up, lane autopilot, comando direto, dock/ações de alvo, alertas táticos no próximo planejamento.

**Princípio de gate:** não classificar uma funcionalidade como concluída só porque existe um botão, mockup ou representação visual. Critérios exigem automação, regras executáveis, testes determinísticos e validação de interface.
