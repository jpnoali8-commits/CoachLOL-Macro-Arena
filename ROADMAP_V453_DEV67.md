# ROADMAP — após V4.5.3-dev67

1. **Dev68 — interrupções/QWER:** testar projéteis, controle de grupo e interrupções reais no fluxo de execução (não só aceitação de comandos), por pequenos kits certificados; incluir colisão, recast e cooldown de habilidade. Preservar as regras de Cleanse e alvos explícitos.
2. **Itens 26.21 / Data Dragon 16.21.1:** selecionar pequenos lotes dos 100 `reference_only`; implementar atributos, receitas, passivas, ativáveis, cooldowns, compra/venda/Desfazer, snapshots e testes; não promover itens incompletos.
3. **UI + browser-native:** validar duas instâncias Chromium via HTTP/SSE real, combate e partida completa até Nexus; manter HUD 16:9 preto/dourado.
4. **QA farm e duração:** amostra multi-seed com farm top/mid/adc, waves 3+3(+catapulta), estruturas e partidas naturais próximas de 30 minutos.
5. **Kits complexos:** Sylas R, Neeko, Viego e Mordekaiser R (viewport quadrado, arena circular e clones de cenário) requerem testes próprios e não podem ser substituídos por efeitos genéricos sem marcação de parcialidade.

**Canônica**: dev67. PvP 1v1, cinco campeões por jogador. Não alterar lógica de Desfazer da fonte ou .git.
