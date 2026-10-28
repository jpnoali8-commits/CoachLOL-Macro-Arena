#!/usr/bin/env python3
"""Reconstruct two original V4.5.3-dev68 JPEG assets from checksum-verified base64 Git blobs.
Use only in the isolated dev69/assets-chunks-stage branch.
"""
import base64, hashlib, json, os
from pathlib import Path

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'_dev69_transfer/maps/manifest.json').read_text('utf-8'))
assert manifest['format']=='base64-split-lines-4096-256-v1'
assert len(manifest['assets'])==2
out=Path(os.environ['RUNNER_TEMP'])/'dev69_original_maps'
for entry in manifest['assets']:
    parts=[]
    for chunk in entry['chunks']:
        relative=chunk['path']
        assert relative.startswith('_dev69_transfer/maps/') and '..' not in Path(relative).parts
        block=(root/relative).read_bytes()
        assert len(block)==chunk['chars']
        git_sha=hashlib.sha1(b'blob '+str(len(block)).encode()+b'\0'+block).hexdigest()
        assert git_sha==chunk['sha'], f'Chunk SHA differs: {relative}'
        parts.append(block)
    data=base64.b64decode(b''.join(parts), validate=True)
    assert len(data)==entry['size'],f'Size mismatch {entry["path"]}'
    assert hashlib.sha256(data).hexdigest()==entry['sha256'],f'SHA-256 mismatch {entry["path"]}'
    assert entry['path'].startswith('assets/user_rift_masks_20261026/') and '..' not in Path(entry['path']).parts
    dest=out/entry['path']
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(data)
    print(f'RESTORED {entry["path"]}: {len(data)} bytes SHA256 {entry["sha256"]}')
print(f'RESTORED {len(manifest["assets"])} original files')