# Roadmap após dev39

**Dev39 — concluído:** status de procs no HUD/loja, Kraken terceiro hit entre alvos, movimento Energizado com categorias autorizadas, contratos de preservação Node/browser/snapshots, QA e ZIP mestre.

**Próxima dev40 — prioridade ideal:**
1. Expandir movimentação especial por campeão sem heurísticas de teleporte. Catalogar todos os dashes/blinks e efeitos de projeção que aplicam on-hit.
2. Reconciliar Kraken/Arco Recurvo/Nashor e Energizado nos alvos especiais, proc de habilidades, interações com shields e dano no golpe fatal, com testes detalhados por campeão e alvo.
3. Validar UI de recargas em execução real e por perspectivas sem vazamento do fog of war. Automatizar testes de snapshot/replay após upgrades de itens.
4. Só então ampliar o conjunto funcional do catálogo, reexecutando `npm test`, Chromium e partidas independentes por seed. Não alterar duração com penalidades artificiais.

**Futuro maior:** 173 fichas oficiais não representam kits completos. Mordekaiser R exige painel quadrado superior esquerdo com domínio circular e geometria/colisores do tabuleiro clonado, acima do HUD comum. Blender continua opcional e fora do escopo deste pacote.
