# Roadmap — PvP primeiro após V4.5.3-dev46

**Base canônica:** dev46 (se todos os testes e ZIP íntegro forem entregues).

**Dev47, etapa ideal:** implementar transporte e orquestração PvP de sala simples para dois clientes reais, com binding seguro de sessão->seat, estado filtrado pela fog, comandos de ward/plantas/recuar e sincronização de turno. Testes de conexão, desconexão/reconexão, replay/idempotência, rejeição de comandos adversários e autorização de áreas extras de visão. Não substituir a arquitetura existente.

**Dev48+:** ampliar catálogo universal de ações e contratos de habilidade por campeão. Auditoria de passivas, Q/W/E/R e efeitos não genéricos; implementar e testar Sylas (roubo R), Neeko (disfarces), Viego (possessão), Mordekaiser (instância 1v1 da área real em painel quadrado superior esquerdo com limites circulares e colisores elementais).

**Bots:** manter smoke test/regressão automatizada existentes; não investir em IA estratégica antes da certificação mecânica PvP.
