# CHANGELOG — CoachLOL Macro Arena V4.5.2d-4-dev10

## Escopo implementado
- **Golpear competitivo com múltiplos ticks:** teste de disputa 5v5 no poço sai de 4.500 HP, processa ataques regulares contra o objetivo e entre campeões e pausa somente na janela final (1.351 HP no seed registrado).
- **D/F no Champ Select:** opção Golpear F ou D fixa por equipe no draft. O Flash ocupa o outro slot. A unidade JG carrega `smiteKey` no estado e snapshot; a UI não permite mudança durante a disputa.
- **Regras de CC auditadas:** Golpear disponível durante stun, root, knockup, silence, etc.; bloqueado durante suppression/stasis. Sem mudar regras de outros feitiços.
- **Alcance e recarga:** verificação de 500 unidades por campo real no `performActionV40`, mesmo se a chamada pedir `checkRange:false`; sem consumo se inválido.
- **Manter compatibilidade:** testes legados com proxy `{health}` para Smite (sem localização) preservados; acampamentos reais são checados estritamente.
- **Overlay de objetivos:** usa ícone e rótulo corretos para Dragão, Barão, Arauto e Vastilarvas; não precisa de vídeo.

## Testes e evidências
- `npm run test:v452d4:dev10`: PASS 7/7.
- `npm run test:v452d4:dev9`: PASS 20/20, herdado.
- `npm test`: PASS exit 0, incluindo farm e todos os contratos.
- Chromium 1440×900: 2 cenários de Golpear (D/F) + 1 Champ Select (D), fixtures controladas com prints reais de navegador.
- Sincronização Node/Browser: 65 exports.

## Limitações
- O cenário 5v5 usa estado controlado: posiciona 10 campeões no poço e simula vários ticks; não é uma partida completa jogada organicamente desde 0:00.
- Smite PvP entre dois humanos/remoto ainda não implementado.
- Florividentes ainda com posições provisórias; **nenhuma máscara foi alterada nesta versão**.
- Baron d3-B e refinamentos Elder/Smite d3-C continuam pendentes.
