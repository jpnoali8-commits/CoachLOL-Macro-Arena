# CoachLOL — produção V4.5.2d-4-dev21

Base: ZIP dev20, incrementado sem rebase/reset/clean.

## Alterações principais
Ataques contra o Arauto invocado, olho traseiro que causa 40% HP máximo verdadeiro (3s), clique de ataque com fog/alcance, bot escortando wave pós-780s.

## Executar QA
```bash
npm run test:v452d4:dev21
npm test
python3 tests/browser_v452d4_dev21_herald_eye.py
node tests/v452d4_dev19_long_match.test.mjs 2400 26
```

## Notas
Screenshots em `docs/QA_EVIDENCE_V452D4_DEV21` são reais do Chromium em cenário controlado, com sprites locais embutidos e atlas derivado da arte original. O Nexus natural segue pendente.
