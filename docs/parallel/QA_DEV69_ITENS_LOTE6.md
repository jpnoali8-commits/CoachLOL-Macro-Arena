# CoachLOL dev69 — QA itens Batch 6 (15 ofensivos)

Base imutável: `dev69/items-batch5` (`18b3c7dc9022788dfb2ecf47b4f5b80e47e20095`). Branch: `dev69/items-batch6`. PR empilhado no Batch 5, **não mesclar**. Referência fixa Riot PC 26.21 / Data Dragon 16.21.1.

| Riot ID | Item | Efeito implementado autoritativamente | Estado |
|---|---|---|---|
| 3087 | Faca de Statikk | Corrente de relâmpagos em inimigos próximos visíveis, energizado | Partial |
| 3095 | Chuva de Canivete | Dano mágico de energizado e velocidade temporária | Partial |
| 3100 | Perdição de Lich | Lâmina Arcana mágica após habilidade, consome carga | Partial |
| 3118 | Malevolência | R habilita queimadura temporária em inimigos atingidos | Partial: redução MR/solo |
| 4628 | Foco do Horizonte | Dano de habilidade distante revela inimigo | Partial: visão secundária |
| 4646 | Ápice da Tempestade | Janela de dano e explosão com atraso/cooldown | Partial |
| 6655 | Eco de Luden | Seis ecos mágicos com alvo secundário e cooldown | Partial |
| 6662 | Manopla dos Glacinatas | Lâmina Arcana física com lentidão em área | Partial |
| 6695 | Presa da Serpente | Debuff que reduz escudos presentes e futuros | Partial |
| 6696 | Arco do Axioma | Abate/assistência reduz CD restante da ultimate | Partial |
| 6697 | Húbris | AD derivado temporário por abates | Partial |
| 6699 | Cicloespada Voltaica | Habilidade gera Energizado e próximo AA causa dano físico extra | Partial |
| 2503 | Tocha de Chamas Negras | DoT mágico e AP derivado dos inimigos queimados | Partial |
| 2512 | Dardos de Caça-Demônios | Ultimate concede até 3 ataques fortalecidos por 8s | Partial |
| 2510 | Aurora e Crepúsculo | Lâmina Arcana, dano mágico, cura e on-hit adicional | Partial |

Os 15 têm ID, preço, revenda, componentes e atributos originados no DDragon arquivado. Catálogo na branch: **182 engine_playable / 20 reference_only**, somando 202 itens normais SR. O estado `engine_playable` NÃO equivale a `certified`.

**QA remoto inicial:** [GitHub Actions #40765937496](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40765937496) aprovou `node --check engine.mjs`, sintaxe do executor e testes: **Batch6 23/23 PASS**. Sua regressão anterior falhou no primeiro assert de contagem fixa `167/35` herdada do Batch5; os testes legados de lotes anteriores são ajustados sem perder os contratos de cada item e devem ser reexecutados. Não declarar QA integrado ou release até GitHub CI verde e auditoria específica.

**Limitações:** adaptações de parâmetros para turnos, sem geometria exata de projéteis, MR do solo, crítico Riot 1:1, valores por nível, efeitos exatos em monstros e estruturas, e testes visuais PvP duas sessões. Estados temporários por campeão/alvo e regra anti-recursão de item estão no Node. Requer validação de snapshot/replay completo, fog, Undo e reconexão pelo integrador; `engine.browser.js` não foi alterado.

**Próximo:** Batch7 para os 20 itens pendentes. Auditor fará merge sequencial apenas quando usuário autorizar. Rollback seguro com `git revert`, sem reset/force push.
