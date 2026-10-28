# Contrato obrigatório V4.5.4 — Mordekaiser R: Reino da Morte

**Status na dev30:** especificação arquitetural e contrato para a implementação futura; a ultimate ainda **não** foi implementada. A referência pretendida é a mecânica 1v1 isolada do Summoner's Rift, adaptada ao CoachLOL Macro Arena.

## Princípio: o mapa não é substituído por uma arena genérica

Ao ativar R, criar uma *instância lógica da mesma região geométrica do tabuleiro atual*. Usar coordenadas de mundo e exatamente a mesma fonte de máscaras de colisão, pincéis de brush e estado do Rift Elemental daquele momento: `riftVariant`, `collisionMaskVersion`, `brushMasks`, colisores de geometria e limites navegáveis. Não usar um círculo vazio, sprites de mapa independente, aproximação de paredes ou matriz de colisão inventada. O círculo funciona como **restrição adicional** aos obstáculos existentes.

## Plano autoritativo

- `realmContext`: `casterId`, `targetId`, `centerWorld`, `radiusWorld`, `startAt`, `endsAt`, `riftVariant`, `geometryRevision`, `collisionMaskRef`, `brushMaskRef`, posições mundo dos dois participantes, cooldowns e statuses; campos serializáveis.
- Apenas Mordekaiser e o alvo participam do combate, visão, colisão com campeões, autoataques, magias e efeitos nessa instância. Outros campeões, wards, minions e torres do tabuleiro principal **não** se tornam combatentes do Reino; obstáculos estáticos continuam presentes por referência geométrica. Não duplicar acidentalmente torres nem fazer a torre do mundo principal atirar no Reino.
- Resolver cada deslocamento com `validWorldPosition(x,y) AND withinCircle(x,y)`. **Ambos** são obrigatórios. Brushes utilizam as máscaras **ativas** (Oceano pode mudar brushes; Montanha pode mudar rochas/colisores; outras variantes mantêm seus próprios modificadores de terreno).
- Rift Elemental: `original` ou qualquer variante `mountain`, `ocean`, `infernal`, `cloud`, `hextech`, `chemtech`. O snapshot da geometria deve ser idêntico ao tabuleiro principal no momento do cast; se houver transformação durante a ultimate, definir política determinística de sincronização — nunca misturar geometrias.
- Isolar targeting, AoE, projéteis, visão e mortes no motor. A interface visual **não é** a autoridade de quem pode acertar quem.
- Eventos `realm_start`, `realm_movement`, `realm_damage`, `realm_end`, cancelamentos e retorno precisam registrar ordem determinística no replay/snapshot.

## HUD e câmera

- Overlay compacto, **canto superior esquerdo** do canvas/tabuleiro 16:9, com uma viewport quadrada contendo um **círculo visível** (limite de movimentação), filtro visual da ultimate, só os dois retratos/HP/status e a geometria duplicada da região do tabuleiro. Não tomar a tela toda nem recortar um mapa falso.
- Ao acabar: fechar overlay e recuperar ambos os campeões no plano principal, com coordenadas mundo correspondentes às posições reais finais dentro do círculo; resolver interpenetrações e restrições de colisão determinística.
- O jogador continua vendo o mapa principal para tomar decisões dos outros campeões fora do Reino. Os dois presos ficam ausentes/intangíveis para os demais enquanto durar o efeito.

## QA obrigatório antes de chamar funcional

1. Parede original bloqueia a mesma habilidade e caminho no Reino, em ambas as geometrias.
2. Brush original mantém cobertura/ocultação; brush Oceano alterado acompanha a variante ativa.
3. Parede Montanha criada pelo Rift bloqueia ambos os duelistas de maneira idêntica.
4. Limite circular adicional bloqueia movimento mesmo quando o terreno permite.
5. Terceiros não causam nem recebem dano dos duelistas dentro do Reino; os outros 8 continuam jogando.
6. Posições iniciais corretas, deslocamento dentro do Reino e retorno na coordenada mundo correspondente.
7. Cancelamento por morte, duração, quebra de efeito (se suportada) sem persistência da colisão/realm.
8. Snapshot, replay determinístico e integração Chromium HUD 16:9 sem divergência motor/navegador.

**Sem certificação da Riot:** tempos, raio, purificações e interações com alvos especiais deverão ser auditados na versão de referência antes de fixar números definitivos.
