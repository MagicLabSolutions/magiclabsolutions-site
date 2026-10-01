"""Apply the reusable editorial direction after native capture and frame preparation."""
import hashlib,json,shutil
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026'
campaign=json.loads((out/'campaign.json').read_text());records=[]
frame=json.loads((out/'device-framing.json').read_text())['frames']
iphone=next({k:v for k,v in f.items() if k in ['asset','dimensions','screen']} for f in frame if f['hardware']=='iphone')
photos={'giftly':'celebration','memories':'family','brainfold':'study','soooon':'anticipation'}
labels={
 'giftly':['','Dates worth remembering','An idea worth keeping',''],
 'brainfold':['','Make it stick','Test your recall',''],
 'memories':['','Month by month','Keep a favorite',''],
 'soooon':['','The wait feels different','Your next big day',''],
 'myrenewals':['','See the total','Know the next date',''],
 'groundcontrol':['','Read the branch map','Review the change',''],
 'poof':['','Review before cleaning','Find build clutter',''],
 'toctoc':['','Time to join','See the next call',''],
 'hooray':['','A personal touch','Everyone’s words',''],
 'sundust':['','Find your landing','Explore the surface',''],
 'tumtum':['','Make a little story','Follow curiosity',''],
 'zuzu':['','The day, in order','See everyday patterns','Watch them grow','Before the birth','']}

z=next(p for p in campaign['products'] if p['slug']=='zuzu')
z['panels']=[['Baby’s day. All together.','Sleep, feeds and changes in one view.','Everyday baby care'],['Every little moment.','Keep the day’s events in order.','A daily timeline'],['See their daily patterns.','Explore insights from everyday logs.','Baby care insights'],['Watch them grow.','Keep growth records close by.','Growth records'],['Start before the birth.','Follow the weeks while you wait.','Pregnancy countdown'],['A nap. As it happens.','Start a nap and follow its timer.','Sleep tracking']]
names=['01_hero_arc','05_timeline_events','06_insights','07_growth','03_pregnancy','04_active_nap']
archives=['00_01_hero_home','03_04_timeline_events','04_05_insights','05_06_growth','01_02_pregnancy','02_03_active_nap']
native=out/'sources/zuzu/native';z['screens']=[]
for i,(name,archive) in enumerate(zip(names,archives)):
    raw=native/(name+'.png');source=raw if raw.exists() else root.parent/'zuzu/fastlane/screenshots/en-US'/(archive+'.png')
    target=out/'sources/zuzu'/f'creative-native-{i+1}.png'
    image=Image.open(source)
    crop=None if raw.exists() else (124,556,1197,2868)
    if crop:image=image.crop(crop)
    image.save(target);z['screens'].append('/'+str(target.relative_to(root)))
    records.append({'slug':'zuzu','panel':i+1,'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':crop,'dimensions':list(image.size),'kind':'fresh-native-fixture-capture' if raw.exists() else 'archival-UI-recovery','limitation':None if raw.exists() else 'Archived export clips a small lower edge. Prefer the fresh simulator capture before acceptance.'})

ipad=out/'sources/zuzu/ipad/native'
if all((ipad/(name+'.png')).exists() for name in names):
    ipad_frame=next({k:v for k,v in f.items() if k in ['asset','dimensions','screen']} for f in frame if f['hardware']=='ipad')
    screens=[]
    for i,name in enumerate(names):
        source=ipad/(name+'.png');target=ipad.parent/f'screen-{i+1}.png';shutil.copy2(source,target);screens.append('/'+str(target.relative_to(root)))
        records.append({'slug':'zuzu','platform':'iPadOS','panel':i+1,'source':str(source.relative_to(root)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'kind':'fresh-native-iPad-fixture-capture'})
    z['ipad_store']={'hardware':'ipad','device':'ipad','frame':ipad_frame,'screens':screens,'panels':z['panels'],'dimensions':[2064,2752]}

android=root.parent/'Zuzu-android/screenshots/en-US/images/phoneScreenshots';a=z['play_store'];a['screens']=[]
a['panels']=[['Baby’s day. All together.','Keep everyday baby care in view.','Baby care on Android'],['Every little moment.','Follow the day’s events in order.','A daily timeline'],['Log the little details.','Add feeds, changes and everyday care.','Everyday logs'],['Their details, close by.','Keep a personal baby profile.','Baby profile'],['Settle into the quiet.','Explore the soothing sounds screen.','Soothing sounds'],['Ready for the next moment.','Return to your everyday care overview.','An everyday overview']]
for i,prefix in enumerate(['01_home','02_timeline','05_add_actions','04_baby_profile','03_sounds','01_home']):
    src=next(android.glob(prefix+'*.png'));target=out/'sources/zuzu/android'/f'screen-{i+1}.png';shutil.copy2(src,target);a['screens'].append('/'+str(target.relative_to(root)))
    records.append({'slug':'zuzu','platform':'Android','panel':i+1,'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'kind':'archival-native-Android-capture'})

for p in campaign['products']:
    if p['slug']=='tumtum':p.update(device='phone',hardware='iphone',frame=iphone)
    if p['slug']=='zuzu':p.update(frame=iphone,capture_has_device_frame=False)
    p['background']='/docs/marketing/october-2026/lifestyle/'+photos.get(p['slug'],p['slug'])+'.png'
    # Short, legible copy is preferred to shrinking headings.
    if p['slug']=='giftly':p['panels'][0][0]='Remember the day. Save the idea.'
    if p['device'] in ['mac','web','landscape']:
        copy={
          'sundust':[['Your next world.','Fly into a universe of discoveries.'],['Find your landing.','From orbit to the surface.'],['Explore. Build. Stay.','Gather resources. Make it yours.'],['Choose your journey.','A small craft. Many possibilities.']],
          'groundcontrol':[['Your Git fleet.','See what needs your attention.'],['Follow every branch.','Read a visual map of your history.'],['See what changed.','Review your local changes.'],['Pull with clarity.','Inspect before your next move.']],
          'poof':[['Make a little room.','See what takes up space on your Mac.'],['Choose what goes.','Review your selection first.'],['Build. Clean. Repeat.','Find development clutter.'],['Room for what’s next.','Understand before you act.']],
          'toctoc':[['Deep in work? Toc toc.','Give your meeting your attention.'],['Time to join.','See the countdown. Join the call.'],['Your next call.','Keep meetings in the menu bar.'],['Make it stand out.','Choose how your reminder appears.']],
          'hooray':[['Everyone signs.','One thoughtful group card.'],['Make it personal.','Add your words and stickers.'],['Open the surprise.','A card full of thoughtful messages.'],['For your occasion.','Birthdays, thanks and goodbyes.']]}
        for i,words in enumerate(copy[p['slug']]):p['panels'][i][:2]=words
    for variant in [p]+[p[k] for k in ['play_store','ipad_store'] if p.get(k)]:
        variant['details']=[]
        for i,screen in enumerate(variant['screens']):
            eligible=i in ([1,2,3,4] if p['slug']=='zuzu' else [1,2])
            if not eligible:variant['details'].append(None);continue
            source=root/screen.lstrip('/');image=Image.open(source);w,h=image.size
            # A real UI region, selected per product; never generated controls.
            rect=(.08,.29,.92,.54)
            if p['device']=='mac' or p['device']=='web':rect=(.20,.23,.80,.70)
            if p['slug']=='sundust':rect=(.33,.20,.66,.75)
            if p['slug']=='tumtum':rect=(.12,.28,.88,.55)
            if p['slug']=='brainfold' and variant.get('device')!='ipad' and i==1:rect=(.075,.46,.925,.57)
            if p['slug']=='myrenewals' and i==1:rect=(.04,.18,.96,.50)
            if p['slug']=='myrenewals' and i==2:rect=(.04,.342,.96,.455)
            if p['slug']=='zuzu':rect=[(.08,.3,.92,.5),(.06,.21,.94,.42),(.06,.16,.94,.36),(.09,.22,.91,.59),(.06,.14,.94,.38),(.06,.6,.94,.82)][i]
            if variant.get('device')=='ipad':rect=(.10,.25,.90,.55)
            if p['slug']=='zuzu' and variant.get('device')=='ipad':rect=[(.1,.2,.9,.4),(.27,.1,.73,.25),(.18,.12,.82,.45),(.2665,.1599,.734,.3815),(.02,.085,.98,.20),(.1,.65,.9,.85)][i]
            pixels=[round(rect[0]*w),round(rect[1]*h),round(rect[2]*w),round(rect[3]*h)]
            tag='android' if variant.get('device')=='android' else 'ipad' if variant.get('device')=='ipad' else 'primary'
            target=out/'sources'/p['slug']/f'detail-{tag}-{i+1}.png';image.crop(pixels).save(target)
            label=variant['panels'][i][2] if tag!='primary' else labels[p['slug']][i]
            variant['details'].append({'asset':'/'+str(target.relative_to(root)),'label':label})
            records.append({'slug':p['slug'],'variant':tag,'panel':i+1,'source':screen,'crop':pixels,'output':str(target.relative_to(root)),'kind':'enlarged-real-interface-detail'})

(out/'campaign.json').write_text(json.dumps(campaign,ensure_ascii=False,indent=2)+'\n')
(out/'creative-detail-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
print('Product backgrounds, large copy, portrait TumTum, six-panel zuzu and real UI details prepared.')
