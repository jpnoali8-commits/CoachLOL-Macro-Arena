# Auditoria de arquitetura — V4.0 (26/10/2026)

## Escopo auditado

A V3.9 tinha consumo direto de `u.mana -=`, `u.skillCds`, `smiteCharges--`, `healCd`, `barrierCd` e `igniteCd` espalhados pelos módulos do jogo. A V4.0 substitui commits de recurso em caminhos executáveis e usa journal de ações. `commitCastV39` permanece **exportado por compatibilidade** para testes legados, mas não é a API a expandir. O sistema de combate ainda possui efeitos definidos diretamente em handlers de campeões, automações e torres.

## Matriz de execução por API

| Caminho | Commit V4.0 | Efeito unificado | Observação |
| --- | --- | --- | --- |
| QWER direcional / Nami W / combos | Sim | Não | Habilidades individuais de protótipo |
| Auto Q via AA e Q treino jungle | Sim | Não | Valor de damage ainda legado |
| Ultimate especial | Sim | Não | Karthus/Zed/Soraka/Jinx/Ashe/Ezreal/K'Sante com aproximações |
| Vex R segunda ativação | Sim, recast sem custo | Não | Sem reset por eliminação; viagem simplificada |
| Summoners, flash e escapes | Sim | Não | Feitiços ainda com efeitos individuais adaptados |
| Smite, ataques campeões e jungle | Sim | Não | Lógica de dano de monstros/torres/minions permanece externa |
| Ampulheta e reações com mana | Sim | Não | Status ledger universal pendente |
| Minions/torres e buffs/auras/passivas | Incompleto | Não | Migrar em V4.1/V4.2 |
| Rede PvP e anti-cheat | Não | Não | Backend V4.6 |

## Evidência de QA

- `npm test` executa todos os testes das versões anteriores e V4.0.
- `tests/v40_authority_replay.test.mjs` cobre 8 casos: sem custo inválido; duplicidade; haste/CD; sigilo por time; summoner; restore RNG/tick; Vex recast; browser/Node equivalentes.
- Checksum FNV-1a 32-bit **não criptográfico** e snapshot em memória não substituem assinatura servidor, auditoria antifraude nem replay desde o início.

## Dívidas de engenharia PRIORITÁRIAS

1. Efeito atômico: `performActionV40` registra custo/cooldown com proteção contra duplicata, mas handlers de dano/escudo podem falhar separadamente. Migrar efeitos para um `EffectResolver` transacional com estado rollback e ledger status em V4.1.
2. Verificador de **intents**: a API local permite `costOverride`, `cooldownOverride` e `source`; servidor autoritativo deve ignorar valores de cliente e reconstruir custos a partir de IDs de habilidade/item/patch. Nunca confiar em requests JS do browser.
3. Replay: snapshots retomam do estado atual se tiver os mesmos mapas/masks. Faltam journaling completo de ordens, console de replay, branch control, aplicação seed original de ponta a ponta e assinaturas multiplayer.
4. Personagens não auditados: muitas habilidades genéricas compartilham parâmetros aproximados; não são LoL 1:1; exigir manifest individual e feature-gate antes de usar no jogo ranqueado.
5. Status: resistências/escudos/controle de grupo ainda não usam ledger universal, sem ordenação causal de múltiplas fontes.
6. Sigilo: a filtragem local de `journalForV40(team)` evita vazamento por API prevista, mas código/memória do cliente local podem ser inspecionados. Solução apenas com servidor que separe estados.
7. Performance: snapshot completo e journal ilimitado exigirão compactação, checkpoint rotation e backpressure em partidas longas.
