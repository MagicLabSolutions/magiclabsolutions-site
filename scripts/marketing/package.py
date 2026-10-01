"""Package review materials, calendar, proposed metadata and optimized site assets."""
import csv,hashlib,html,json,shutil,subprocess,zipfile
from datetime import date,timedelta
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/marketing/october-2026'
campaign=json.loads((OUT/'campaign.json').read_text());products=campaign['products']
manifest=json.loads((OUT/'video-manifest.json').read_text());videos={(x['slug'],x['reel']):x for x in manifest}
marketing={};calendar=[];checks=[]

def web_image(source,target,width=1440):
    image=Image.open(source).convert('RGBA' if Image.open(source).mode=='RGBA' else 'RGB');image.thumbnail((width,width*3));target.parent.mkdir(parents=True,exist_ok=True);image.save(target,'WEBP',quality=88,method=4)
    return image.size

for product_index,p in enumerate(products):
    folder=OUT/'exports/en-US'/p['slug'];public=ROOT/'images/campaign/en-US'/p['slug'];public.mkdir(parents=True,exist_ok=True)
    # Draft Fastlane files are isolated from each app's live metadata directory.
    proposed=OUT/'metadata/en-US'/p['slug'];proposed.mkdir(parents=True,exist_ok=True)
    for field,filename in [('title','name.txt'),('subtitle','subtitle.txt'),('keywords','keywords.txt')]:
        (proposed/filename).write_text(p[field]+'\n')
    (proposed/'promotional_text.txt').write_text(p['position']+' '+p['panels'][0][1]+'\n')
    checks.append({'slug':p['slug'],'name_characters':len(p['title']),'subtitle_characters':len(p['subtitle']),'keywords_characters':len(p['keywords']),'channel':'website SEO only' if p['device']=='web' else 'proposed App Store en-US metadata','submitted':False})
    gallery=[];captures=[];seen=set()
    for i,panel in enumerate(p['panels']):
        if not p.get('preserve_store'):
            size=web_image(folder/f'store-{i+1}.png',public/f'highlight-{i+1}.webp')
            gallery.append({'output':f'/images/campaign/en-US/{p["slug"]}/highlight-{i+1}.webp','alt':f'{p["name"]}: {panel[0]} — {panel[1]}','caption':panel[0],'width':size[0],'height':size[1]})
        else:
            size=web_image(folder/f'social-{i+1}.png',public/f'highlight-{i+1}.webp')
            gallery.append({'output':f'/images/campaign/en-US/{p["slug"]}/highlight-{i+1}.webp','alt':f'{p["name"]} editorial highlight: {p["hooks"][i]}','caption':p['hooks'][i],'width':size[0],'height':size[1]})
        raw=ROOT/p['screens'][i].lstrip('/');digest=hashlib.sha256(raw.read_bytes()).hexdigest()
        if digest in seen:continue
        seen.add(digest);web_image(OUT/'sources'/p['slug']/f'framed-{i+1}.png' if p.get('frame') else raw,public/f'capture-{i+1}.webp')
        captures.append({'output':f'/images/campaign/en-US/{p["slug"]}/capture-{i+1}.webp','alt':f'{p["name"]}: {panel[2]} (real English product capture)','label':panel[2],'description':panel[1]})
    if p.get('play_store'):
        for i,panel in enumerate(p['play_store']['panels']):
            size=web_image(folder/f'play-store-{i+1}.png',public/f'android-highlight-{i+1}.webp')
            gallery.append({'output':f'/images/campaign/en-US/{p["slug"]}/android-highlight-{i+1}.webp','alt':f'{p["name"]} on Android: {panel[0]}','caption':'Android / '+panel[0],'width':size[0],'height':size[1]})
            raw=ROOT/p['play_store']['screens'][i].lstrip('/');web_image(raw,public/f'android-capture-{i+1}.webp')
            captures.append({'output':f'/images/campaign/en-US/{p["slug"]}/android-capture-{i+1}.webp','alt':f'{p["name"]} on Android: {panel[2]} (real English capture)','label':'Android / '+panel[2],'description':panel[1]})
    if p.get('ipad_store'):
        for i,panel in enumerate(p['ipad_store']['panels']):
            size=web_image(folder/f'ipad-store-{i+1}.png',public/f'ipad-highlight-{i+1}.webp')
            gallery.append({'output':f'/images/campaign/en-US/{p["slug"]}/ipad-highlight-{i+1}.webp','alt':f'{p["name"]} on iPad: {panel[0]}','caption':'iPad / '+panel[0],'width':size[0],'height':size[1]})
            web_image(OUT/'sources'/p['slug']/'ipad'/f'framed-{i+1}.png',public/f'ipad-capture-{i+1}.webp')
            captures.append({'output':f'/images/campaign/en-US/{p["slug"]}/ipad-capture-{i+1}.webp','alt':f'{p["name"]} on iPad: {panel[2]} (real English capture)','label':'iPad / '+panel[2],'description':panel[1]})
    poster=folder/'reel-1-poster.jpg'
    if not poster.exists():poster=folder/'reel-1-frame-1.png'
    web_image(poster,public/'poster.webp',960)
    shutil.copy2(folder/'reel-1.mp4',public/'walkthrough.mp4');shutil.copy2(folder/'reel-1.vtt',public/'walkthrough.vtt')
    marketing[p['slug']]={'locale':'en-US','position':p['position'],'headline':p['panels'][0][0],'description':p['panels'][0][1],'cta':p['cta'],'steps':p['steps'][0],'video':f'/images/campaign/en-US/{p["slug"]}/walkthrough.mp4','poster':f'/images/campaign/en-US/{p["slug"]}/poster.webp','captions':f'/images/campaign/en-US/{p["slug"]}/walkthrough.vtt','gallery':gallery,'captures':captures,'video_kind':videos[p['slug'],1]['kind']}
    if p.get('website_layout'):
        marketing[p['slug']]['website_layout']=p['website_layout']
    if p.get('website_editorial'):
        marketing[p['slug']]['website_editorial']=p['website_editorial']
    if p.get('website_layout')=='giftly-approved':
        marketing[p['slug']]['captures']=[r for r in captures if not r['output'].endswith('/ipad-capture-4.webp')]
        for r in marketing[p['slug']]['captures']:
            if r['output'].endswith('/capture-3.webp') or r['output'].endswith('/ipad-capture-3.webp'):
                r['label']=('iPad / ' if 'ipad-' in r['output'] else '')+'Gift ideas & personal details'
                r['description']='Gift ideas, tastes, sizes and past gifts with each person.'
    # Four weeks, two distinct editorial slots per week, on product/audience channels.
    # The shared studio account uses the separate curated twelve-post rotation below.
    for week in range(4):
        for slot in range(2):
            day=date(2026,10,1)+timedelta(days=week*7+(product_index%3)+slot*3)
            if slot==0:
                if week in [0,2]:kind='reel';number=1 if week==0 else 2;assets=[f'reel-{number}.mp4'];caption=p['captions'][0 if week==0 else 1]
                else:kind='carousel';number=1 if week==1 else 2;assets=[f'carousel-{i}.png' for i in ([1,2,3] if week==1 else [4,3,2])];caption=p['captions'][2 if week==1 else 3]
            else:kind='static';number=week+1;assets=[f'social-{number}.png'];caption=p['captions'][week]
            utm=p['landing']+f'?utm_source=instagram&utm_medium=organic_social&utm_campaign=october_2026&utm_content={p["slug"]}_{kind}_{number}'
            hashtags=' '.join('#'+t for t in p['tags'])
            calendar.append({'date':day.isoformat(),'time_local':'12:30' if slot==0 else '18:00','timezone':'America/Sao_Paulo','product':p['name'],'slug':p['slug'],'channel':'product account / matching audience channel','format':kind,'asset_files':';'.join(str((folder/f).relative_to(OUT)) for f in assets),'instagram_caption':caption+' '+p['cta']+'. Link in bio. '+hashtags,'tiktok_caption':caption+' '+p['cta']+'. Link in bio. '+hashtags,'youtube_title':p['hooks'][week][:90],'youtube_description':caption+'\n'+utm+'\n#Shorts' if kind=='reel' else 'Use Instagram or the product’s audience channel for this image post.','first_comment':p['cta']+' via the link in our bio. '+(['What would you try first?','Who would you share this with?','Which detail matters to you?','What are you looking forward to?'][week]),'tracked_landing_url':utm,'status':'draft — awaiting English creative approval'})

(ROOT/'_data/product_marketing.json').write_text(json.dumps(marketing,ensure_ascii=False,indent=2)+'\n')
catalog=json.loads((ROOT/'_data/portfolio.json').read_text())
for entry in catalog:
    p=next((p for p in products if p['slug']==entry['slug']),None)
    if not p:continue
    terms=p['keywords'].split(',')
    entry['keywords']=list(dict.fromkeys(entry.get('keywords',[])+terms))
    entry['marketing_locale']='en-US'
    entry['marketing_updated_at']='2026-10-01'
    # Existing release statuses, legal content and localized copy remain authoritative.
(ROOT/'_data/portfolio.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
calendar.sort(key=lambda x:(x['date'],x['time_local'],x['product']))
with (OUT/'calendar.csv').open('w',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=calendar[0].keys(),lineterminator='\n');writer.writeheader();writer.writerows(calendar)
(OUT/'calendar.json').write_text(json.dumps(calendar,ensure_ascii=False,indent=2)+'\n')
(OUT/'metadata-validation.json').write_text(json.dumps(checks,indent=2)+'\n')
recorded_count=sum(bool(v['voice_recorded']) for v in manifest if v['slug']!='tumtum')
(OUT/'audio-status.json').write_text(json.dumps({'checked_at':'2026-10-01','provider':'ElevenLabs','status':'narration_added' if recorded_count else 'prepared_awaiting_credit','remaining_characters':0,'recorded_new_voiceovers':recorded_count,'tumtum':'Existing approved Maisie narration and instrumental retained in both real gameplay trailers','other_products':'Music, visible English copy and editable caption tracks are ready. Twenty-two narration scripts and voice IDs are prepared in audio-plan.json; finish-audio.py records, synchronizes and refreshes all outputs. TumTum reuses approved audio.','future_command':'python3 scripts/marketing/finish-audio.py --record'},indent=2)+'\n')
studio=[]
rotation=['hooray','sundust','giftly','groundcontrol','brainfold','memories','poof','soooon','myrenewals','toctoc','tumtum','zuzu']
for i,slug in enumerate(rotation):
    p=next(p for p in products if p['slug']==slug);day=date(2026,10,2)+timedelta(days=(i//3)*7+[0,2,4][i%3])
    studio.append({'date':day.isoformat(),'time_local':'12:30','product':p['name'],'asset':'exports/en-US/'+slug+'/reel-1.mp4','caption':p['captions'][0]+' '+p['cta']+'. Link in bio.','status':'draft'})
with (OUT/'studio-calendar.csv').open('w',newline='') as f:writer=csv.DictWriter(f,fieldnames=studio[0].keys(),lineterminator='\n');writer.writeheader();writer.writerows(studio)

# A self-contained local review page; docs are excluded from the public Jekyll build.
data=json.dumps({'products':products,'calendar':calendar,'studio':studio,'videos':manifest},ensure_ascii=False).replace('</','<\\/')
review='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Magic Lab — October 2026 creative review</title><style>
*{box-sizing:border-box}body{margin:0;background:#f6f3ee;color:#222d28;font:18px/1.65 -apple-system,BlinkMacSystemFont,sans-serif}main{max-width:1360px;margin:auto;padding:48px 28px}h1{font:500 clamp(40px,6vw,76px)/1.08 Georgia,serif;letter-spacing:-2px;max-width:850px}h2{font-size:32px;line-height:1.2}h3{font-size:22px}p{max-width:75ch}a{color:#17533e}button{font:inherit;padding:10px 17px;border:1px solid #68756c;background:white;border-radius:50px;min-height:48px;color:#253b30;cursor:pointer}button[aria-pressed=true]{background:#244d3b;color:white;border-color:#244d3b}nav{display:flex;gap:10px;flex-wrap:wrap;position:sticky;top:0;background:#f6f3eef5;padding:16px 0;z-index:3}.eyebrow{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#386d52}.intro{font-size:21px;color:#526158}.pill{padding:7px 14px;border:1px solid #aab7ac;border-radius:30px;font-size:15px}.toolbar{display:flex;gap:18px;flex-wrap:wrap;margin:32px 0}.panel{background:#fffdf8;border:1px solid #d7ddd4;border-radius:24px;padding:32px;margin:28px 0}.heading{display:flex;align-items:center;gap:20px}.heading img{width:72px;height:72px;border-radius:22%}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px}.grid img{width:100%;height:410px;object-fit:contain;background:#eee9e0;border-radius:16px}.grid a{display:block;text-decoration:none}figcaption{font-size:16px;margin-top:12px}.videos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;max-width:820px}video{width:100%;max-height:560px;background:#10161e;border-radius:18px}.detail{display:grid;grid-template-columns:1fr 1fr;gap:30px}.muted{color:#59695e;font-size:16px}code{overflow-wrap:anywhere;font-size:16px}.table-wrap{overflow-x:auto}table{border-collapse:collapse;min-width:780px;width:100%;font-size:16px}th,td{text-align:left;border-bottom:1px solid #d2d9d1;padding:14px 12px;vertical-align:top}th{color:#365743}details{margin-top:20px}summary{cursor:pointer;min-height:48px;font-weight:600}.hidden{display:none}@media(max-width:800px){main{padding:28px 18px}.grid{grid-template-columns:1fr 1fr}.grid img{height:360px}.detail{grid-template-columns:1fr}.panel{padding:22px}.videos{gap:18px}h1{letter-spacing:-1px}}@media(max-width:420px){.grid{grid-template-columns:1fr}.videos{grid-template-columns:1fr}.grid img{height:470px}}:focus-visible{outline:3px solid #cf784f;outline-offset:4px}
.grid figure{margin:0}.grid img{height:auto!important}</style></head><body><main><p class="eyebrow">Magic Lab Solutions / English creative review</p><h1>Small moments.<br>Clear reasons to try.</h1><p class="intro">Twelve products, distinct audiences, one month of considered creative. Real product captures, editable English copy, and a reusable localization system.</p><p><span class="pill">October 2026</span> <span class="pill">Drafts for approval</span> <span class="pill">No posts or store uploads scheduled</span></p><div class="toolbar"><a href="calendar.csv">Product calendar · 96 slots</a><a href="studio-calendar.csv">Studio calendar · 12 posts</a><a href="strategy.html">Positioning & measurement</a><a href="asset-provenance.json">Capture provenance</a></div><nav id="products" aria-label="Choose a product"></nav><div id="product"></div><section class="panel"><h2>The month, at a glance</h2><p>Two weekly slots per product account or matching audience channel. The shared studio profile uses three posts per week from the curated rotation, keeping the feed focused.</p><div class="table-wrap"><table><thead><tr><th>Date</th><th>Product</th><th>Studio post</th></tr></thead><tbody id="studio"></tbody></table></div></section><p class="muted">TumTum’s approved store screenshot collection is unchanged. Hooray receives web campaign artwork because it is a web product. Other store sets target iPhone or Mac using real product pixels; additional device families require captures from their own native UI. New ElevenLabs voice recordings are prepared for later credit; existing TumTum voices remain in its trailers. All other tours include music, on-screen English copy and editable caption tracks.</p></main><script id="data" type="application/json">__DATA__</script><script>
const data=JSON.parse(document.querySelector('#data').textContent),root=document.querySelector('#product'),nav=document.querySelector('#products');
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function show(slug){const p=data.products.find(x=>x.slug===slug),base='exports/en-US/'+slug+'/';nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.slug===slug)));const grid=(prefix,count)=>'<div class="grid">'+Array.from({length:count},(_,i)=>'<figure><a href="'+base+prefix+'-'+(i+1)+'.png" target="_blank" rel="noopener"><img src="'+base+prefix+'-'+(i+1)+'.png" alt="'+esc(prefix==='social'?p.hooks[i]:prefix==='play-store'?p.play_store.panels[i][0]:p.panels[i][0])+'" loading="lazy"></a><figcaption>'+esc(prefix==='social'?p.hooks[i]:(prefix==='play-store'?p.play_store.panels[i][0]:p.panels[i][0]))+'</figcaption></figure>').join('')+'</div>';
root.innerHTML='<section class="panel"><div class="heading"><img src="'+p.icon+'" alt=""><div><h2>'+esc(p.name)+'</h2><p class="muted">'+esc(p.audience)+'</p></div></div><h3>'+esc(p.position)+'</h3><p>'+esc(p.panels[0][1])+'</p><p class="muted">'+esc(p.status)+' · '+esc(p.store_format)+' · English drafts</p><h3>'+(p.preserve_store?'Approved store images preserved':'Store / product-page artwork')+'</h3>'+(p.preserve_store?'<p>No replacement store set was generated for TumTum.</p>':grid('store',p.panels.length))+(p.ipad_store?'<h3>iPad App Store · native iPad screens</h3><div class="grid">'+p.ipad_store.panels.map((x,i)=>'<figure><a href="'+base+'ipad-store-'+(i+1)+'.png"><img src="'+base+'ipad-store-'+(i+1)+'.png" alt="'+esc(x[0])+'"></a><figcaption>'+esc(x[0])+'</figcaption></figure>').join('')+'</div>':'')+(p.play_store?'<h3>Google Play · native Android captures</h3>'+grid('play-store',p.play_store.panels.length):'')+'<p><a href="'+slug+'-english-review.zip" download>Download the English review kit · ZIP</a></p><h3>Social posts · 1080 × 1350</h3>'+grid('social',4)+'<details><summary>Carousel slides</summary>'+grid('carousel',4)+'</details><h3>Video cuts · 1080 × 1920</h3><div class="videos">'+[1,2].map(i=>'<figure><video controls playsinline preload="none" poster="'+base+'reel-'+i+(p.slug==='tumtum'||p.slug==='sundust'?'-poster.jpg':'-frame-1.png')+'"><source src="'+base+'reel-'+i+'.mp4" type="video/mp4"><track kind="captions" src="'+base+'reel-'+i+'.vtt" srclang="en" label="English" default></video><figcaption>'+esc(data.videos.find(v=>v.slug===slug&&v.reel===i).kind.replaceAll('-',' '))+' · <a href="'+base+'reel-'+i+'.srt">SRT</a> · <a href="'+base+'reel-'+i+'.mp4" download>MP4</a></figcaption></figure>').join('')+'</div><details><summary>Positioning, proposed keywords and voice direction</summary><div class="detail"><div><h3>Proposed metadata</h3><p><strong>'+esc(p.title)+'</strong><br>'+esc(p.subtitle)+'</p><code>'+esc(p.keywords)+'</code><p class="muted">Search-intent hypothesis; no search-volume or ranking claim. '+(p.device==='web'?'Hooray uses web SEO, not an App Store keyword field.':'English draft files: metadata/en-US/'+slug)+'</p></div><div><h3>Voice direction</h3><p>'+esc(p.voice)+' · relaxed, clear, connected phrases.</p>'+p.narration.map(s=>'<p class="muted">'+esc(s)+'</p>').join('')+'</div></div></details><h3>Product publishing slots</h3><div class="table-wrap"><table><thead><tr><th>Date · São Paulo</th><th>Format</th><th>Instagram copy</th><th>Asset</th></tr></thead><tbody>'+data.calendar.filter(x=>x.slug===slug).map(x=>'<tr><td>'+x.date+'<br>'+x.time_local+'</td><td>'+x.format+'</td><td>'+esc(x.instagram_caption)+'</td><td><a href="'+x.asset_files.split(';')[0]+'">Open asset</a></td></tr>').join('')+'</tbody></table></div></section>';history.replaceState(null,'','#'+slug)}
data.products.forEach(p=>{const b=document.createElement('button');b.type='button';b.textContent=p.name;b.dataset.slug=p.slug;b.addEventListener('click',()=>show(p.slug));nav.append(b)});document.querySelector('#studio').innerHTML=data.studio.map(x=>'<tr><td>'+x.date+' · '+x.time_local+'</td><td>'+esc(x.product)+'</td><td>'+esc(x.caption)+'</td></tr>').join('');show(data.products.some(x=>x.slug===location.hash.slice(1))?location.hash.slice(1):'giftly');
</script></body></html>'''.replace('__DATA__',data)
(OUT/'index.html').write_text(review)

for p in products:
    folder=OUT/'exports/en-US'/p['slug']
    with zipfile.ZipFile(OUT/f'{p["slug"]}-english-review.zip','w',zipfile.ZIP_DEFLATED) as z:
        for f in folder.iterdir():
            if f.is_file() and '-frame-' not in f.name and '-silent' not in f.name:z.write(f,'creative/'+f.name)
        for f in (OUT/'metadata/en-US'/p['slug']).iterdir():z.write(f,'metadata/en-US/'+f.name)
        z.writestr('brief/en-US.json',json.dumps(p,ensure_ascii=False,indent=2))
        z.writestr('README.txt','English creative approval draft. Store artwork is not submitted. MP4 files are social videos with editable SRT/VTT tracks. Text is separate from real app captures. TumTum store imagery and approved narration are preserved. New narration is prepared via scripts/marketing/finish-audio.py --record after ElevenLabs credit is available. See the campaign review for source provenance and localization scaffolds.')
print('Packaged',len(products),'products;',len(calendar),'product slots;',len(studio),'studio posts')
