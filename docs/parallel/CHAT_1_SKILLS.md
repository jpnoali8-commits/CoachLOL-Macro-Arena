# Chat 1 — Especialista de campeões / Skills

**Branch exclusiva:** `dev69/skills`. **Ponto de partida obrigatório:** dev68 real, após STATUS_DEV69.md = SOURCE_READY. A base SOURCE_READY contém 1.624 arquivos de fonte e permite desenvolvimento e testes de lógica, mas não certificação visual ou release sem os assets binários.

## Missão

Auditar e implementar paridade incremental de kits Q/W/E/R/passivas em PvP 1 humano vs 1 humano; cada humano controla os 5 campeões do próprio time. Priorizar **Nami R (Onda Violenta)** e **Vex R (Rajada Sombria/recast)**; validar fonte, valores, regras de colisão, direção, alcance, cooldown, resposta defensiva, fog e recasts. O Q de Lux dev68 serve como referência de implementação de projétil temporal, não como efeito genérico.

## Escopo e propriedade

- Editar implementações de kits, adaptadores de projéteis/recasts e testes da dev69 sob diretórios/funções específicos combinados com o integrador.
- Se precisar modificar `engine.mjs`, restringir mudanças à zona de kits/projéteis; avisar o integrador antes de trocar contrato comum. Não editar `engine.browser.js` diretamente: integrador sincroniza.
- **Não tocar** loja, cadastro/economia de itens, UX geral, `version.json` ou `main`.
- Não antecipar IA estratégica de bots. Não ocultar estado de inimigos, não aplicar reações pelo jogador errado.

## QA mínimo

Dois clientes autenticados independentes, azul e vermelho; disparo, viagem, no máximo as colisões permitidas, blockers, escudo de feitiço, CC no lançador antes/depois, alvo protegido pelo fog, interrupção, recast, mana/cooldown gastos uma única vez, checkpoint/snapshot, reconexão e idempotência. Medir regressões de Lux Q e casos históricos.

## Entrega

Commits apenas em `dev69/skills`; PR para `dev69/integration` com lista de arquivos alterados, testes/saída 0, fonte dos números, limitações explícitas e matriz de comportamentos implementados, parciais e não implementados. **Não declarar 1:1 com LoL sem certificado por habilidade.**
