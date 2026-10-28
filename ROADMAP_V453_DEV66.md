# ROADMAP após V4.5.3-dev66

1. **Dev67 — paridade de feitiços e interrupções:** comparar Purificar a Debuffs persistentes/tenacidade, certificar Flash, Barreira, Exaustão, Cura, Fantasma e interrupções no mesmo combate; executar cenários em sessão HTTP nativa e motor navegador, preservando snapshots.
2. **Kits QWER PvP certificados:** pequenos lotes de campeões com colisão de projéteis, CC, shields, dash, on-hit e recasts individualmente auditados; não promover treino genérico a paridade. Casos de alto custo: Sylas R, Neeko, Viego, Mordekaiser R (viewport quadrado + arena circular e clone de obstáculos).
3. **Itens SR 26.21:** selecionar lote pequeno dos 100 `reference_only`, verificar preço/receita, stats, passivas, ativos, cooldowns e interação econômica (comprar/vender/Desfazer), mais testes antes da promoção.
4. **Visual/browser-native:** duas sessões reais no Chromium com HTTP/SSE (fora do bloqueio administrativo local); HUD compacto 16:9 e partida jogável até o Nexus; overlays Smite/Mordekaiser no topo.
5. **Estabilidade:** regressão multi-seed farm 3+3(+canhão), estruturas/Nexus e pacing ~30m por vitória natural, sem alongamento artificial.

Base canônica: **ZIP mestre dev66**. PvP 1 jogador por lado, cada um com cinco campeões. Nunca atualizar bots avançados antes da paridade de motor/mecânicas. Preservar todos os assets/testes/arquivos `.git` e Desfazer da fonte.
