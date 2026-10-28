# CHANGELOG — CoachLOL V4.5.3-dev47

- Transporte PvP autoritativo: salas HTTP, assentos, validação de ações por posse, pronto/execução, checkpoint, SSE privado e reconexão.
- Atribuição de abates com agressor campeão elegível nos 15 segundos anteriores, inclusive golpe final por unidades do mapa.
- Florividente direcional atravessa terreno e moitas por uma rodada, com fog filtrada por equipe.
- Avatares: camada de mortos em cinza + contador de respawn, sempre sob os avatares vivos coloridos, sem modificar combate/ordem de unidade; nenhum inimigo morto oculto revelado indevidamente.
- Tratamento de visualização de acampamentos e objetivos sob fog (ícones Riot quando disponíveis e reserva offline).
- Cobertura de testes dev47: 23 multiplayer + 9 kill + 4 Florividente + 8 avatar, regressão integral PASS. Chromium para essa última alteração bloqueado pelo ambiente.
- Pendências de UI, loja, wards, ondas e demais sistemas descritas no QA; não afirmar conclusão integral.
