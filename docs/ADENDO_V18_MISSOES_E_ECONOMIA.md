# ADENDO DE BÍBLIA — CONTRATO DE LOJA E FUNÇÃO (v1.8)

**Prevalece sobre regras anteriores de compra inicial, missões e Smite.**

## Contratos

1. Cada participante tem exatamente uma função: TOP, JG, MID, ADC ou SUP, usada para validar aquisições e recompensas.
2. Preparação de abertura **não avança tempo simulado**. SUP recebe item de suporte; JG escolhe pet. Antes da execução, JG recebe pet padrão caso tenha omitido escolha. Configuração de compra automática é explícita para demais lanes.
3. Inventário de seis slots; evolução gratuita de itens de missão substitui o slot anterior. Conclusão final do pet libera seu slot.
4. O item de SUP não é utilizável como item de um mid/ADC, nem itens de JG por TOP/MID/ADC/SUP. Um pet por JG e um item inicial por campeão.
5. Os contadores de missão só progridem por eventos de simulação ou tempo de jogo **durante execução**, nunca enquanto o jogador escreve ordens. Valores corretos de thresholds definidos para LoL SR de 2026, mas efeitos internos ainda aproximados.
6. Compra, pet, build e seleção de rota são **ortogonais**. Comprar não cancela ordem persistente, combate ou caminho planejado.
7. Comandos textuais e botões da loja delegam ao mesmo `Arena.buy()` + `Arena.canBuy()`; não existem dois sistemas paralelos.
8. Bots usam as mesmas regras de ouro, compra, slots, pets e missões; nenhuma vantagem escondida de item sem custo.

## Requisitos em aberto para passar de alfa

- Modelo de dados versionado por patch para todos os itens: componentes/receitas, cooldowns, gold efficiency, unicidade, efeitos, potions e wards.
- Escolha explícita de Smite em disputa de objetivos, disputa simultânea/roubo e prioridade de execução justa.
- Quest SUP com compartilhamento de farm e ward stock real + reposição na loja, regeneração passiva e controle de visão.
- Build adaptativa por campeão, lane, matchup, inimigos visíveis e economia; compra recomendada **nunca** deve consumir ouro sem aprovação ou opção explícita.
- Kits individuais de campeões e fórmula de dano/defesa para calibrar builds, cooldown reduction e on-hit.
- Import/validação de conteúdo com licenças adequadas para lançamento.
