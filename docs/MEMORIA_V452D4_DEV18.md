# Memória de continuidade — dev18

Base: `CoachLOL_MacroArena_V452d4_Dev18_ElderSubticks_RiftFog_JogoCompleto.zip`, exclusivamente a partir da dev17.

Mudanças autoritativas: `advanceElderSubticksV452d4Dev18(throughTime)` e campos `preciseNextAtV452d4Dev18` em Elder burn, `preciseAtV452d4Dev18` em execução. O legado dos métodos `resolveElderBurnV452d` / `resolveElderPendingV452` fica disponível para testes e snapshots antigos. `tick()` usa novo resolvedor, enquanto o rate do jogo continua 1 segundo lógico por tick. Ledger compacto de efeitos persistido em `elderSubtickLedgerV452d4Dev18` no snapshot.

11/11 novos contratos, npm test global exit 0, Chromium microtick/replay PASS. Seis variantes validadas no essencial de máscara/ward/fog, sem paridade 1:1. Duração Elder 180s herdada do branch, divergência histórica de 150/180s pendente de auditoria para patch pretendido.

Preservar CC0 SVGs, Baron minion siege, summoners D/F, competitive Smite, authored masks, Rift Once-per-match, farm calibration, snapshots, Git inherited dirty working tree. Não declarar partida orgânica concluída.
