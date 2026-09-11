#!/usr/bin/env python3
"""Export approved App Store PNGs as proportional WebP, plus localized gallery data.
Usage: python export-tumtum-screenshots.py /path/to/TumTum
Requires Pillow. No crop, recoloring or regenerated illustration.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('app', type=Path)
args = parser.parse_args()
site = Path(__file__).resolve().parents[1]
app = args.app.resolve()
config = json.loads((app / 'Tools/store/screenshots.json').read_text())
locales = {'en':'en-US', 'pt-BR':'pt-BR', 'es':'es-ES', 'fr':'fr-FR', 'de':'de-DE', 'ja':'ja', 'ko':'ko', 'zh-Hans':'zh-Hans'}
labels = {
 'en': ['The playroom','The house','The town','Dinosaurs','The kitchen','The aquarium','Words and sounds','For your family'],
 'pt-BR': ['O quarto de brinquedos','A casa','A cidade','Os dinossauros','A cozinha','O aquário','Sons e palavras','Para a família'],
 'es': ['El cuarto de juguetes','La casa','La ciudad','Los dinosaurios','La cocina','El acuario','Sonidos y palabras','Para la familia'],
 'fr': ['La salle de jeux','La maison','La ville','Les dinosaures','La cuisine','L’aquarium','Sons et mots','Pour la famille'],
 'de': ['Das Spielzimmer','Das Haus','Die Stadt','Dinosaurier','Die Küche','Das Aquarium','Laute und Wörter','Für die Familie'],
 'ja': ['おもちゃ部屋','おうち','街','恐竜','キッチン','水族館','音と言葉','ご家族のために'],
 'ko': ['장난감 방','집','마을','공룡','주방','수족관','소리와 단어','가족을 위한 설정'],
 'zh-Hans': ['玩具屋','房屋','城市','恐龙','厨房','水族箱','声音与词语','家庭设置']
}
output = site / 'images/tumtum/screenshots'
data = {}
provenance = {'source':'TumTum/fastlane/screenshots, approved App Store collection for 1.0', 'transform':'WebP quality 86, Lanczos; original aspect ratio, no crop', 'files':[]}
for lang, locale in locales.items():
 copy = json.loads((app / f'Tools/store/locales/{locale}.json').read_text())
 manifest = json.loads((app / f'fastlane/screenshots/{locale}/manifest.json').read_text())
 originals = {r['file']:r for r in manifest['screenshots']}
 data[lang] = []
 (output/lang).mkdir(parents=True, exist_ok=True)
 for index, shot in enumerate(config['shots'], 1):
  entry = {'id':shot['id'], 'title':labels[lang][index-1], 'color':shot['color']}
  text = copy['shots'][shot['id']]
  entry['caption'] = ' '.join(text['title'].split())
  entry['description'] = ' '.join(filter(None,[text['body'],text.get('note')]))
  entry['alt'] = f"TumTum. {entry['caption']} {entry['description']}"
  for family in ['iphone','ipad']:
   name = f"{family}-{index:02}-{shot['id']}"
   source = app / f'fastlane/screenshots/{locale}/{name}.png'
   checksum = hashlib.sha256(source.read_bytes()).hexdigest()
   assert checksum == originals[name+'.png']['sha256'], f'Approved original changed: {source}'
   with Image.open(source) as im:
    assert im.mode=='RGB' and list(im.size)==config['devices'][family]
    widths = [480,1080] if family=='iphone' else [640,1440]
    entry[family] = []
    for width in widths:
     height = round(im.height*width/im.width)
     path = output / lang / f'{name}-{width}.webp'
     im.resize((width,height), Image.Resampling.LANCZOS).save(path, 'WEBP', quality=86, method=6)
     record={'path':'/'+path.relative_to(site).as_posix(), 'width':width, 'height':height}
     entry[family].append(record)
     provenance['files'].append({**record, 'source':f'TumTum/fastlane/screenshots/{locale}/{name}.png', 'source_sha256':checksum,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
  data[lang].append(entry)
(site/'_data/tumtum_screenshots.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(site/'tumtum/screenshots-manifest.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
print(f"Exported {len(provenance['files'])} WebPs ({sum(f['bytes'] for f in provenance['files'])/1024/1024:.1f} MiB), all eight locales.")
