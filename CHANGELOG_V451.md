# CoachLOL Macro Arena V4.5.1 — Macro, seleção e push

Base: V4.5.0. Não substituir arquivos do motor por versões V3.7/V4.4. Patch de referência: LoL PC 26.21, com regras de temporada 2026.

## Implementação

- Torretas: 9.000 HP exterior, 5.000 interior, 4.750 torre de inibidor e 3.500 cada torre Nexus. Torre Nexus renasce separadamente 180 segundos após a destruição, com 40% HP, e regenera 6 HP/s em faixas (protótipo). O Nexus continua protegido se uma das duas torres permanecer viva; a rota até ele precisa de um inibidor destruído.
- Inibidor: 4.000 HP, respawn em 300 segundos. Só a rota do inibidor destruído recebe superminions; dois por wave nas três rotas apenas se os três inibidores inimigos estiverem destruídos. Interrompe o envio perto da regeneração.
- Waves 2026: início em 00:30; intervalo 30s → 25s a partir de 14:00 → 20s a partir de 30:00; composição com siege/super e distribuição de minions a cada 0,792s.
- CS verdadeiro: ouro/CS dependem de golpe letal efetivamente desferido por campeão; campeões próximos recebem XP de acordo com alcance. Nenhum bônus de last hit transferido a quem apenas está na lane.
- Comportamentos de wave: farm/last hit, congelar, slow push e push rápido. Push causa ataques mesmo fora do limiar de last hit; skills de área auditadas de Nami Q e Lux E podem limpar a wave em push, respeitando alcance, mana, cooldown e geometria. Outras habilidades não recebem efeitos inventados.
- Seleção: clique normal limpa o grupo anterior; Shift + clique adiciona/remove; Shift + arrastar substitui seleção pelo grupo dentro da área. A UI mantém destaque apenas do conjunto atual.
- Foco: ataque em alvo visível aproxima automaticamente até o alcance do ataque; os ataques válidos de vários campeões descontam HP cumulativamente, sem consentimento do alvo.
- Nami W: preservado o cast por alvo com aproximação; mensagem genérica anterior substituída por erro específico quando uma skill NÃO tiver implementação direcionada.

## Limitações ainda existentes

A calibração de farm livre caiu em um teste legado após retirar CS fictício por proximidade; o padrão ideal de ~50 CS/5m ainda depende de auto-last-hit e deslocamento mais sofisticados. Não reintroduzir CS gratuito para simplesmente satisfazer números de teste. Nenhum kit ou catálogo global de itens/builds/runas está 1:1. Validação visual em Windows e QA de produção ainda necessários.
