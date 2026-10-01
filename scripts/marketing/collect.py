"""Collect real product pixels, recording source, revision and crop provenance."""
import hashlib,json,shutil,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps

ROOT=Path(__file__).resolve().parents[2]
STUDIO=ROOT.parent
OUT=ROOT/'docs/marketing/october-2026'
RAW=OUT/'sources'
PRODUCTS=json.loads((OUT/'campaign.json').read_text())['products']

SOURCES={
 'hooray':['magiclabsolutions-site/images/portfolio/hooray/screen-1.webp','magiclabsolutions-site/images/portfolio/hooray/screen-2.webp']*2,
 'sundust':['Sundust/ios/fastlane/previews/sundust-landscape.mov']*4,
 'giftly':[f'magiclabsolutions-site/docs/marketing/october-2026/sources/giftly/{n}.png' for n in ['today','upcoming','person','calendar']],
 'groundcontrol':[f'GroundControl/fastlane/screenshots/en-US/{n}.png' for n in ['1-flight-map','1-flight-map','4-changes','3-pull']],
 'brainfold':[f'magiclabsolutions-site/apps/brainfold/screenshots/raw/{n}.jpg' for n in ['01_study_tab','02_flashcard','03_quiz','04_tutor']],
 'memories':[f'Memories/fastlane/screenshots/en-US/{n}.png' for n in ['00_hero','00_hero','02_highlights','00_hero']],
 'poof':['magiclabsolutions-site/images/poof/hero.jpg']*4,
 'soooon':[f'Soooon/Tools/store/captures/iphone/{n}.png' for n in ['home','detail','calendar','personality']],
 'myrenewals':[f'magiclabsolutions-site/docs/marketing/october-2026/sources/myrenewals/store-{i}.jpg' for i in [3,2,1,4]],
 'toctoc':[f'TocToc/Tools/store/captures/en-US/{n}.png' for n in ['alert','alert','menubar','settings']],
 'tumtum':[f'TumTum/fastlane/app-previews/raw/iphone/en/{n}-after.png' for n in ['house','house','aquarium','dinos']],
 'zuzu':[f'magiclabsolutions-site/apps/zuzu/screenshots/raw/{n}.jpg' for n in ['01_hero_arc','02_quick_log_bottle','08_home','07_growth']],
}

records=[]
for p in PRODUCTS:
 folder=RAW/p['slug'];folder.mkdir(parents=True,exist_ok=True)
 revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=STUDIO/p['source_repository'],text=True).strip()
 p['screens']=[]
 for i,relative in enumerate(SOURCES[p['slug']]):
  src=STUDIO/relative;target=folder/f'screen-{i+1}.png'
  if src.suffix=='.mov':
   # Native gameplay captured for the existing store preview, kept unmodified.
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str([6,12,20,25][i]),'-i',str(src),'-frames:v','1','-update','1','-y',str(target)],check=True)
   image=Image.open(target).convert('RGB');crop=None
  else:
   image=Image.open(src).convert('RGB');w,h=image.size;crop=None
   # Remove the OLD editorial title; retain the actual app/device pixels.
   # These are explicitly labelled crops, never generated replacement UI.
   if p['slug']=='memories':crop=(int(w*.06),int(h*.24),int(w*.94),int(h*.99))
   if p['slug']=='myrenewals':crop=(int(w*.07),int(h*.255),int(w*.93),int(h*.94))
   if p['slug']=='groundcontrol':crop=(0,int(h*.22),w,h)
   if p['slug']=='poof':crop=(0,int(h*.22),w,h)
   if p['slug']=='zuzu':crop=(int(w*.065),int(h*.24),int(w*.935),h)
   if crop:image=image.crop(crop)
   image.save(target)
  p['screens'].append('/'+str(target.relative_to(ROOT)))
  records.append(dict(slug=p['slug'],panel=i+1,source=relative,source_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),copy=str(target.relative_to(ROOT)),crop=crop,source_dimensions=Image.open(src).size if src.suffix!='.mov' else 'video frame',repository_revision_at_collection=revision,locale='en-US',kind='real-product-capture',note='Archived source may precede repository revision. Revision is collection context, not a claim that the capture was regenerated from that commit.'))

(OUT/'campaign.json').write_text(json.dumps({'schema_version':1,'month':'2026-10','timezone':'America/Sao_Paulo','approval':'draft','locale':'en-US','products':PRODUCTS},ensure_ascii=False,indent=2)+'\n')
(OUT/'asset-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
sheet=Image.new('RGB',(1600,len(PRODUCTS)*350),'#e7e4de');draw=ImageDraw.Draw(sheet)
for row,p in enumerate(PRODUCTS):
 for col,path in enumerate(p['screens']):
  image=Image.open(ROOT/path.lstrip('/'));image.thumbnail((380,300));sheet.paste(image,(col*400+(400-image.width)//2,row*350+40));draw.text((col*400+12,row*350+10),f'{p["name"]} — {col+1}',fill='black')
sheet.save(OUT/'source-contact-sheet.jpg')
print('Collected',len(records),'real capture panels')
