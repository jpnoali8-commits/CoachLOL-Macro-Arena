# CoachLOL Macro Arena V38.2 — 26/10/2026

Base: V38.1 consolidada. Migração seletiva dos arquivos cinematográficos da V3.7, sem regredir código de gameplay.

- Nami W corrigida: 725 unidades, deslocamento por caminho até alcance, revalidação no cast, mana por rank e cooldown absoluto de 10 segundos após cast, bounce aproximado de 800 unidades.
- Slots Q/W/E/R em combos: alcance por definição (três habilidades verificadas; demais limitações provisórias), aproximação e cooldown/custo por registry. Nami W do combo aguarda confirmação de cast antes de avançar.
- Lux R: 3400 unidades, cooldown por rank e raio/traço VFX simplificado; Nami R: 2750 unidades, evento de onda e cálculo inicial de hits/CC. Ambos permanecem aproximações de gameplay; não representam sistema final de projéteis.
- Gank por destino navegável, privado para o adversário enquanto oculto. Alvo inimigo sem visão continua impossível de travar por ID, para evitar wallhack.
- Eventos de gameplay incluem `id`, `tick`, `round`, `observedBy` no instante e `public`. `perspective(team)` filtra por visão para alimentar overlays; fundação cinematográfica v3.7 integrada ao frontend da V38.1.
- Cinematics incluem manifesto offline, skip, fallback e hook opcional GLB; nenhum modelo/filme GLB autoral foi implementado nesta versão.
- `docs/AUDITORIA_V38_2_ENGENHARIA.md` e `docs/ROADMAP_CANONICO_V38_2.md`: estado real, riscos e marcos reorganizados.
- Suíte histórica + 8 testes cinematográficos + novos testes V38.2; browser smoke com JS/CSS locais embutidos.

**ATENÇÃO:** Um turno de 10s pode satisfazer exatamente o cooldown de 10s do W de Nami. Isso não é erro: cooldown de LoL é por tempo, não por contagem arbitrária de turnos. Cooldowns maiores (como Nami R) não reiniciam entre turnos.

**Pendências:** kits individuais completos, projéteis em trânsito, efeitos genéricos CC, reposições de cooldown/haste, target UI por direção, runas/itens oficiais, fog seguro com servidor, GLB/vídeo reais, economia e 5v5 calibrados.
