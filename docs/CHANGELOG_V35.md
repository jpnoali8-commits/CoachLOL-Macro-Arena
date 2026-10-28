# CoachLOL — v3.5 | Escapes, dano atrasado e habilidades globais (alfa)

## Entrega de código funcional
- `engine.mjs` + `engine.browser.js`: `castEscape`, `activateStasis`, `queueSpecialUltimate`, `resolveSpecialUltimates`, `resolveDelayedEffects`.
- `app.js`: Flash por clique no terreno **durante pausa de confronto**, mapa desbloqueado para apontar destino, sem substituir o plano persistente; controles de Ezreal E e Tristana W; Ampulheta contextual; R de Zed/Karthus/Soraka/Jinx/Ashe/Ezreal; telégrafos táticos e marcador de estase; salvamentos levam efeitos pendentes.
- `catalog`: Ampulheta de Zhonya experimental, uma cópia por campeão.
- `tests/v35_reactions_effects.test.mjs`: 9 novos contratos, incluindo cinco ults com comportamentos distintos e Incendiar por tempo.

## Regras executáveis (adaptações explícitas)
1. **Flash**: teleporte instantâneo até 400 unidades (não 900), exige chegada caminhável, pode atravessar parede, cooldown 300 segundos simulados. Root/grounded/estase impedem lançar. Não altera rota anterior. Também acessível na janela de combate.
2. **Ezreal E**: blink 475, custa 70 mana, 26s de recarga inicial (simplificado). **Tristana W**: salto 900, custa 30, 22s iniciais (simplificado). Não inclui ainda projétil extra, slow nem reset da Tristana.
3. **Zed R**: marca individual, causa dano diferido no começo da próxima rodada, permitindo reação de estase. Fórmula **aproximada**, ainda não armazena o dano recebido ao longo da marca nem replica as sombras.
4. **Karthus R**: canalização representada por efeito pendente até a próxima rodada; dano global se conjurador estiver vivo. Ainda não há todas as interações de interrupção/CC/passiva.
5. **Soraka R**: cura aliados vivos globalmente, maior abaixo de 40% HP, quando a conjuração é resolvida.
6. **Jinx R / Ashe R**: direção selecionada no mapa; primeiro campeão no corredor recebe dano após a janela tática. **Ezreal R**: atravessa múltiplos campeões nesse corredor. Ainda faltam velocidades, trajetórias por segundo, splash, CC da Ashe, decaimento e VFX reais.
7. **Incendiar**: dano inicial seguido de quatro ticks simulados; estase pode impedir um tick. Não é ainda a fórmula oficial.
8. **Defender / recuar**: não torna o campeão invulnerável. Ataque causa dano sempre que o alvo estiver efetivamente no alcance no momento de resolução.

O motor da alfa continua determinístico em Node e navegador. O gerador de mídia não está incluído; ícones offline existentes continuam como fallback.

## Verificação
- `npm test`: 115 testes/contratos aprovados.
- Chromium: reações de pickoff e confronto → Flash → clique no chão → cooldown → retomada, sem erros JS no cenário executado.
- Fonte real entregue, **não conceito estático**.
