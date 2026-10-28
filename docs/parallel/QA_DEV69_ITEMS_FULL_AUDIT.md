> **Estado vigente (Marco D, 28/10/2026):** as oito entradas condicionais/exclusivas já possuem registros e resolutores iniciais com testes autoritativos na branch de auditoria. As seções anteriores que afirmam "8 bloqueadas por ausência de motor" descrevem o *estado histórico antes do Marco D*. Não foram integradas, nem certificadas contra todos os comportamentos do LoL.

# CoachLOL — Itens: Auditoria Integral DEV69, Marco A (em andamento)

**Branch exclusiva:** `dev69/items-full-audit` (partiu de `dev69/items-batch7` em `74dda4bc6a5b05ca9a490c416767b5fa8fe2cd2d`). **Destino do PR:** `dev69/items-batch7`. Não integrar, não editar `dev69/integration` ou `main`, não sincronizar `engine.browser.js` nesta branch.

## Escopo e contrato de evidência

- Referência Riot PC patch **26.21**, snapshot **Data Dragon 16.21.1** (ambos versionados neste repositório).
- **202/202 `engine_playable` é disponibilidade, NÃO certificação de mecânicas.** Registros condicionais, missões, transformações e itens exclusivos precisam de testes próprios.
- `tools/audit_sr_items_full_dev69.mjs` produz `artifacts/items_full_audit_dev69/matrix.json`, `matrix.csv` e `discrepancies.json`, com ID, família, preço, revenda, receita, flag de efeito e problemas de integridade por linha. Todos os itens permanecem `uncertified` até QA e confirmação específica dos comportamentos; o relatório não mascara lacunas.
- O workflow `.github/workflows/dev69-items-full-audit.yml` publica os arquivos como artifact, verifica sintaxe e roda testes novos e regressões de todas as famílias. Status do workflow deve ser consultado no GitHub; **nenhum PASS é declarado sem run confirmado**.

## Correções no motor autoritativo — missão MID

**Decisão de produto preservada:** a evolução gratuita de botas T2 → T3 pertence **somente** à missão individual do MID de cada equipe; não há desbloqueio global nem compra direta. O limiar de 1350 pontos e o mapa das sete botas permanecem.

1. **Patch 26.9:** ao completar Recall, iniciar pausa de 12 segundos simulados no progresso passivo. A pausa é persistida no campeão para snapshots/reconexão.
2. **Patch 26.9:** a partir do nível 3, 120s em lane geram até 60s de direito de roaming (taxa de crédito 0,5s/s, máximo 60s). Fora da lane, o crédito é consumido no tempo autoritativo e mantém temporariamente a taxa de 1,5 pts/s; sem crédito, 1 ponto a cada 3s.
3. **Patch 26.11:** após concluir a missão, conceder 8% do **AD bônus** e 8% do **AP total**, calculados como estatísticas derivadas, sem mutar `u.ad`/`u.ap` e sem duplicar bônus em compras, vendas, level-up, snapshot ou replay. A base nativa usa dados de campeão existentes para os campeões auditados e o fallback de classe já existente para os demais; **paridade universal de base AD permanece pendente**.
4. Os novos contratos verificam pontuação, recompensa, idempotência, limites do banco de roaming, recall, morte, isolamento e restauração de snapshots.

**Fontes para alterações oficiais:**
- [Riot Patch 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) — missão MID de 1350 pontos e botas gratuitas.
- [Riot Patch 26.9](https://www.leagueoflegends.com/en-au/news/game-updates/league-of-legends-patch-26-9-notes/) — janela após recall, crédito de roaming, ajuste para 1,5/s.
- [Riot Patch 26.11](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-11-notes/) — recompensa de 8% AD bônus/AP.

## Lacunas explicitamente NÃO certificadas

- MID: pontos por placas de torre, multiplicador por objetivos fora da lane que diminui conforme a progressão, eventual comportamento de crédito de roam sob simultaneidade, definição exata das áreas em torno da rota, base AD precisa de cada campeão e modificadores de experiência/gold fora da rota até nível 3.
- Itens Batches 1–7: curvas de dano e cura dinâmicas que aparecem como zero no Data Dragon, geometria/colisores/área de ativos, limites em tropas/monstros/estruturas, interações cruzadas de dezenas de itens, descidas de cooldown, procs de habilidades incompletas.
- Certificação específica por item e regressão do navegador PvP 2 sessões ainda pendentes. Todo `engine_playable` segue `uncertified` até ser avaliado por contrato comportamental.
- `engine.browser.js` e artefatos binários ficam com o integrador somente após integração autorizada.

## Invariantes

- Um humano por equipe controla cinco campeões; planejamento simultâneo e resolução autoritativa.
- Sem alterar o motor de Skills, nenhuma compra/ativação inimiga, nenhum vazamento de fog, nenhum proc repetido por replay.
- Undo irrevogável ao sair fisicamente da fonte, inclusive após retorno; evoluções MID são gratuitas.
- Sem merge, force push, reset destrutivo ou release.

## Próximo trabalho, usando a própria matriz

1. Resolver divergências econômicas reais em lote amplo, com regressões de receitas repetidas, venda, exclusividade e Undo; não certificar por contagem.
2. Auditar famílias ofensivas, defensivas, suporte e visão por gatilhos universais, usando entradas de toda a cadeia B1–B7.
3. Completar MID/placas/objetivos somente quando o hook de torre e a semântica de patches estiverem validados.
4. Cruzar itens × kits × PvP × fog × replay determinístico × performance, então revisão pelo integrador, sem integrar antecipadamente.

## Marco B: paridade de itens confirmada por contrato 26.20–26.21

Implementado em `engine.mjs` sem alterar Skills ou a interface do integrador:

| Item/sistema | Problema anterior | Correção de escopo |
|---|---|---|
| Hexoplaca Experimental | 30% AS/15% MS sem distinção de alcance; sem recarga separada | 50% AS/20% MS corpo a corpo, 25% AS/10% MS distância, duração 8s e recarga autoritativa 30s; venda encerra efeito |
| Húbris | Sempre 10 AD +2 por stack (tratava melee como ranged) | 15 +3 para melee; 10 +2 para ranged após abate/assistência elegível |
| Furacão de Runaan | Projéteis a 40% AD | 60% AD, até dois alvos secundários visíveis com hit legal |
| Explocinturão Hextec | Ativo em 130 +25% AP | 135 +15% AP conforme patch 26.20, preservando alcance/cooldown autoritativo |
| Classificação por alcance | `u.range>.05` em coordenadas normalizadas classificava 525/550/650 unidades como melee | `isRangedChampionV453Dev69Audit` centralizado, em unidades do Atlas (15.000), aplicado a BotRK, Serpentes, Modo DPS/escudos, Youmuu, aceleração de itens, Kraken, Riftmaker, missão MID e bônus novos |

**Evidência de paridade:** Riot [26.20](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-20-notes/) (Hexoplaca, Explocinturão, Runaan), Riot [26.21](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/) (Húbris). O snapshot 16.21.1 confirma atributos estruturais, mas apresenta zero na descrição dinâmica de certos efeitos e não certifica seus escalamentos.

**QA:** `tests/v453_dev69_items_full_audit_patch2621.test.mjs` adiciona 7 testes de comportamento real, recarga, venda, snapshot e isolamento de ataques secundários. Workflow executa-os junto dos 11 testes MID e 215 regressões FAST. Suíte integral `npm test` executada em job separado com falha visível, não ignorada.

**Limites explícitos:** classificação de ranged para campeões ainda não cadastrados usa a faixa de ataque do tabuleiro e necessita exceções oficiais (p.ex., campeões melee de alcance atípico); não certificar todo o roster só com esse heurístico. Ativos de deslocamento exigem QA adicional de colisores e line-of-sight. Não temos QA Chrome de dois clientes. Todos os 210 registros permanecem não certificados até evidência por item.

### Discrepâncias estruturais, após correções

Análise remota da matriz contra Data Dragon 16.21.1: **202 itens normais, 0 divergências de integridade estrutural** (IDs/custos/receitas/revenda). Anteriormente, a auditoria identificou 47 IDs legados sem `riotId` explícito e um falso erro de ordem de receita em Navori; ambos corrigidos. Restam **8 implementações condicionais/exclusivas bloqueadas** por ausência de vínculo de motor:

- `3330` (Efígie Fiddlesticks), `3599/3600` (Lança Negra Kalista);
- `3869/3870/3871/3876/3877` (cinco evoluções da missão SUP).

Não converter esses casos em `certified` nem disponibilizar compra direta até existir resolução real de ação, evolução e ownership. Devem ser tratados em integração com os kits das duas campeãs e catálogo de missões.

## CI real e dependência de assets do executor remoto (não mascarada)

- **FAST audit-and-families:** passou nos commits de paridade e classificação de range com **233/233 testes focados**: 11 novos contratos MID, 7 novos contratos dos patches 26.20–26.21 e 215 históricos de itens, PvP, Undo e Skills; auditoria dos 202 itens normais sem divergência de integridade.
- **Full `npm test`: FALHOU por pré-requisito externo não versionado.** O teste histórico `tests/v452d4_dev5_ui_results.test.mjs:6` aborta porque `assets/ui/endgame/victory_overlay.png` não existe no checkout de Actions. As fases anteriores do `npm test` passaram até esse ponto; o resto da suíte integral não foi executado nessa rodada.
- Não foram adicionados assets falsos, `skip`, `continue-on-error`, `if(false)` ou mocks para esconder a falha. Para rodar a suíte integral, o integrador responsável pelos arquivos binários deve fornecer/registrar os assets reais no workspace de Actions com origem verificada; depois repetir `npm test`. Isso é dependência de integração, não autorização para modificar `engine.browser.js`.
- Evidência do bloqueio: [Actions run #40780759654](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40780759654) (job `full-regression`). Não declarar QA geral certificado enquanto não passar.

## Marco C — assets genuínos recuperados e todos os gates completos verdes

**Substitui o bloqueio histórico de assets/CI descrito no Marco B.** Com autorização do proprietário, os 78 assets binários originais provenientes da distribuição Dev68 foram reutilizados a partir de blobs Git nas branches auxiliares e incorporados exclusivamente a `dev69/items-full-audit` (`4c75b6b`). O ZIP original foi validado por SHA-256 `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd`; 78 arquivos foram incorporados preservando caminhos, assinaturas e conteúdos. Não há placeholders, imagens reconstruídas ou mudanças no bundle.

- `data/dev69_assets_runtime_integrity.json` fixa 78 Git blob SHAs; `tests/v453_dev69_assets_runtime_integrity.test.mjs` verificou **78/78 arquivos, 74.720.507 bytes** no checkout Actions.
- `tests/v453_dev69_items_full_audit_all202_shop_undo.test.mjs` exercita **202/202** registros normais individualmente: **191** compras com ouro e Undo na fonte, **11** restrições intencionais (trinkets, botas de missão, estado consumido); 0 inconsistências no gate.
- `engine.mjs` corrige consumo duplo do Energizado: carregamento após gastar a carga especial, 6 stacks por ataque para RFC/Stormrazor/Voltaic, 20 para Statikk; sem zerar indevidamente após o recharge. Testes DEV38/DEV40 passaram.
- Contratos históricos DEV37, DEV39, DEV49, DEV62 foram atualizados para refletir a realidade autoritativa das evoluções de Armaguarda, classificação range 15.000 unidades e desbloqueio de 202 itens; não houve alteração para mascarar falha de motor.
- **Todos os jobs no HEAD `aa092816c7ee425ed26691bd8123c33d28e1c26e` passaram** na execução [GitHub Actions #40782451849](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40782451849): `audit-and-families`, `independent-regressions` (56 arquivos modernos) e `full-regression` (`npm test` completo). Full suite voltou a PASS sem `skip` nem `continue-on-error`.

**Limite de certificação:** resultados acima provam integridade, compra, Undo e regressões já cobertas, **NÃO** certificam todas as passivas e ativos de 202 itens nem as oito entradas condicionais/exclusivas sem resolução de estado própria. O próximo macro-marco é integração das cinco evoluções SUP e Fiddlesticks/Kalista junto a quem integra Skills, além de QA real Chrome PvP a dois clientes. Não mesclar, não liberar release, não alterar `engine.browser.js` aqui.

## Marco D — oito condicionais/exclusivos com núcleos de gameplay e rede PvP

Fonte: LoL PC patch 26.21, Data Dragon 16.21.1; verificar novamente nas futuras mudanças de patch. O catálogo **não libera compra normal** de nenhum dos oito registros:

| Riot ID | Registro local | Contrato autoritativo |
| --- | --- | --- |
| 3330 | `fiddlesticks_effigy` | Trinket Espantalho no slot 4, Fiddlesticks exclusivo |
| 3599 | `kalista_black_spear` | Pacto de Sangue de Kalista, um aliado, opção de recobrar na fonte até 03:00 |
| 3600 | `sylas_black_spear` | Variante de Sylas somente se estado de R da Kalista roubada estiver disponível |
| 3869 | `support_celestial_opposition` | Absorção do primeiro dano de campeão, onda lenta após 2s |
| 3870 | `support_dream_maker` | Duas bolhas temporárias para aliado protegido por heal/shield, com cooldown |
| 3871 | `support_zaz_zak` | Proc mágico de habilidade em área com atraso e cooldown, não recursivo |
| 3876 | `support_solstice_sleigh` | Proc em slow/CC com aliado, bônus temporário de HP e velocidade |
| 3877 | `support_bloodsong` | Spellblade após cast, bônus de AD base e exposição temporária |

### Fiddlesticks — detalhes implementados

- Slot 4 substitui a ward comum permanentemente: `trinket='effigy'`; bloquear trocar para Lente/Farsight/Ward Amarela; **2 cargas** armazenadas, regeneração por nível **115→30 segundos**, sem custo de ouro.
- **Nenhuma cota global no mapa**: várias efígies podem permanecer enquanto sua duração permitir. Cada uma dura `120 + 10*nível` segundos (**130→300**), tem **1 HP** e raio de **900 unidades**; a posição respeita alcance de colocação 625 e colisores do tabuleiro.
- Ao surgir inimigo que a *enxerga* a até 900 unidades, ativa uma das ações falsas armazenadas, emite alerta privado para o dono, e desaparece em até 2 segundos. Não revela posição inimiga por fog além da visão concedida pela efígie. O oponente não recebe journal privado do proprietário.
- No nível 6+, posicionar uma efígie cria varredura de **6 segundos**, detecta sentinelas stealth e preserva os controles de visão/terreno. Efígies não podem ser neutralizadas por lente/pink no resolvedor, mas podem ser atacadas com 1 HP.
- **Duas cargas têm relógio único ordenado**: gastar a segunda não desloca o primeiro prazo de regeneração (regressão dedicada).
- **Fiddlesticks SUP**: o Espantalho permanece no slot 4 mesmo após a missão de suporte; as cargas da sentinela do Atlas/Bússola/Recompensa são armazenadas separadamente em `supportVisionChargesV453Dev69C` (3/4), com botões distintos no HUD local; colocar `support` não gasta uma carga de Espantalho.

### Kalista/Sylas — detalhes implementados

- `bindBlackSpearV453Dev69C` rejeita inimigo, si próprio, falta de ownership, uso duplicado e tentativas após **03:00**. Cast pendente resolve em **6,5 segundos simulados**, sem mutação gratuita por reconexão. Novo pacto, depois de recuperar a lança na fonte, remove o juramentado anterior.
- `recoverBlackSpearV453Dev69C` recupera sem ouro apenas na fonte, antes de 03:00 e com direito a uso. A variante 3600 de Sylas requer `hijackedFatesCallV453Dev69C`; sem roubo válido permanece bloqueada. O motor da ultimate R roubada deve preencher essa condição quando o engenheiro de Skills o integrar.
- Gateway PvP aceita comandos sequenciados `item.blackSpear`, `item.blackSpearRecover` e `item.supportFinal`: autenticação pelo assento e time, alvos e payloads validados, recibo idempotente e ordem de sequência preservada, sem aceitar comando do inimigo.

### Suporte — missão com cinco escolhas exclusivas

- Ao concluir `supportQuest>=800` e receber `support_bounty`, o jogador escolhe **uma** recompensa gratuita no próprio campo; nunca existe compra na loja comum. Item final aplica status e efeitos distintos, preserva visão de suporte e renda passiva de **9 ouro/10 segundos**.
- Cinco efeitos são processados no servidor e somente contra alvos elegíveis. Blindagem e cura exigem aliado real e não duplicam procs por relay. Buffs e cooldowns usam relógio do jogo, com testes para expirarem e não se multiplicarem em snapshots; projéteis e explosões não podem recursivamente gerar novos procs.
- Contratos: `tests/v453_dev69_items_conditionals_effigy_oath.test.mjs` (9 cenários), `tests/v453_dev69_items_conditionals_support_final.test.mjs` (8 cenários) e `tests/v453_dev69_items_conditionals_gateway_pvp.test.mjs` (ownership, sequência, Sylas/Kalista e quest). São gates explícitos no workflow mais a bateria independente de testes modernos.

### Barreiras de certificação restantes — não omitir

**Não afirmar certificação Riot 1:1 dos oito registros.** Ainda é preciso: interação verdadeira da passiva da Kalista com R, ultimate de Sylas e juramentado nos kits de Skills; conclusão da animação real e seleção/ataque do espantalho no cliente em ambos os lados do fog; UI PvP da escolha de recompensa em vez de mera chamada de API; QA de localização/UI PvP remota; provas completas de todos os outros itens e QA Chrome dois clientes. Sem modificar `engine.browser.js` nesta branch de especialidade e **sem merge**. Os testes de cenário mostram as mecânicas implementadas, não paridade universal.

**Complemento de UI (marco D):** o `app.js` local exibe a opção Espantalho no tray de visão, um botão separado de Sentinela SUP quando Fiddlesticks cumpre a missão, as cinco escolhas finais da quest e a escolha/recuperação da Lança Negra da Kalista. Essa interface local não substitui validação de UI no cliente multiplayer remoto nem sincronização do bundle de produção pelo integrador.
