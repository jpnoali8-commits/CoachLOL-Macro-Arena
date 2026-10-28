# Roadmap — após V4.5.3-dev41

**Dev41 concluída:** Q de Ezreal (projétil com primeira colisão e on-hit), Q de Irelia (dash validado em parede, on-hit, cura, reset por abate), ordens de combo/auto, 18 contratos novos, regressão integral, Chromium real, três partidas por Nexus.

**Próxima etapa recomendada — dev42:**
1. Completar interação de **Ezreal Q** com projéteis dinâmicos e colisor em trânsito, bloqueadores posicionais e alvos especiais (monstros, sentinelas/estruturas quando aplicável), sem abrir visão oculta.
2. Refinar **Irelia Q** com dash temporal, interrupção e reset por marca, respeitando rooted/grounded/CC e variantes do Rift sem atravessar colisores.
3. Auditar e implementar habilidades individuais adicionais on-hit (por exemplo, Yasuo Q e Warwick Q) APENAS com multiplicadores, tipagem, penetração, imunidades e multi-hit testados.
4. Ampliar catálogo realmente jogável separadamente dos registros de referência; não expor habilidades e itens apenas textuais como completos.
5. Regressão `npm test`, captura Chromium e partidas naturais até destruição do Nexus; não aumentar artificialmente duração.

**Permanentes:** HUD preto e dourado; overlay de Golpear no topo; reino isolado de Mordekaiser R em painel quadrado superior esquerdo com limite de círculo real; six Rift Elemental masks; fog, visão, objetivos, snapshots e Git originais intactos.
