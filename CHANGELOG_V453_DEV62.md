# Changelog — CoachLOL V4.5.3-dev62

- Loja transferida do painel lateral para overlay do tabuleiro PvP. Tema compacto preto/dourado, layout responsivo, botão de abrir/fechar e atalho Escape.
- Seleção de campeão da loja separada da seleção múltipla de ordens: o jogador opera qualquer um dos seus cinco sem perder grupo de movimentação.
- Cotação de preço e desconto por componentes obtida do motor autoritativo (`/api/shop/quote`) com isolamento por equipe.
- Inventário, botão de venda com `gold.sell`, estado de Desfazer e motivo privado de indisponibilidade, fila de compras, atributos, receitas e componentes clicáveis.
- Exibição consultiva de 100 itens SR offline não vinculados ao motor, expressamente não compráveis. 102/202 jogáveis permanecem inalterados; não há passivas novas certificadas.
- Testes dev62: 18/18 HTTP/pvp e 13/13 Chromium dois contextos em ambiente com ponte HTTP (restrição localhost nativo).
- Integridade: nenhuma alteração no motor de farm/combat ou mecanismo de Undo da dev61; histórico Git e assets preservados.
