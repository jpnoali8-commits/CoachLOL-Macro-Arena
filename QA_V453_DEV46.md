# QA — V4.5.3-dev46

Base: V4.5.3-dev45 revisada. A imagem autoral atualizada chegou no ZIP `Point-Vision-Buff-map.zip`.

## Critérios verificados
1. Imagem nativa 4096×4096, 12 marcadores detectados; 8 iniciais e 4 tardios.
2. Novo ponto de ativação de `faelight_03` certificado diretamente pela imagem fornecida, em vez do centro geométrico da máscara de visão.
3. Paridade de dados Node e navegador em 12 sites.
4. Ward amarela, pink e azul ativam o bônus; sentinela aprimorada de suporte também.
5. Ponto fora da região de ativação não concede bônus.
6. Disponibilidade dos pontos tardios mantida.
7. Expiração do bônus e raio extra sem permanência.
8. Supressão de sentinela não vaza a máscara extra.
9. Visão pertence exclusivamente à equipe da sentinela.
10. Snapshots preservam e encerram a vantagem temporária.
11. Entrada autoritativa PvP recebe tipo de sentinela, rejeita tipo inválido e controle adversário.

## Execuções reais
- `npm run test:v453:dev46` — 16/16 PASS.
- `npm test` — PASS, incluindo teste histórico dev45 atualizado.
- Chromium headless — PASS, sem erros JavaScript, captura `docs/QA_EVIDENCE_V453_DEV46/point_vision_buff_12_pontos_dev46_chromium.png`.

## Escopo da validação
O teste browser realizou colocação efetiva de ward amarela na região `faelight_03` e confirmou isolamento azul/vermelho. Não há alegação de teste de sessão TCP/WebSocket real nesta etapa.
