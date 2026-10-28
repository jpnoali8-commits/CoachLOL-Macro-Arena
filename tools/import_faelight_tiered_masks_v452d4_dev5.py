from __future__ import annotations
import json
from pathlib import Path
from typing import List, Dict, Any
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'data/rift_user_manifest_v452d4.json'
ASSETS = ROOT / 'data/rift_user_assets_v452d4.js'
AUDIT = ROOT / 'data/rift_faelights_v452d4_dev5_audit.json'
MASK_DIR = ROOT / 'data/faelight_masks_v452d4_dev5'
EARLY = MASK_DIR / '8-earlygame-PointsWards-Vision-mask.jpg'
LATE = MASK_DIR / '4-PointsWards-Vision-late-gamemask.jpg'
LATE_UNLOCK_SECONDS = 900
LATE_UNLOCK_MODE = 'time_or_rift'


def extract(mask_path: Path, tier: str, start: int, unlock: int | None, unlock_mode: str = 'base') -> List[Dict[str, Any]]:
    arr = np.array(Image.open(mask_path).convert('L'))
    mask = (arr < 50).astype('uint8') * 255
    num, labels, stats, cent = cv2.connectedComponentsWithStats(mask, 8)
    items = []
    for i in range(1, num):
        comp = (labels == i).astype('uint8') * 255
        contours, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour = max(contours, key=cv2.contourArea)
        peri = cv2.arcLength(contour, True)
        approx = contour
        for epsmul in (0.005, 0.01, 0.015, 0.02, 0.03, 0.04):
            candidate = cv2.approxPolyDP(contour, epsmul * peri, True)
            approx = candidate
            if len(candidate) <= 14:
                break
        cx, cy = cent[i]
        poly = [[round(float(p[0][0] / arr.shape[1]), 6), round(float(p[0][1] / arr.shape[0]), 6)] for p in approx]
        items.append({
            'x': round(float(cx / arr.shape[1]), 6),
            'y': round(float(cy / arr.shape[0]), 6),
            'sourcePixels': int(stats[i, cv2.CC_STAT_AREA]),
            'visionPolygon': poly,
            'visionPolygonVertexCount': len(poly),
            'tier': tier,
            'unlockAtSeconds': unlock,
            'unlockMode': unlock_mode,
            'maskBBoxPx': {
                'x': int(stats[i, cv2.CC_STAT_LEFT]),
                'y': int(stats[i, cv2.CC_STAT_TOP]),
                'w': int(stats[i, cv2.CC_STAT_WIDTH]),
                'h': int(stats[i, cv2.CC_STAT_HEIGHT]),
            },
        })
    items.sort(key=lambda d: (d['y'], d['x']))
    out = []
    for n, item in enumerate(items, start=start):
        out.append({
            'id': f'faelight_{n:02d}',
            'x': item['x'],
            'y': item['y'],
            'sourcePixels': item['sourcePixels'],
            'radius': 0.012,
            'bonusRadius': 0.06,
            'bonusSeconds': 45,
            'availabilityTier': tier,
            'unlockAtSeconds': item['unlockAtSeconds'],
            'unlockMode': item['unlockMode'],
            'unlockTimingStatus': 'USER_MASK_DRIVEN_EARLY' if (unlock or 0) == 0 else 'USER_DIRECTIVE_15MIN_OR_RIFT_PROVISIONAL',
            'visionPolygon': item['visionPolygon'],
            'visionGeometryStatus': 'MASK_EXTRACTED_USER_AUTHORED',
            'visionMaskBBoxPx': item['maskBBoxPx'],
            'sourceMask': mask_path.name,
            'sourceMaskComponentOrder': n - start + 1,
        })
    return out


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding='utf-8'))
    early = extract(EARLY, 'early_game', 1, 0, 'base')
    late = extract(LATE, 'late_game', 1 + len(early), LATE_UNLOCK_SECONDS, LATE_UNLOCK_MODE)
    faelights = early + late

    data.setdefault('baseFeatures', {})['faelights'] = faelights
    counts = data.setdefault('counts', {})
    counts['faelights'] = len(faelights)
    counts['faelightsEarly'] = len(early)
    counts['faelightsLate'] = len(late)
    counts['faelightUnlockLateSeconds'] = LATE_UNLOCK_SECONDS

    metrics = data.setdefault('metrics', {})
    metrics['faelightsDev5'] = {
        'source': 'user_mask_zip_points-wards-ranged-buff-vision-v2',
        'totalFaelights': len(faelights),
        'earlyGameFaelights': len(early),
        'lateGameFaelights': len(late),
        'lateUnlockSeconds': LATE_UNLOCK_SECONDS,
        'lateUnlockMode': LATE_UNLOCK_MODE,
        'parityStatus': 'PROJECT_CANON_8PLUS4_TIME_OR_RIFT_NOT_RIOT_CERTIFIED',
    }

    audits = data.setdefault('audits', {})
    audits['faelightsDev5'] = {
        'faelightsAnnotatedByUser': len(faelights),
        'faelightsEngineSites': len(faelights),
        'inferredMissingSites': 0,
        'timing': '8 early + 4 late (15:00 or Elemental Rift transform) per updated user instruction; not Riot-certified',
        'geometry': 'polygons extracted from user masks v2',
    }

    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    js_payload = {'baseFeatures': data['baseFeatures'], 'variants': data['variants']}
    ASSETS.write_text(
        '/* Generated user 4096px atlas + dev5 faelight geometry from tiered masks v2. */\n'
        + 'window.COACH_RIFT_USER_V452D4=' + json.dumps(js_payload, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8'
    )
    AUDIT.write_text(json.dumps({
        'status': 'IMPLEMENTED_PARTIAL_NOT_CERTIFIED',
        'sourceMasks': [EARLY.name, LATE.name],
        'totals': {'early': len(early), 'late': len(late), 'all': len(faelights)},
        'lateUnlockSeconds': LATE_UNLOCK_SECONDS,
        'lateUnlockMode': LATE_UNLOCK_MODE,
        'remarks': 'Counts and polygons extracted from updated user masks. Extra 4 unlock at 15:00 or on Elemental Rift transformation, whichever comes first, per project canon for this branch until re-audited.'
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Updated {MANIFEST.name}: {len(faelights)} faelights ({len(early)} early, {len(late)} late).')


if __name__ == '__main__':
    main()
