"""Prepare platform-specific framing from real native captures, without store uploads."""
import hashlib,json,shutil,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026';campaign=json.loads((out/'campaign.json').read_text())
for p in campaign['products']:
    p['hardware']='browser' if p['device']=='web' else 'macbook' if p['device']=='mac' else 'iphone-landscape' if p['device']=='landscape' else 'iphone'
    p['capture_has_device_frame']=p['slug'] in ['myrenewals','memories','zuzu']
android=root.parent/'Zuzu-android';revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=android,text=True).strip();sources=[];records=[]
for i,prefix in enumerate(['01_home','02_timeline','05_add_actions','04_baby_profile']):
    source=next((android/'screenshots/en-US/images/phoneScreenshots').glob(prefix+'*.png'))
    target=out/'sources/zuzu/android'/f'screen-{i+1}.png';target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
    sources.append('/'+str(target.relative_to(root)))
    records.append({'platform':'Android','slug':'zuzu','panel':i+1,'source':str(source.relative_to(root.parent)),'copy':str(target.relative_to(root)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'repository_revision_at_collection':revision,'kind':'archival-native-Android-capture','note':'Existing Android Screengrab test artifacts with demo content; not claimed to be regenerated from current HEAD.'})
z=next(p for p in campaign['products'] if p['slug']=='zuzu')
z['play_store']={'hardware':'android','device':'android','dimensions':[1080,1920],'screens':sources,'panels':[['Baby’s day. In one shared view.','Keep everyday baby care together.','Baby care on Android'],['Follow the little moments.','See everyday events on the timeline.','The day, in order'],['Keep the little details.','Add feeds, changes and everyday care.','Everyday logs'],['Their details, close by.','Keep your baby’s profile in one place.','A personal baby profile']],'native_repository':'Zuzu-android'}
(out/'campaign.json').write_text(json.dumps(campaign,ensure_ascii=False,indent=2)+'\n');(out/'android-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
(out/'device-framing.json').write_text(json.dumps({'Apple':'iPhone portrait/landscape and MacBook vector hardware framing. Native captures that already contain an iPhone frame retain it to avoid a double bezel.','Google Play':'Dedicated Android handset framing with native Android captures; zuzu is the only requested product with verified Android support in the catalog.','Hooray':'Browser presentation because it is a web product.','TumTum':'Approved App Store screenshots unchanged.','render_source':'art.html','frames_are':'Original code-native hardware treatments, not generated app UI or an assertion of a specific hardware generation.'},indent=2)+'\n')
print('Apple device framing prepared; four native Android variants prepared for zuzu only.')
