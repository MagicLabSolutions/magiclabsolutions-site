"""Publish one completed studio set into the review kit and website asset data."""
import hashlib,json,re,sys,zipfile
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026'
campaign=json.loads((out/'campaign.json').read_text());slug=sys.argv[1]
p=next(p for p in campaign['products'] if p['slug']==slug)
folder=out/'exports/en-US'/slug;public=root/'images/campaign/en-US'/slug
data=json.loads((root/'_data/product_marketing.json').read_text());entry=data[slug]
gallery=[]
variants=[('social' if p.get('preserve_store') else 'store','highlight',p['panels'],'')]
if p.get('play_store'):variants.append(('play-store','android-highlight',p['play_store']['panels'],'Android / '))
if p.get('ipad_store'):variants.append(('ipad-store','ipad-highlight',p['ipad_store']['panels'],'iPad / '))
for export,prefix,panels,label in variants:
 for i,panel in enumerate(panels):
  source=folder/f'{export}-{i+1}.png';target=public/f'{prefix}-{i+1}.webp'
  with Image.open(source) as im:
   im=im.convert('RGB');im.thumbnail((1440,4320));im.save(target,'WEBP',quality=88,method=4);w,h=im.size
  gallery.append(dict(output='/'+str(target.relative_to(root)),alt=f'{p["name"]}: {label}{panel[0]} — {panel[1]}',caption=label+panel[0],width=w,height=h))
entry.update(gallery=gallery,headline=p['panels'][0][0],description=p['panels'][0][1],website_layout=p['website_layout'],website_editorial=p['website_editorial'])
for i,panel in enumerate(p['panels']):
 target=public/f'capture-{i+1}.webp';url='/'+str(target.relative_to(root))
 if not any(c['output']==url for c in entry['captures']):
  source=out/'sources'/slug/f'framed-{i+1}.png' if p.get('frame') else root/p['screens'][i].lstrip('/')
  with Image.open(source) as im:
   im=im.convert('RGBA');im.thumbnail((1440,4320));im.save(target,'WEBP',quality=88,method=4)
  entry['captures'].insert(i,dict(output=url,alt=f'{p["name"]}: {panel[2]} (real English product capture)',label=panel[2],description=panel[1]))
for capture in entry['captures']:
 match=re.search(r'/(ipad-|android-)?capture-(\d+)\.webp$',capture['output'])
 if match:
  panels=p.get('ipad_store',{}).get('panels') if match[1]=='ipad-' else p.get('play_store',{}).get('panels') if match[1]=='android-' else p['panels']
  capture['description']=panels[int(match[2])-1][1]
(root/'_data/product_marketing.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(out/'metadata/en-US'/slug/'promotional_text.txt').write_text(p['position']+' '+p['panels'][0][1]+'\n')
# Keep approved creative text independently editable for subsequent translations.
locales=out/'locales/en-US.json';strings=json.loads(locales.read_text());strings['products'][slug]['studio_art_copy']=p['studio_art']['copy']
if p['studio_art'].get('ipad'):strings['products'][slug]['studio_ipad_copy']=p['studio_art']['ipad']['copy']
if p['studio_art'].get('android'):strings['products'][slug]['studio_android_copy']=p['studio_art']['android']['copy']
locales.write_text(json.dumps(strings,ensure_ascii=False,indent=2)+'\n')
review=out/'index.html';text=review.read_text();match=re.search(r'(<script id="data" type="application/json">)(.*?)(</script>)',text,re.S)
if match:
 review_data=json.loads(match[2]);review_data['products']=[p if item['slug']==slug else item for item in review_data['products']]
 text=text[:match.start(2)]+json.dumps(review_data,ensure_ascii=False).replace('</','<\\/')+text[match.end(2):];review.write_text(text)
with zipfile.ZipFile(out/f'{slug}-english-review.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in folder.iterdir():
  if f.is_file() and '-frame-' not in f.name and '-silent' not in f.name:z.write(f,'creative/'+f.name)
 for f in (out/'metadata/en-US'/slug).iterdir():z.write(f,'metadata/en-US/'+f.name)
 z.writestr('brief/en-US.json',json.dumps(p,ensure_ascii=False,indent=2))
 z.writestr('README.txt','English creative review. Real app pixels in native hardware with approved Giftly studio direction. No store submission. Narration insertion remains prepared for future ElevenLabs credit.')
print('Packaged',slug,len(gallery),'native editorial images; other products unchanged.')
