"""Attach official Apple raster bezels to native captures and iPad approval variants.

Download the DMGs linked by Apple Design Resources and mount read-only before running.
The source artwork cache is private, ignored by Git and excluded from the public build.
"""
import hashlib,json,shutil
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026';cache=out/'.frames-cache';cache.mkdir(exist_ok=True)
campaign=json.loads((out/'campaign.json').read_text());frames={};records=[]
selections={
 'iphone':('iphone','PNG/iPhone 16 Pro Max/iPhone 16 Pro Max - Natural Titanium - Portrait.png',[75,66,1320,2868]),
 'iphone-landscape':('iphone','PNG/iPhone 16 Pro Max/iPhone 16 Pro Max - Natural Titanium - Landscape.png',[66,75,2868,1320]),
 'ipad':('ipad','PNG/iPad Pro (M5) 13" - Silver - Portrait.png',[118,124,2064,2752])}
for key,(volume,relative,rect) in selections.items():
 source=Path('/private/tmp/magiclab-device-downloads')/volume/relative;target=cache/(key+'.png')
 if source.exists():shutil.copy2(source,target)
 if not target.exists():raise SystemExit('Mount official Apple product bezel DMGs first; see device-framing.json.')
 im=Image.open(target);frames[key]={'asset':'/'+str(target.relative_to(root)),'dimensions':list(im.size),'screen':rect}
 records.append({'hardware':key,'original_asset':relative,'download':'https://devimages-cdn.apple.com/design/resources/download/'+('Bezel-iPhone-16.dmg' if volume=='iphone' else 'Bezel-iPad-Pro-%28M5%29.dmg'),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),**frames[key]})
# Recover the full app area from archived editorial artwork, instead of wrapping an old bezel.
archived={'memories':[(root.parent/'Memories/fastlane/screenshots/en-US'/n,(124,485,1197,2828)) for n in ['00_hero.png','00_hero.png','02_highlights.png','00_hero.png']],
 'myrenewals':[(out/'sources/myrenewals'/f'store-{n}.jpg',(187,623,1095,2590)) for n in [3,2,1,4]],
 'zuzu':[(root/'apps/zuzu/screenshots/raw'/n,(62,276,600,1434)) for n in ['01_hero_arc.jpg','02_quick_log_bottle.jpg','08_home.jpg','07_growth.jpg']]}
crops=[]
for p in campaign['products']:
 p['frame']=frames.get(p.get('hardware'));p['capture_has_device_frame']=False
 if p['slug'] in archived:
  p['screens']=[]
  for i,(source,rect) in enumerate(archived[p['slug']]):
   target=out/'sources'/p['slug']/f'unframed-{i+1}.png';Image.open(source).crop(rect).save(target)
   p['screens'].append('/'+str(target.relative_to(root)));crops.append({'slug':p['slug'],'source':str(source),'crop':rect,'output':str(target.relative_to(root)),'note':'App pixels recovered from archived store artwork; no generated UI or fabricated status bar.'})
 if p['slug'] in ['giftly','soooon','brainfold']:
  if p['slug']=='giftly':paths=[out/'sources/giftly/ipad'/f'{n}.png' for n in ['today','upcoming','person','calendar']]
  elif p['slug']=='soooon':paths=[root.parent/'Soooon/Tools/store/captures/ipad'/f'{n}.png' for n in ['home','detail','calendar','personality']]
  else:paths=[root/'apps/brainfold/screenshots/ipad/raw'/f'{n}.jpg' for n in ['01_study_tab','05_summary','06_battle','04_tutor']]
  screens=[]
  for i,source in enumerate(paths):
   target=out/'sources'/p['slug']/'ipad'/f'screen-{i+1}.png';target.parent.mkdir(parents=True,exist_ok=True);Image.open(source).save(target);screens.append('/'+str(target.relative_to(root)))
   crops.append({'slug':p['slug'],'platform':'iPadOS','source':str(source),'output':str(target.relative_to(root)),'dimensions':list(Image.open(source).size),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'note':'Native iPad interface. Giftly uses an isolated simulator with sample people; Soooon and Brainfold use existing native captures.'})
  panels=p['panels']
  if p['slug']=='brainfold':panels=[panels[0],['Keep the lesson close.','Review a rich summary alongside your study material.','Rich summaries'],['Bring a friend into the challenge.','Explore the battle view on a larger screen.','Battle mode'],panels[3]]
  p['ipad_store']={'hardware':'ipad','device':'ipad','frame':frames['ipad'],'screens':screens,'panels':panels,'dimensions':[2064,2752]}
(out/'campaign.json').write_text(json.dumps(campaign,ensure_ascii=False,indent=2)+'\n')
(out/'device-framing.json').write_text(json.dumps({'provider':'Apple Design Resources','source':'https://developer.apple.com/design/resources/','guidelines':'https://developer.apple.com/app-store/marketing/guidelines/','frames':records,'native_iPad_products':['giftly','soooon','brainfold'],'composition':'Original PNG bezels, displayed whole and without added hardware shadows. Native capture is fitted inside the measured transparent screen opening. No CSS camera or simulated iPhone/iPad hardware.','cache':'Private .frames-cache is ignored by Git; only finished product compositions are exported.','Google Play':'zuzu uses native Android captures and its separate Android presentation.'},indent=2)+'\n')
(out/'device-capture-provenance.json').write_text(json.dumps(crops,indent=2)+'\n')
print('Official iPhone portrait/landscape and iPad PNG bezels prepared; 12 native iPad variants.')
