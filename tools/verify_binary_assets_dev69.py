#!/usr/bin/env python3
"""Gate da importacao binaria dev68: compara arquivos reais com SHA-256 original.

Uso: python tools/verify_binary_assets_dev69.py [--root /caminho/do/clone]
Nao substitui arquivos ausentes e nao aceita placeholders.
"""
import argparse
import hashlib
from pathlib import Path


def verify(root: Path) -> int:
    root = root.resolve()
    manifest = root / "docs/parallel/SHA256_ASSETS_DEV68.txt"
    if not manifest.is_file():
        print(f"ERRO: manifesto ausente: {manifest}")
        return 2

    rows = []
    for index, raw in enumerate(manifest.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        parts = raw.split("  ", 1)
        if len(parts) != 2 or len(parts[0]) != 64 or any(c not in "0123456789abcdef" for c in parts[0]):
            print(f"ERRO: linha malformada {index}")
            return 2
        relative = parts[1].strip()
        path = Path(relative)
        if path.is_absolute() or ".." in path.parts or not relative.startswith(("assets/", "data/")):
            print(f"ERRO: caminho nao permitido na linha {index}: {relative}")
            return 2
        rows.append((relative, parts[0]))

    if len(rows) != 78 or len(set(path for path, _ in rows)) != 78:
        print(f"ERRO: manifesto esperado com 78 paths distintos, observado {len(rows)}")
        return 2

    missing = []
    invalid = []
    valid = 0
    for relative, expected_sha in rows:
        source = root / relative
        if not source.is_file():
            missing.append(relative)
            continue
        digest = hashlib.sha256()
        with source.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != expected_sha:
            invalid.append(relative)
        else:
            valid += 1

    print(f"DEV69 ASSETS: {valid}/78 SHA256 PASS | {len(missing)} MISSING | {len(invalid)} MISMATCH")
    for p in missing:
        print(f"MISSING  {p}")
    for p in invalid:
        print(f"MISMATCH {p}")
    if missing or invalid:
        print("RELEASE_BLOCKED: dados originais incompletos ou divergentes.")
        return 1
    print("ASSETS_SOURCE_VERIFIED: nao substitui o QA integrado, browser ou release.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    raise SystemExit(verify(args.root))
