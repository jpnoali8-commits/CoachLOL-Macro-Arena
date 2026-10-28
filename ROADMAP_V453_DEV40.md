# Roadmap — após V4.5.3-dev40

Dev40 concluído: correção de interações entre on-hit e escudos, legalidade de acertos sob proteção, consumo de Energizado em golpes fatais e golpes absorvidos, contrato de habilidades on-hit explícitas, 16 testes unitários, Node/browser sincronizados, Chromium e amostra de pacing.

**Próxima etapa recomendada — dev41:**
1. Catalogar as habilidades de campeões realmente elegíveis para aplicar on-hit, **uma por uma**, com validação de geometria/projéteis e hit registration (sem marcar QWER completos por abstração).
2. Cobrir efeitos de dano ao contato em alvos especiais, escudo de feitiço, múltiplos acertos, invisibilidade, morte simultânea e interações de penetração/resistência; casos devem possuir casos independentes com snapshots/replay.
3. Ampliar lotes jogáveis dos itens oficiais com atributos/passivas e matrizes, mantendo a loja de referência segregada.
4. Executar regressão `npm test`, Chromium real e partidas múltiplas; não perseguir artificialmente 30 minutos.

Persistem requisitos fundamentais do projeto: partida termina por Nexus; overlay de Golpear acima de HUD/modais; futuramente Mordekaiser R em painel quadrado superior esquerdo com círculo de colisão e cópia fiel da região real do tabuleiro; Central de Patches versionada sem importar mudanças automaticamente.
