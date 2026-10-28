# V4.5.2d-dev2 — Dragões e recall do Barão

- Base: V4.5.2d-dev1 com farm V4.5.2c do commit `9392c0f` e histórico Git preservados. Nenhum rollback de versões.
- Almas: Infernal dano adaptativo em área com 3s de recarga; Hextech dano verdadeiro encadeado a até 3 alvos adicionais + lentidão 2s, 8s recarga; Oceânica recupera HP/mana ao longo de 4 segundos e 30% de efeito contra minions; Montanha escudo após 5 segundos sem receber dano; Nuvens +15% movimento e aceleração pós R por 6s (30s recarga); Quimtec bônus de dano e redução de dano sob 50% HP.
- Almas têm efeito persistente por time e armazenam cooldowns/procs por campeão, preservados em snapshots; defesa contra recursão e informações ocultas.
- Barão: Recall de 4 segundos no portador vivo, versus 8 segundos comum.
- Invariantes: corrigida dupla concessão de mortes/gold quando proc de Alma mata o inimigo durante o golpe original; suprimido suporte gold duplicado nesses procs.
- Oceânico (dragões acumulados): restaura 2% da vida faltante por stack a cada 5 segundos simulados, no lugar de cura fixa a cada segundo.
- Mantidos `V4.5.2d-dev1` (minions por tipo e burn do Ancião) e calibrador de farm V4.5.2c.
- **NÃO CERTIFICADO 1:1:** percurso real dos projéteis/slow decrescente, stats combinados e algumas interações de itens, todos os 6 passivos dos dragões, stacks exatos por patch e VFX definitivos.
