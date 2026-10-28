# Memória de continuidade — dev46

- Partir do ZIP mestre completo **V4.5.3-dev46**. Não reconstruir o jogo, não executar reset, não realizar commits sem autorização, preservar .git e todos os assets.
- O usuário corrigiu explicitamente a regra: **ward amarela TAMBÉM ativa bônus temporário**, assim como pink e azul. O motor trata igualmente sentinelas de suporte que usam ward.
- O `Point-Vision-Buff-map.jpg` atualizado tem **12 marcadores de ativação**, separados das **8 áreas de máscara inicial e 4 áreas de máscara tardia**. Dimensões nativas de 4096². `faelight_03` é o marcador recuperado.
- Os 4 pontos tardios continuam condicionados ao tempo/Rift previsto no motor. Buff atual configurado em 45 s e expira com a sentinela; equipe adversária não o recebe.
- Gateway autoritativo de PvP aceita `order.ward` com `wardType` e rejeita controle adversário. A versão online ainda não está completa.
- Próximo ideal: transporte/salas PvP simples com 2 clientes + sincronização e fog, depois kits individuais completos; IA avançada dos bots somente após a mecânica PvP funcionar.
- A ultimate R de Mordekaiser deve usar painel **quadrado** superior esquerdo e limite interno **circular**, com região real do mapa clonada (colisores, brushes, Rift elemental), isolamento 1v1, retorno espacial e fim automático. Não criar arena vazia genérica.
