# CHANGELOG — CoachLOL V4.5.3-dev30

## Implementado

- Árvore de receita interativa na loja: selecionar componente, comprar/programar diretamente e continuar vendo o item principal. Botão voltar para o item raiz.
- Itens repetidos na receita (Rabadon: dois Bastões Desnecessários) podem ser comprados separadamente.
- Contabilização de componentes transitivos com preferência por intermediários prontos; custo, remoção de componentes, atributos, espaço de inventário e registro de economia consistentes.
- Importador de catálogo oficial Data Dragon 16.21.1 com validação de versão, mapa 11, preço, componentes, estatísticas numéricas e exportação de relatório; preparado para aplicar somente com JSON autêntico disponível.
- Requisitos detalhados da ultimate do Mordekaiser: cópia espacial fiel de terreno, colisores, brushes e Rift Elemental, arena circular e overlay 1v1 no canto superior esquerdo.

## Não implementado / parcial

- Catálogo completo de Summoner's Rift 26.21: **não importado** nesta entrega por indisponibilidade de arquivo autêntico no runtime.
- Passivas e ativáveis de todos os itens: continuam em lotes, não 1:1.
- Ultimate de Mordekaiser: especificada para V4.5.4, ainda não executável.
- Revisão do balanceamento para todos os campeões: pendente.

## Compatibilidade

- Motor Node ↔ navegador sincronizado (70 exports). O teste legado da V32 sobre o clique na lista de itens foi atualizado para aceitar a persistência da raiz da receita.
