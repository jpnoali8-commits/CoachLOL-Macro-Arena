#!/usr/bin/env python3
"""Read-only hash, CRC and byte-parity gate for CoachLOL dev68 distribution."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

ROOT = "CoachLOL_MacroArena/"
EXPECTED = {
    "master": ("019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be", 2549),
    "source": ("561563dbc3984b2188275a48da3ada1bfaa228556331e2b60e410ea705e4be8c", 1625),
    "assets": ("9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd", 79),
    "runtime": ("fe555cd97732160029a5a4e3169b16c5e8e80154caa1f0f2ac70788b4ec384b4", 1703),
}

def checksum(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def verify():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in EXPECTED:
        parser.add_argument("--" + name, type=Path, required=name != "runtime")
    args = parser.parse_args()
    handles = {}
    result = {}
    try:
        for kind, (expected_sha, expected_count) in EXPECTED.items():
            path = getattr(args, kind)
            if path is None:
                continue
            assert path.is_file(), f"Missing {kind}: {path}"
            observed_sha = checksum(path)
            assert observed_sha == expected_sha, f"{kind} SHA256 mismatch: {observed_sha}"
            z = ZipFile(path)
            handles[kind] = z
            assert len(z.infolist()) == expected_count, f"{kind} entry count mismatch"
            assert z.testzip() is None, f"{kind} CRC error"
            result[kind] = {"sha256": observed_sha, "entries": expected_count, "crc": "PASS"}
        master, source, assets = (handles[k] for k in ("master", "source", "assets"))
        original = set(master.namelist())
        source_names = {n for n in source.namelist() if n.startswith(ROOT)
                        and n != ROOT + "SOURCE_ONLY_NOTICE.md"}
        asset_names = {ROOT + n for n in assets.namelist()
                       if n != "MANIFEST_SHA256.json"}
        assert len(source_names) == 1624 and len(asset_names) == 78
        assert not source_names.intersection(asset_names)
        assert source_names | asset_names <= original
        drift = 0
        for name in source_names:
            canonical = master.read(name)
            drift += source.read(name) != canonical
            if "runtime" in handles:
                assert handles["runtime"].read(name) == canonical, name
        for name in asset_names:
            canonical = master.read(name)
            assert assets.read(name.removeprefix(ROOT)) == canonical, name
            if "runtime" in handles:
                assert handles["runtime"].read(name) == canonical, name
        assert drift == 12, f"Unexpected source drifts: {drift}"
        if "runtime" in handles:
            assert set(handles["runtime"].namelist()) == (
                source_names | asset_names | {ROOT + "DEV69_DISTRIBUICAO_LEIA_PRIMEIRO.md"})
        result["comparison"] = {
            "source_files": 1624, "binary_assets": 78,
            "original_source_differences_restored_in_runtime": drift,
            "runtime_parity": "PASS" if "runtime" in handles else "NOT_RUN",
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
    finally:
        for z in handles.values():
            z.close()

if __name__ == "__main__":
    verify()
