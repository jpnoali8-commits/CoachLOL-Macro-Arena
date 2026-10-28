# Continuar dev59

A base canônica passa a ser dev59. **PvP 1v1, dois jogadores humanos**, azul com os cinco campeões azuis, vermelho com os cinco vermelhos. `npm run pvp:serve` sobe servidor local em `127.0.0.1:8787` (padrão); para acesso de outro dispositivo da mesma rede, iniciar com `HOST=0.0.0.0`, configurar firewall e usar somente rede confiável. O protótipo ainda não tem autenticação pública robusta ou TLS.

Na tela `/multiplayer.html`, criar sala e compartilhar o código ao segundo jogador. Selecionar um dos cinco campeões próprios e dar ordens. O primeiro confirma, o segundo confirma, e o servidor executa. Gateway não aceita ordens à equipe rival.

QA e roadmap em `QA_V453_DEV59.md` / `ROADMAP_V453_DEV59.md`. Manter kits individuais, fog privado, shop SR atual e bots estratégicos adiados.
