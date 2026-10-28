# Roadmap após V4.5.3-dev31

1. **Dev32 — catálogo completo e auditável:** conseguir arquivo real `item.json` do Data Dragon 16.21.1/patch 26.21, aplicar importador somente após conferir escopo Summoner's Rift e receitas; corrigir disponibilidade, ícones, custos, componentes e itens de missão. Dados brutos ≠ efeitos implementados.
2. **V4.5.3 demais lotes:** finalizar passivas e ativos de itens defensivos, ofensivos, cura, crítico, dano de contato, consumíveis, transformações/upgrades de botas; exclusividade, cooldown, estados de combate, tudo auditado em snapshots e Chromium.
3. **V4.5.4 campeões:** atributos base, crescimento por nível e Q/W/E/R/passiva de todos os campeões, por lotes; forms Nidalee/Elise/Shyvana e combos de troca.
4. **V4.5.4 Mordekaiser:** implementar Reino da Morte real no motor primeiro; instância 1v1 com mesmo recorte geométrico, colisores, brushes e modificações por Rift Elemental do tabuleiro original; restrição circular adicional; viewport **quadrada** no canto superior esquerdo, acima de modais normais e abaixo do Golpear; ao fim, fecha automaticamente e devolve posições relativas reais. Validar 6 variantes, mortes, replay e fog.
5. **Pacing/QA:** média alvo ≈ 30 minutos, vitória apenas por Nexus, múltiplas seeds e Chromium 5v5 completo após novos itens e kits.
