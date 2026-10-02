"""Capture existing native demo builds; never touch a player's device or app source."""
import hashlib,json,re,subprocess,time
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/marketing/october-2026'
DEVICES=[('iphone','8BA967B0-0E64-4135-9E9E-5DF5335E9079'),('ipad','7E98BBE3-6DA5-439F-BCC3-63A9C9F2480C')]

def run(*args,check=True):
    return subprocess.run(args,check=check,capture_output=True,text=True)

def capture_game():
    scenes=[('flight',['-demo','saturn','-photo','-autothrust'],5),('planet',['-demo','face','-world','io'],2),('alien',['-demo','eva','-sight','cow'],2),('vey',['-demo','veygift','-photo'],5)]
    provenance={'repository':'Sundust','revision':'3567b3ed137af70195fec6e15e020fa9d9176132','policy':'Existing native -demo scenes never persist saves; Game Center disabled. Store video untouched.','captures':[]}
    for platform,u in DEVICES:
        folder=OUT/'sources/sundust'/('ipad' if platform=='ipad' else '');folder.mkdir(exist_ok=True)
        for name,args,delay in scenes:
            run('xcrun','simctl','terminate',u,'com.magiclabsolutions.sundust',check=False)
            run('xcrun','simctl','launch',u,'com.magiclabsolutions.sundust','-nogc',*args,'-AppleLanguages','(en)','-AppleLocale','en_US')
            time.sleep(delay)
            file=folder/f'revision-{name}.png';run('xcrun','simctl','io',u,'screenshot',str(file))
            provenance['captures'].append({'platform':platform,'file':str(file.relative_to(ROOT)),'arguments':args,'delay':delay,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
            print('Sundust',platform,name,flush=True)
        run('xcrun','simctl','terminate',u,'com.magiclabsolutions.sundust',check=False)
    (OUT/'sources/sundust/revision-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')

def capture_memories():
    mapping=[]
    for platform,u in DEVICES:
        bundle='com.magiclabsolutions.memories' if platform=='iphone' else 'com.magiclabsolutions.memories.marketing'
        data=Path(run('xcrun','simctl','get_app_container',u,bundle,'data').stdout.strip())
        cache=data/'Library/Caches/marketing-stock'
        cache.mkdir(parents=True,exist_ok=True)
        for key in json.loads((OUT/'sources/memories/demo-cache-keys.json').read_text()):
            file=cache/key
            seed=int(file.name.split('-')[1]);theme=file.name.split('-')[0]
            names=['family-beach','pet-garden','family-baking','travel-lake','baby-picnic','family-birthday','pet-cat','travel-city']
            group=theme+'-'+str(seed//10)
            offset=int(hashlib.sha256(group.encode()).hexdigest()[:8],16)%len(names)
            name=names[(offset+seed%10)%len(names)]
            image=Image.open(OUT/f'assets/revision-2/{name}.png').convert('RGB');image.save(file,'JPEG',quality=95)
            mapping.append({'platform':platform,'cache_key':file.name,'original_photo':name})
        folder=OUT/'sources/memories'/('ipad' if platform=='ipad' else '')
        for i,scene in enumerate(['home','film','highlights','soundtrack']):
            run('xcrun','simctl','terminate',u,bundle,check=False)
            log=Path(f'/private/tmp/memories-revision-{platform}-{scene}.log')
            with log.open('w') as f:
                process=subprocess.Popen(['xcrun','simctl','launch','--console-pty',u,bundle,'-screenshots','-marketing-screen',scene,'-AppleLanguages','(en)','-AppleLocale','en_US'],stdout=f,stderr=subprocess.STDOUT)
                for _ in range(120):
                    time.sleep(1);s=log.read_text(errors='replace')
                    if 'Terminating app due to' in s:raise RuntimeError(s[-1500:])
                    if '[ScreenshotSeed] done in' in s:break
                else:raise RuntimeError('Fixture did not finish: '+str(log))
                time.sleep(3)
                run('xcrun','simctl','io',u,'screenshot',str(folder/f'native-{i+1}.png'))
                run('xcrun','simctl','terminate',u,bundle,check=False);process.wait(timeout=10)
            print('Memories',platform,scene,flush=True)
    records={'photos':'Fictional family, pets and travel photographs generated with built-in image_gen; no real user album. Existing native capture-only build renders production SwiftUI views.','cache_mapping':mapping,'files':{str(p.relative_to(OUT/'sources/memories')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (OUT/'sources/memories').rglob('native-*.png')}}
    (OUT/'sources/memories/revision-provenance.json').write_text(json.dumps(records,indent=2)+'\n')

if __name__=='__main__':
    capture_game()
    capture_memories()
