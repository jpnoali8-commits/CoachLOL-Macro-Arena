# CoachLOL V4.5.2d-dev1 — objetivo incremental (26/10/2026)

**Base:** ZIP enviado pelo usuário `CoachLOL_MacroArena.zip`, branch `milestone/v452c-farm-real-last-hit`, commit `9392c0f`, com alterações locais preexistentes preservadas. **Não é um marco V4.5.2d completo, nem paridade 1:1.**

## Entregue e testado
- Barão fortalece minions condicionalmente à proximidade de portador vivo: melee, caster, siege/canhão e super possuem modificadores específicos de alcance, AD, velocidade de ataque e/ou proteção.
- Canhão fortalecido recebe dano específico contra construções; intervalo de ataque é multiplicado por 2 no protótipo; o perfil é recalculado, não persistido no minion.
- Dano físico a melee/caster sob Barão recebe redução por tipo de atacante; dano verdadeiro não é reduzido. Proteções são **aproximações táticas**, não todas as fórmulas oficiais.
- Dragão Ancião agora aplica queimadura verdadeira em três ticks de 1 segundo simulado (dano total entre 75 e 225, escala pelo tempo), sem stack duplicado e sem recursão de status; a execução separada permanece.
- Burn persiste em snapshot e não reaplica Alma Infernal nem revela o portador em cada tick.
- Node/Browser sincronizados por `tools/sync_browser_v43.py` (57 exports).
- Criado `tests/v452d_objective_effects.test.mjs` com sete contratos; `npm run test:v452d` disponível.

## Pendências críticas (não mascaradas)
- V4.5.2c normal mantém 35–47 CS; eficiência de freeze TOP/MID ainda parcial (16/22/46, uma morte TOP) e fast push reduz CS. Ataques por campeão, windup, voo do projétil e minion aggro seguem aproximações.
- Elder t+1/t+2/t+3 é discretização do motor 1s, não correspondência visual 0,25/1,25/2,25s. Escudos/limiares e todos os efeitos oficiais ainda precisam de contratos.
- Barão ainda não implementa completamente velocidade dos minions, splash do canhão, todas as resistências, recall melhorado e escalonamento de AP/AD por minuto.
- Todos os seis tipos de Alma e buffs individuais de dragão, Arauto montável, Vastilarvas completas, disputa 5v5 seguem backlog.
- Sem certificação 1:1 de kits, runas, itens, server PvP ou IA de prompts.
