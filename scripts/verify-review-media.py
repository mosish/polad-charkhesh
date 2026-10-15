"""Decode retained reference media; does not download, edit or certify exact SKU images."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
rows = []
for path in sorted((root / 'public-site/reference-images').rglob('*')):
    if not path.is_file():
        continue
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        image.load()
        rows.append({'path': path.relative_to(root).as_posix(), 'format': image.format,
                     'width': image.width, 'height': image.height, 'decoded': True,
                     'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                     'kind': 'existing_family_reference', 'exactSkuVerified': False,
                     'modifiedByReview': False})
assert len(rows) == 35, 'Expected seven originals and 28 existing display derivatives'
result = {'reviewDate': '2026-10-15', 'newExactAssets': 0, 'decodedAssets': len(rows),
          'note': 'Successful decoding verifies file integrity only. Exact-product appearance and reuse permission were not established; retain family-reference labels. No image URL or binary changed.',
          'assets': rows}
(root / 'docs/catalog-review/media-validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(f'{len(rows)} existing reference files decoded; zero exact-SKU replacements.')
