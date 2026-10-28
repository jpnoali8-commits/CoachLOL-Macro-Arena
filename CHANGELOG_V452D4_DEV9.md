# Changelog CoachLOL V4.5.2d-4-dev9

## Golpear competitivo
- Missão do mascote mantém estágios 600/1000/1400 nos 0/15/35 acúmulos (patch 26.1).
- Overlay D/F é aberto só com junglers de ambos os times no alcance, **ambos com Golpear disponível**, objetivo épico vivo e HP no patamar de execução pelo Golpear naquele tick.
- Além do Dragão, suporta Arauto, Barão e última Vastilarva alvo (captura por indivíduo, sem overflow de Smites perdedores).
- HP exibido é o HP real do motor, não um valor visual aleatório. Cooldown, carga, mascote, alcance e status validam os casts e os gastos ocorrem uma vez.
- Ao segurar a tecla/guardar, não há gasto. Bot usa política própria. O usuário escolhe D ou F no overlay.

## Quando nenhum dos junglers tem Golpear utilizável
- Sem overlay de Smite. Combate 5v5 e dano ao objetivo seguem nas rodadas anteriores.
- Quando o tick efetivamente mata Dragão/Arauto/Barão ou uma Vastilarva, e **ambos os junglers estão na área**, sorteia qual time recebe o abate.
- Sorteio é ponderado por **campeões vivos presentes até 850 unidades do objetivo**. Ex.: 4 vs 1 = 80% para o primeiro time.
- O hash determinístico utiliza seed, objetivo, ciclo e tempo simulado (e ID individual no caso Vastilarvas). Não gasta a RNG de combate.
- Sem Smite de ambos os lados não significa fim automático da luta: o objetivo só morre após dano suficiente, e gera uma recompensa normal, nunca duplicada.
- Se **apenas um time possui Smite**, esse time pode usá-lo normalmente e não recebe overlay competitivo nem sorteio alternativo.
- A arbitragem ponderada é **mecânica adaptada do CoachLOL, não regra oficial do LoL**.

## Continuidade
- Preservadas máscaras v2 dos 12 Lumes e todas as máscaras do Rift.
- Florividentes seguem em coordenadas PROVISÓRIAS, aguardando máscaras de usuário; nenhuma posição foi atualizada na dev9.
- Barão individual d3-B, Elder/Smite d3-C, 5v5 orgânico e multiplayer real ainda não certificados.
