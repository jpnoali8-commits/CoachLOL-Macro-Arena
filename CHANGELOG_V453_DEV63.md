# Changelog — V4.5.3-dev63

- **Bug corrigido:** destruição natural do Nexus no meio do turno encerrava a partida mas deixava `phase=executing`. Agora executa fechamento transacional do turno no mesmo segundo, sem ticks adicionais ou vitória por tempo.
- `winner` projetado aos dois clientes apenas quando o jogo acabou; confirmação/ações comerciais/ordens extras ficam bloqueadas após o fim.
- Overlay preto/dourado de VITÓRIA/DERROTA no cliente PvP, com mensagem precisa do Nexus destruído, tempo da partida e opção Ver tabuleiro; sem nome provisório no overlay.
- Novo teste E2E de duas sessões HTTP independentes, SSE nativo em Node, dupla confirmação, ordens dos cinco campeões, compra/Undo, segurança de equipes, duas vitórias por Nexus e recuperação de checkpoints (25/25).
- Novas capturas Chromium com estados finais vindos do servidor (13/13 checks). Não equivale a jogar uma partida inteira clicando no Chromium.
- Manutenção: `version.json`, `package.json`, documentação/QA/continuidade, sync engine/browser 73 exports. Nenhum item reference_only promovido; farm e economia intactos.
