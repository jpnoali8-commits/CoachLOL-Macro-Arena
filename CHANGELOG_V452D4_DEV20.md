# CoachLOL Macro Arena — V4.5.2d-4-dev20

## Entrega

- Estratégia de bot para objetivos épicos baseada nas janelas de surgimento públicas e na **visão da própria equipe** (`botEpicTargetV452d4Dev20`, `botEpicRallyV452d4Dev20`).
- O Arauto derrotado deixa o Olho; **o jogador pode selecionar o campeão** que está perto e escolher coletá-lo, sem autoatribuição na interface azul.
- No HUD, o portador escolhe TOP/MID/BOT e clica em uma posição caminhável da rota para deslocar o campeão até lá. O Arauto **não nasce instantaneamente** no clique.
- Arauto invocado escolhe apenas estruturas de sua rota e caminha até elas, dá uma cabeçada (3.000 de dano verdadeiro na primeira, 2.000 na segunda e ~1.333 na terceira), perde ~66% da vida atual após o impacto, pode atacar torres após a cabeçada e continuar para a próxima torre se sobreviver.
- Torres priorizam minions tankando; sem esses minions podem atacar e matar o Arauto. A vida e as cabeçadas do Arauto persistem em snapshot.
- O Arauto não aparece em Swiftplay (regras de 26.1).
- Mantidos todos os sistemas anteriores, máscara, D/F, fog, farm e iconografia CC0.

## Referências verificadas

- Notas da Riot 26.1: https://www.leagueoflegends.com/en-sg/news/game-updates/patch-26-1-notes/
- Wiki atualizada — Rift Herald: https://wiki.leagueoflegends.com/en-us/Rift_Herald

## Diferenças da versão 1:1

- Simulação por tick inteiro; sem montaria/pilotagem Rodeo ainda.
- IA de deslocamento do Arauto é tática simplificada e não uma réplica integral da navegação/cinemática do LoL.
- No branch, o Olho ainda expira sem invocação automática; isso deve ser alinhado com a mecânica atual.
- Base/escala de HP do Arauto é aproximação; dano base da primeira cabeçada e redução sequencial implementados.
- Ainda não há encerramento natural por destruição de Nexus nas seeds avaliadas.
