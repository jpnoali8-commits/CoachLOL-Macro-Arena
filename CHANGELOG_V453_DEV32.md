# CoachLOL Macro Arena — Changelog V4.5.3-dev32

**Base:** dev31 íntegra, preservando alterações herdadas e `.git` sem reset ou commits. Referência LoL PC **26.21** (Data Dragon **16.21.1**). 

## Entregas

- Catálogo local ampliado de **56 para 62 entradas** (6 itens novos): Zelo, Mata-Cráquens, Canhão Fumegante, Adagas Rápidas Navori, Poção de Vida e Poção com Refil.
- Receitas aninhadas e compra de componentes pela árvore original da dev30: Zelo, Kraken, Canhão e Navori. O custo restante do Navori após Zelo + duas Adagas é **950 de ouro**.
- Mata-Cráquens: efeito autoritativo parcial no **terceiro ataque básico válido**, com stacks até 2, janela de 4 s e dano físico escalável; não ativa em estruturas ou magias.
- Navori: reduz 15% do tempo restante de Q/W/E por ataque básico bem-sucedido; R não recebe redução.
- Arco Recurvo: dano físico +15 on-hit e 15% AS (corrigidos atributos do protótipo anterior).
- Poção de Vida: 120 de HP em 15 s; Poção com Refil: duas cargas de 100 HP/12s, recarregadas na fonte. Cura determinística em ticks inteiros, sem recursão.
- Atributos corrigidos pela referência: Manto da Agilidade **15% crítico**; Espada G.P.C. **40 AD**; Cristal de Safira **300 mana**; Arco Recurvo **15% AS**. Isso pode alterar resultados das partidas.
- Botão de poção no HUD e seis ícones geométricos originais de fallback, CC0 isolado apenas aos novos ícones.
- Importador do Data Dragon reforçado: **nunca** aplica catálogo incompleto com menos de 150 itens SR compráveis e **nunca** aplica receitas com componentes ausentes. Sem inferência automática de passivas a partir das descrições.

## Limitações explícitas

- **62 entradas não constituem catálogo completo do LoL**. A importação integral do `item.json` oficial não foi possível na execução. Catálogo atual inclui trinkets, quests e entradas não compráveis.
- Nem todo efeito do catálogo tem comportamento fiel. A passiva Energized / bônus de alcance do Canhão Fumegante continua pendente; efeitos do Kraken/Navori são adapters parciais.
- Um item Poção de Vida ainda ocupa um slot do inventário por cópia (stack visual LoL 1:1 pendente); regen segue ticks inteiros, não 0,5s.
- A implementação da ultimate do Mordekaiser **não** foi antecipada: viewport quadrada com círculo interno, cópia lógica da área/máscaras/colisores elementais, isolamento autoritativo e fechamento automático seguem para V4.5.4.
- Golpear continua no topo dos overlays; nenhuma alteração de prioridade nesta etapa.
