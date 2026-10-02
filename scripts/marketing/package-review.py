"""Package draft revisions without changing any public product page or asset."""
import argparse,json,re,zipfile
from pathlib import Path

root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026'
campaign=json.loads((out/'campaign.json').read_text())
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--product',action='append',help='Repackage only the specified product; repeat for multiple products.')
args=parser.parse_args()
if args.product and set(args.product)-{p['slug'] for p in campaign['products']}:
    parser.error('Unknown product slug')
locales=json.loads((out/'locales/en-US.json').read_text())
for p in campaign['products']:
    slug=p['slug'];folder=out/'exports/en-US'/slug
    if args.product and slug not in args.product:continue
    locales['products'][slug]['keywords']=p['keywords']
    for cfg,label in [(p.get('studio_art'),'studio_art_copy'),(p.get('store_pilot'),'store_pilot_copy')]:
        if cfg:locales['products'][slug][label]=cfg['copy']
    for variant,label in [('ipad','studio_ipad_copy'),('android','studio_android_copy')]:
        if p.get('studio_art',{}).get(variant,{}).get('copy'):locales['products'][slug][label]=p['studio_art'][variant]['copy']
    locales['products'][slug]['share_preview']=p['share_preview']
    with zipfile.ZipFile(out/f'{slug}-english-review.zip','w',zipfile.ZIP_DEFLATED) as z:
        for f in folder.iterdir():
            if not f.is_file() or '-frame-' in f.name or '-silent' in f.name:continue
            if p.get('store_policy')=='preserve-current' and re.match(r'(store|ipad-store|editorial)-\d+\.png',f.name):continue
            z.write(f,'creative/'+f.name)
        for f in (out/'metadata/en-US'/slug).iterdir():z.write(f,'metadata/en-US/'+f.name)
        if p.get('localized_keyword_manifest'):
            manifest=json.loads((out/p['localized_keyword_manifest']).read_text())
            z.writestr('metadata/keyword-localization.json',json.dumps(manifest,ensure_ascii=False,indent=2))
            for locale,entry in manifest['locales'].items():
                for platform,listing in entry['listings'].items():
                    for store_locale in [locale,*entry['store_copies']]:
                        z.writestr(f'metadata/{platform}/{store_locale}/keywords.txt',listing['keywords']+'\n')
        z.writestr('brief/en-US.json',json.dumps(p,ensure_ascii=False,indent=2))
        z.writestr('README.txt','English revision review only. Product-page changes and multilingual rendering paused. TumTum and Soooon existing store images, and Sundust current store video remain unchanged. New share previews prepared for the next website publication. No store submission or social posting. Audio insertion awaits ElevenLabs credit.')
(out/'locales/en-US.json').write_text(json.dumps(locales,ensure_ascii=False,indent=2)+'\n')
review=out/'index.html';s=review.read_text();match=re.search(r'(<script id="data" type="application/json">)(.*?)(</script>)',s,re.S)
data=json.loads(match[2]);data['products']=campaign['products'];s=s[:match.start(2)]+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+s[match.end(2):];review.write_text(s)
print('Prepared review kits for',len(set(args.product)) if args.product else len(campaign['products']),'products; public product pages/assets untouched.')
