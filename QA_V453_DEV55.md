# QA — CoachLOL V4.5.3-dev55

## Certificação

| Verificação | Resultado |
|---|---|
| `node tests/v453_dev55_minion_sweep_items.test.mjs` | 12/12 PASS |
| Regressão integral `npm test` | PASS após sincronização browser |
| Dois itens SR 26.21 / Data Dragon 16.21.1 | Preços, stats, receitas, compra e snapshot verificados |
| Limite da Razão 3091 | Proc de 45 de dano mágico, bloqueios e Guinsoo testados; escalamento 1:1 pendente |
| Dançarina Fantasma 3046 | Bypass de colisão de minions em ordem explícita; paredes preservadas |
| Movimento de minions | Sweep determinístico em deslocamento de grande amplitude; progressão econômica não modificada |
| Wave 3+3 / 3+1+3 | PASS |
| Snapshots | PASS |
| Partidas | 2/2 Nexus natural, sem invariantes |
| Chromium visual | NÃO EXECUTADO / não certificado nesta etapa |
| Ícones oficiais Riot offline | PENDENTES |

## Regressão de farm e partidas

Na primeira tentativa de limitar/sweeping TODOS os deslocamentos, as seeds apresentaram regressão de CS e vencedor. Correção aplicada: movimento regular mantém as coordenadas físicas calibradas da dev54, com verificação de sweep/cap somente quando a distância para o ponto ideal ultrapassa 320 unidades, sem alterar `m.progress`, `m.x/y`, HP, ouro ou dano. Regressão completa repetida após ajuste.

| Seed | Duração | Vencedor | CS MID Azul / Vermelho | Comparação com dev54 |
|---|---|---|---|---|
| 26 | 21min24s | red | 44/52 | Idêntico |
| 42 | 23min20s | blue | 28/40 | Idêntico |

## Limitações

- Minion block com colisão entre TODAS as tropas, escolha de formação e targeting de torres ainda não certificado integralmente. O novo sweep corrige deslocamentos físicos anormais, **não** estabelece paridade 1:1 com LoL.
- Dano on-hit de Limite da Razão: 45 pontos fixos configurados como adaptação parcial, valor de escalamento por nível não certificado pela fonte arquivada do Data Dragon. Não apresentar como passiva integral.
- Dançarina Fantasma ignora minion block nas rotas explícitas; outras colisões por unidades em sistemas especiais precisam de revisão.
- As receitas e ícones são referenciados exclusivamente ao Data Dragon 16.21.1; não foram obtidas imagens pela Wiki. Ícones que não vieram no arquivo local continuam pendentes.
- A regressão automatizada de partidas usa bots somente como instrumentação de QA. IA estratégica não foi alterada; PvP e kits individuais continuam prioritários.
- Correção do tabuleiro 2.5D pertence a outra conversa e não foi incluída.
