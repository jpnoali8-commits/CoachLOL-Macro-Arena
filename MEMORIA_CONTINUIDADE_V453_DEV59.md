# Continuidade dev59

Base: dev58 ZIP mestre. Avanço: dev59 ZIP mestre, 2 humanos/10 campeões, 5 campeões por sessão, sem lobby 10 humanos. Gateway `multiplayer/authoritative_actions_v453_dev44.mjs`; sala `multiplayer/room_v453_dev47.mjs`; servidor `multiplayer/server_v453_dev47.mjs`; cliente `multiplayer/pvp_client_v453_dev47.js`. O nome legado dos arquivos **não** representa o marco funcional.

Ações seguem comandos autoritativos e fog por time; reação de qualquer campeão controlado autoriza o próprio dono. `item.activate` inclui QSS/Cimitarra de SR 26.21, adaptadores de cooldown e sprint. O endpoint `/api/create` rejeita maxSeats=10.

Testes `npm test` e `tests/v453_dev59_pvp_1v1_mercury.test.mjs`. Browser visual e conclusão de partidas humanas não certificados. Itens SR gerais 100/202. Manter 566 arquivos Git byte a byte e todos os arquivos herdados. Não incorporar correção do tabuleiro 2.5D, que pertence a outro chat/projeto.
