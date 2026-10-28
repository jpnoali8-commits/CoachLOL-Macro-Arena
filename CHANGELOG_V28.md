# CoachLOL v2.8 — Câmera orbital e paridade visual

**Data:** 25/10/2026 · **Estado:** alfa offline-first

## Corrigido

1. A rotação por botão direito deixou de ser um simples `ctx.rotate()` no bitmap inteiro: agora o yaw é aplicado sobre as coordenadas do plano antes de calcular a profundidade projetiva.
2. A visão inicial usa 45° de azimute e 55% no ajuste de inclinação. O alinhamento diagonal garante o mesmo fator de profundidade para as posições espelhadas das bases.
3. Projeção inversa para clique, ward e movimentação; mantém as máscaras do motor em coordenadas originais.
4. Um clique com o botão direito não gera ordem. Controle de cancelamento de ponteiro disponível.
5. Câmera centraliza automaticamente o mapa para caber na área visível com qualquer orientação.
6. Indicador de rotação no painel de perspectiva e orientação de controles atualizada.

## Validações

- 525 operações de ida e volta nas coordenadas do mundo para múltiplos ângulos/inclinações.
- Verificação geométrica das bases azul/vermelha na orientação inicial.
- Teste em Chromium: rotação direita, reset para 45°, console limpo nas ações examinadas.
- Regressão de core, loja, combos, evolução, Nami W, voz e comandos de texto aprovada.

## Escopo e limitações

A perspectiva é uma câmera virtual 2.5D aplicada a um mapa plano, **não um motor 3D volumétrico/WebGL**. A renderização das estruturas e campeões usa símbolos e avatares do sistema atual.
Não foram acrescentadas mecânicas de combate nem resolvidas todas as lacunas individuais dos kits.
