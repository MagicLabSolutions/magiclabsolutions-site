"""Apply the isolated Giftly store pilot after collecting and framing native captures."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[2]
out = root / 'docs/marketing/october-2026'
campaign = json.loads((out / 'campaign.json').read_text())
product = next(p for p in campaign['products'] if p['slug'] == 'giftly')
product['store_pilot'] = json.loads((out / 'giftly-pilot.json').read_text())
if product['store_pilot'].get('approval') == 'approved':
    product['website_layout'] = 'giftly-approved'
# Both benefits use the native person profile, with different complete card emphasis.
product['screens'][3] = product['screens'][2]
product['ipad_store']['screens'][3] = product['ipad_store']['screens'][2]
for i, words in enumerate(product['store_pilot']['copy']):
    product['panels'][i][:2] = [s.replace('\n', ' ') for s in words]
    product['ipad_store']['panels'][i][:2] = product['panels'][i][:2]
(out / 'campaign.json').write_text(json.dumps(campaign, ensure_ascii=False, indent=2) + '\n')
print('Applied Giftly layered store pilot; other product direction unchanged.')
