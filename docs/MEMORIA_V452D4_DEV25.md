# Memória de continuidade — dev25

Base canônica do projeto: **V4.5.2d-4-dev25**, extraída integralmente da dev24; manter `.git` e alterações herdadas sem reset, clean ou commit automático.

- Motor JS segue autoridade offline; browser sincronizado com 68 exports.
- Índice de minions: buckets numéricos de grid (antes: chaves string), teste de equivalência com implementação anterior. `nearbyMinions` retorna mesmos minions e mesma ordem.
- Bloqueadores de rota: cache **temporário somente durante `moveMinions()`**; inválido entre ticks/mutações de estruturas. Não serializar cache no snapshot.
- 30 partidas (cinco drafts × seis seeds) encerraram pelo Nexus, média 26:17, P90 33:18, sem censura de CPU com MAX_PROBE_MS=40000; a meta de design continua em torno de 30min e **não está certificada para kits completos**.
- Seed 26 baseline resultado determinístico dev24/dev25 idêntico: 1998 segundos, vencedor azul, mesmo hash e estruturas; wall-clock 8429ms→5806ms neste host.
- `npm test` PASS; Chromium cerco de oito ticks PASS com 15 SVG CC0, fixture apenas.

Próximo: dev26 profiling de `visionSources`, pathfinder e custo das waves com todos os kits + reauditar padrões econômicos após migrar itens/campeões (V4.5.3/V4.5.4). Não alterar HP/dano para forçar duração por relógio. Preservar Rift, Smite D/F, Arauto, Ancião, máscaras autorais, ícones CC0 e farm calibrado.
