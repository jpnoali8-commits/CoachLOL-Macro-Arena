# Roadmap CoachLOL após V4.5.3-dev61

## Dev62 — sequência ideal
1. Integrar loja, revenda e **Desfazer irreversível por saída da fonte** ao HUD principal da partida PvP 1v1 (1 jogador com 5 campeões azuis vs 1 jogador com 5 vermelhos). Não confundir aba/modal da loja com permanência espacial na fonte.
2. Construir teste real end-to-end de dois navegadores e dois jogadores, com ordens simultâneas, combate, reações, fog, reconexão, last hits e vitória natural pelo Nexus.
3. Expandir os **100 itens gerais ainda apenas consultáveis** do Summoner’s Rift com preços, receitas, passivas e ativáveis de patch 26.21, certificando individualmente efeitos e interações.
4. Verificar efeitos parciais (ex.: procs, cura, shields, CC, limpeza QSS); recuperar ícones oficiais somente do Data Dragon Riot; sem itens de ARAM, TFT ou removidos.
5. Continuar kits individuais (Sylas R, Neeko passiva, Viego posse, Mordekaiser R arena original em viewport quadrado superior esquerdo). Não desenvolver IA estratégica dos bots antes de motor e catálogo completos.
6. Repetir auditorias de minion block, farm, seleção de alvos e torres, sem artificialmente estender as partidas.

## Gates
- Salvar código, docs, QA e `.git` no ZIP mestre; verificar CRC, SHA-256 e comparação de todos os arquivos da dev60.
- Não declarar o PvP humano 100% certificado até o teste de ponta a ponta.
