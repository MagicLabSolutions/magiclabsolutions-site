"""Validate complete app-language artwork, native sources and locale-specific share routes."""
import argparse,json,pathlib,re,struct,runpy
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=pathlib.Path(__file__).resolve().parents[2];BASE=ROOT/'docs/marketing/october-2026/localized'
parser=argparse.ArgumentParser();parser.add_argument('--partial',action='store_true');parser.add_argument('--build',type=pathlib.Path);args=parser.parse_args()
jpeg_size=runpy.run_path(str(ROOT/'scripts/check-social-previews.py'))['jpeg_size']
launches=json.loads((ROOT/'_data/product_launch_localized.json').read_text())
inventory=json.loads((BASE/'languages.json').read_text());coverage=json.loads((ROOT/'_data/localized_image_coverage.json').read_text());lookup={(x['slug'],x['locale']):x for x in coverage};shares=json.loads((ROOT/'_data/share_images.json').read_text())['products'];errors=[];checked=0
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.og={};self.images=[];self.lang=None
 def handle_starttag(self,tag,attributes):
  attrs=dict(attributes)
  if tag=='meta' and attrs.get('property'):self.og[attrs['property']]=attrs.get('content')
  if tag=='img':self.images.append(attrs.get('src',''))
  if tag=='html':self.lang=attrs.get('lang')
for slug,p in inventory.items():
 for locale in p['locales']:
  e=lookup.get((slug,locale))
  if not e or e['status']!='rendered':
   if not args.partial:errors.append(f'{slug}/{locale}: {e or "missing"}')
   continue
  if e['missing']:errors.append(f'{slug}/{locale}: incomplete platforms {e["missing"]}')
  if not e['formats'].get('social') or not e['formats'].get('share'):errors.append(f'{slug}/{locale}: missing social/share')
  for platform,n in e['formats'].items():
   if not platform.endswith('-store'):continue
   if n<=0:errors.append(f'{slug}/{locale}: empty {platform}')
   primary='mac' if slug in ['poof','toctoc','groundcontrol'] else 'browser' if slug=='hooray' else 'iphone'
   prefix='store' if platform[:-6]==primary else platform[:-6]+'-store'
   for i in range(1,n+1):
    full=BASE/'exports'/locale/slug/f'{prefix}-{i}.png';thumb=ROOT/'images/campaign-localized'/slug/locale/f'{prefix}-{i}.webp'
    if not full.exists() or not thumb.exists():errors.append(f'{slug}/{locale}: missing {prefix}-{i}')
    else:
     with full.open('rb') as image:png=image.read(33)
     if png[:8]!=b'\x89PNG\r\n\x1a\n':errors.append(str(full)+': invalid PNG')
     elif platform in ['iphone-store','ipad-store','mac-store']:
      width,height=struct.unpack('>II',png[16:24]);allowed={'iphone-store':[(1320,2868),(1290,2796),(1260,2736),(1284,2778),(1242,2688)],'ipad-store':[(2064,2752),(2048,2732)],'mac-store':[(2880,1800),(2560,1600),(1440,900),(1280,800)]}
      if (width,height) not in allowed[platform]:errors.append(str(full)+': unsupported Apple screenshot size')
      if png[24]!=8 or png[25]!=2:errors.append(str(full)+': store PNG must be RGB without alpha')
     elif platform=='android-store':
      width,height=struct.unpack('>II',png[16:24])
      if min(width,height)<320 or max(width,height)>3840 or max(width,height)>2*min(width,height):errors.append(str(full)+': invalid Play dimensions')
      if png[24]!=8 or png[25]!=2:errors.append(str(full)+': Play requires 24-bit RGB PNG without alpha')
  for prefix in ['post','carousel']:
   for i in range(1,e['formats']['social']//2+1):
    if not (ROOT/'images/campaign-localized'/slug/locale/f'{prefix}-{i}.webp').exists():errors.append(f'{slug}/{locale}: missing {prefix}-{i}')
  launch=launches.get(slug,{}).get(locale)
  if not launch or launch.get('capture_locale')!=locale:errors.append(f'{slug}/{locale}: missing native locale record')
  else:
   devices=[launch.get('hero')]+[f.get('device') for f in launch['features']]+[f.get('device') for f in launch['fleet']]
   for device in devices:
    if not device:errors.append(f'{slug}/{locale}: missing native device');continue
    src=device['image']['src']
    if f'/products-localized/{slug}/{locale}/' not in src:errors.append(f'{slug}/{locale}: wrong native image locale')
    if not (ROOT/src.lstrip('/')).exists():errors.append(f'{slug}/{locale}: missing native web image {src}')
    if len(device.get('source_sha256',''))!=64:errors.append(f'{slug}/{locale}: missing native source hash')
  card=shares.get(slug,{}).get(locale)
  if not card or card.get('locale')!=locale:errors.append(f'{slug}/{locale}: missing or wrong share locale');continue
  if not (ROOT/card['image'].lstrip('/')).exists():errors.append(f'{slug}/{locale}: missing share image')
  if (ROOT/card['image'].lstrip('/')).exists() and jpeg_size(ROOT/card['image'].lstrip('/'))!=(1200,630):errors.append(f'{slug}/{locale}: wrong share image dimensions')
  if args.build:
   route=('' if locale=='en-US' else '/'+locale)+'/apps/'+slug+'/'
   page=args.build/route.lstrip('/')/'index.html'
   if not page.exists():errors.append(route+': missing locale page')
   else:
    meta=Metadata();meta.feed(page.read_text())
    if meta.lang!=('en' if locale=='en-US' else locale):errors.append(route+': wrong document language')
    if urlsplit(meta.og.get('og:image','')).path!=card['image']:errors.append(route+': wrong localized share card')
    if urlsplit(meta.og.get('og:url','')).path!=route:errors.append(route+': wrong share URL')
    if '/Users/' in page.read_text():errors.append(route+': local filesystem in published markup')
  checked+=1
for file in (BASE/'copy').glob('*.json'):
 if re.search(r'\[(?:ML\s*)?\d+\]',file.read_text()):errors.append(str(file)+': leaked translation IDs')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {checked} app-language collections; full-size exports, web thumbnails, social posts and locale-specific link previews.')
