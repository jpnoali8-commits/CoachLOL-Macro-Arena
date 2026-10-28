# Memória de continuidade — V4.5.3-dev32

A base canônica seguinte é **dev32**, criada sobre a árvore **dev31**, sem mexer no `.git` herdado. ZIP de jogo completo será `CoachLOL_MacroArena_V453_Dev32_Itens_Critico_Consumiveis_JogoCompleto.zip`.

- Catálogo 62, 6 itens novos: Zeal, Kraken Slayer, Rapid Firecannon, Navori, Health Potion, Refillable Potion. Novo módulo `tests/v453_dev32_crit_consumables.test.mjs` 14/14 PASS; `npm test` final PASS; engine/browser 70 exports.
- Funcionais/parciais: Kraken 3º ataque, Navori QWE -15% cooldown restante, Recurve Bow +15 onhit, poções tick inteiro; Rapid Firecannon passive ainda NÃO implementado.
- Importador `tools/import_full_shop_v453_dev30.mjs` bloqueia `--apply` em catálogos menores que 150 compráveis de SR ou com receitas incompletas. **O JSON oficial completo 16.21.1 NÃO está no pacote.** Não reportar catálogo 1:1.
- Match5: 5/5 terminou por Nexus, média **25:17** vs meta ~30m; status reequilíbrio pendente, vencedores podem mudar por alteração dos atributos antigos.
- Chromium: receita Navori completa Zelo + 2 Daggers, 950g final, screenshot real; 15/15 CC0 map icons; 0 erros.
- UI Mordekaiser dev31 painel quadrado placeholder escondido; gameplay ainda pendente. Usar terreno, paredes, brushes e alterações elementais do mapa ATIVO; círculo de movimento somente dentro do painel; isolamento 1v1 real e fechamento automático; Golpear sempre acima de overlays comuns.
- Preservar sempre histórico Git sujo, atlas/máscaras originais, skills antigas, bot, economia, D/F, pós-jogo e replay. Não falsear certificados.
