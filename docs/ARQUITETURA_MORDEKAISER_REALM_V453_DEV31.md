# Reino da Morte — contrato visual e espacial atualizado na dev31

**Status: futuro.** Nenhuma ultimate funcional foi adicionada nesta dev31.

- Viewport/HUD **QUADRADO**, canto superior esquerdo, não circular. Círculo CENTRAL na viewport é limite físico de movimento de ambos os campeões no Reino; também recorta a geometria do tabuleiro, não a substitui.
- Instância autoritativa do mesmo terreno do tabuleiro e mesma versão elemental ativa, com idênticas máscaras de colisão, moitas/brush e bloqueios de skills. Círculo atua em conjunto com os colisores, não acima deles.
- Somente Mordekaiser e alvo podem interagir lá, incluindo invisibilidade/fog e regras de dano. Outros oito no mundo principal e não podem causar nem receber dano nessa instância.
- Render do mundo principal prossegue enquanto overlay mostra apenas dois personagens; filtro visual pode ser aplicado dentro da viewport sem afetar mundo principal.
- Encerrada a ultimate, encerrar instância, fechar painel **AUTOMATICAMENTE** pelo estado do motor e recolocar ambos nas coordenadas mundiais finais válidas, respeitando paredes e geometria elemental.
- Hierarquia global: `Golpear` z-index 2147483000, `Realm` 2147482000, HUD/modais comuns inferiores; janela de Golpear sempre clicável/visível durante disputa (não esconder por modal).
- Cada interação sujeita a logs de replay, snapshot, seis variantes elementais e testes de clique/posicionamento no Chromium antes de declarar a R pronta.
