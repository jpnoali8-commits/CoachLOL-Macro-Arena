# Roadmap após Dev60

## Prioridades Dev61
1. Implementar **Desfazer (Undo)** distinto da revenda: restituição 100% apenas dentro da janela permitida, sem uso de itens, movimentação ou combate; manter histórico de transações, checkpoints e segurança de replay.
2. Integrar loja PvP e multiseleção ao HUD principal (o cliente `multiplayer.html` é um protótipo compacto funcional); poder comprar/vender por qualquer campeão controlado.
3. Testar dois browsers reais num mesmo servidor, ordens simultâneas de cinco campeões e partida completa por Nexus com objetivos e last hits.
4. Expandir **102 itens** de Summoner’s Rift apenas com passivas/ativáveis, preços, receitas, ícones oficiais e efeitos individuais verificados; não trazer ARAM, TFT ou itens removidos.
5. Certificar kits individuais, Sylas R, Neeko passiva, Viego posse e Mordekaiser R com viewport quadrado no topo esquerdo. Bots estratégicos continuam adiados.
6. Testar compatibilidade visual Chromium e cache offline de ícones Riot.

### Restrições
- PvP é estritamente **1v1 com cinco campeões por pessoa**, não 5 jogadores por lado.
- O servidor é autoritativo e mantém fog privada.
- Nunca introduzir farm/regressão de duração para ajustar visual, nunca estender artificialmente partidas.
