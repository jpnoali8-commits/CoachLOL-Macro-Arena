# ROADMAP Corrigido — PvP e catálogo integral, IA posterior

## Regra de priorização
O objetivo é **multiplayer entre pessoas**, com todas as habilidades/passivas individuais funcionais. Bots simples podem ficar como fixtures de QA; **não** melhorar decisões estratégicas da IA enquanto o catálogo não estiver completo e certificado.

## Dev44 — correção imediata implementada
- Entrada autoritativa no motor existente e testes de propriedade de unidades, replay, visão e snapshots.
- Matriz de cobertura individualizada dos 173 campeões, evitando falso progresso.
- Resultado da etapa não é multiplayer online pronto: transporte ainda pendente.

## Dev45 — infraestrutura PvP utilizável
- Transporte servidor, criação/entrada em sala, autenticação de participantes e posse de unidade por equipe.
- Simultaneidade de decisões com relógio do servidor, confirmação de ordens, reenvio idempotente e sincronização de revisões.
- Projeções por equipe protegidas pela fog; testes reais de dois navegadores e ataques maliciosos.
- Desconexão, reconexão, replays determinísticos, persistência conjunta Arena+gateway.

## Dev46+ — sistemas mecânicos universais independentes de controle
- Contratos: eventos/casts/on-hit, projéteis, alvo, colisores, vision/fog, clones, transformações, possessão, roubo/reescrita de ultimates, marcadores de identidade e instâncias de dimensão.
- Aplicação em kits **individuais**, com regras do patch e testes cruzados. Nenhuma habilidade pode ser declarada completa por usar efeito genérico.

## V4.5.4 — certificação completa dos campeões em lotes
- Matriz P/Q/W/E/R por campeão com evidência mecânica, integração no cliente e PvP de 2 participantes.
- Sylas R: ultimate roubada realmente funcional com todos os efeitos e condições.
- Neeko P: disfarce como campeão/minion/ward e revelação/colisores/fog corretos.
- Viego: possessão e kits temporários. Transformações de Nidalee/Elise/Shyvana e sistemas de Aphelios/Hwei.
- **Mordekaiser R obrigatória**: viewport **quadrado** superior esquerdo; dentro há limite **circular** com colisores; clone espacial real do terreno, rift elemental e moitas, 1v1 isolado com restante da partida continuando, retorno coerente, fechamento automático; sobreposição superior com HUD e Golpear.
- Não há prazo artificial; concluir somente ao validar cada habilidade individualmente.

## Somente após o catálogo funcional e certificado
- Estratégia e macro da IA dos bots: melhorar em fase separada, reaproveitando exatamente o mesmo catálogo de ações do jogador.
