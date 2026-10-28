# Auditoria V4.5.2 — estado verdadeiro

## Atualização V4.5.2c — 26/10/2026
- A falha histórica de 23 CS TOP foi corrigida sem crédito por proximidade ou afrouxar o teste. A suíte V38 e `npm test` passam; o QA bounded local cobre três seeds/lineups, snapshot e privacidade. Métricas/hashes: `docs/QA_SUMMARY_V452C.md`.
- A verificação visual de navegador continua `NOT_RUN` nesta entrega. Os demais limites de paridade, conteúdo e multiplayer abaixo continuam pendentes.

## Aprovado
- 10 novos contratos de Barão por portador, minion aura, Ancião adiado, estase, draft immutable, Ghost, dragões permanentes, shop tags, farm telemetry e checkpoint.
- Regressões V4.5.1, V3.9, V4.0, V4.1, V4.2, V4.3, V4.4 e V4.5 executadas com sucesso na sessão.
- Testes V38.1 foram migrados para **definir Barreira via fixture de draft**, sem enfraquecer validação do combo.

## Pendências preservadas da auditoria original (não resolvidas por V4.5.2c)
- Histórico: o teste V38 de farm chegou a 23 CS TOP em V4.5.2b; estado atual passa bounded localmente, conforme o QA acima.
- Não existe executor universal de todos os itens/skills; efeitos protótipos ainda não equivalem ao LoL.
- Revisar UI em navegador visível quando o gate visual for solicitado; esse gate não foi executado na V4.5.2c.
- Buff Barão de minions usa multiplicador de dano simples, NÃO buffs por classe; Soul implementada parcialmente.
- Faltam auditoria de alcance/CD por campeão, receitas completas, runas por patch e colisões reais.
- Multiplayer cliente-servidor e segredo contra leitura do cliente NÃO existem.

## Fontes externas utilizadas na engenharia
- Hand of Baron / LoL Wiki: https://wiki.leagueoflegends.com/en-us/Hand_of_Baron — 180s, perda na morte, aura local de minions.
- Dragon Soul / Aspect of Dragon: https://wiki.leagueoflegends.com/en-us/Dragon_Soul — dragões permanentes; Ancião 150s e execução sob 20% após atraso.
- Patch 26.1 Riot: https://www.leagueoflegends.com/en-gb/news/game-updates/patch-26-1-notes/ — **Swiftplay utiliza regras diferentes!** Não aplicar buffs sem identificar modo.

## Regras do código
`teams[owner].baronUntil` é legado de pontuação, mas efeitos usam `baronBuffUntilV452` por portador. ID/movimento na fog não são revelados por eventos privados. Sempre testar snapshot/restauração e os dois motores após modificar o core.
