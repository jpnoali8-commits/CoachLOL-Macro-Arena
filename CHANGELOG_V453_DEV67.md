# CHANGELOG — V4.5.3-dev67

- `engine.mjs`: novo `applySummonerHealV453Dev67` reutilizado por comandos planejados e combos; segundo Heal não duplica no self quando falta aliado; prioriza aliado explícito elegível.
- `queueSummoner`: alvo inexistente é recusado e Curar dirigido a adversário é recusado sem consumo de recursos.
- `resolveSummonerCasts`: Ignite/Exhaust com alvo explícito só efetuam cast contra aquele alvo visível e em alcance; não podem selecionar outro inimigo silenciosamente; sem alvo, mantém auto-selection legada.
- Regressão de duas sessões HTTP independentes cobre as duas equipes, shield/barrier, ghost, root/stun, replay, cooldown, checkpoint e privacidade.
- Nenhum valor de item, regra de farm/estrutura ou catálogo de bots foi modificado.
