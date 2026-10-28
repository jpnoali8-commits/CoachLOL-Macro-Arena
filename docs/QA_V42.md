# QA da V4.2

- Comando geral: `npm test`
- Testes da etapa: `npm run test:v42`
- Validação visual: `python tests/browser_v42_kits.py`
- Regressão: V16 a V41 preservadas.
- Coberturas novas: matriz de estágio dos kits, alcance/custo de QWER selecionadas, colisão em linha + minions, círculo, aproximação, timer/recast de Lux E, root e spellshield, Nami Q e Vex R2, sigilo da fog, crescimento não linear, persistência de snapshot, mesma implementação Node/browser.
- Cobertura total observada: 213 verificações ✓ (16 novos contratos V4.2).
- Stress de 300s simulados (seed 42) passou sem invariantes quebradas (`docs/STRESS_V42_300S.json`).
- Chromium: indicador de Nami Q, overlay e AoE, 0 exceções JS.
- Critério de aceite: nenhuma inconsistência detectada nesta suíte. Não se declara certificação 1:1 de kit completo.
