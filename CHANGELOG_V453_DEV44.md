# CHANGELOG — CoachLOL V4.5.3-dev44

## Mudança de prioridades (PvP primeiro)

- Adicionado `multiplayer/authoritative_actions_v453_dev44.mjs`: entrada determinística no motor existente, vínculo entre sessão e unidade, validação de comandos, bloqueio de fases, fog of war, sequência ordenada e rejeição de replays divergentes.
- Sem alterações nos kits, IA dos bots ou balanceamento nesta etapa.
- Preservação dos comandos pré-existentes: cada ação aprovada usa os métodos já implementados no `Arena` em vez de duplicar lógica de gameplay.
- Acrescentados 15 testes específicos e auditoria gerada a partir das 173 fichas de campeão do patch 26.21.
- `fullyCertifiedCount: 0`: nada declarado 100% completo sem evidência; destaque para Sylas, Neeko, Viego, Mordekaiser.

## Limitações declaradas

- A camada é **in-process**: rede, login, reconexão, lobby, sincronização de relógios, simultaneidade de múltiplos processos, servidor dedicado e anti-cheat externo **não implementados**.
- O conjunto de tipos de ação aceitos no gateway é deliberadamente restrito aos adaptadores certificados; outros comandos do motor ainda não estão expostos no gateway.
- Assentos são associados por um servidor confiável; o cliente não pode atribuir equipe ou unidade por conta própria.
- Projeções continuam utilizando `Arena.perspective(team)`; não enviar `snapshotV40()` aos clientes.
- `exportSession()` deve ser persistido no mesmo checkpoint do `Arena`; não substitui rede ou armazenamento persistente.
