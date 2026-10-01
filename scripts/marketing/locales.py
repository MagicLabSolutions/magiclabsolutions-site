"""Discover existing app locales and prepare honest translation/capture placeholders."""
import json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026'
products=json.loads((out/'campaign.json').read_text())['products'];inventory={};comparison=[]
for p in products:
    repo=root.parent/p['source_repository'];paths=subprocess.check_output(['git','ls-files','*.xcstrings','*.strings','*/keywords.txt','*/description.txt'],cwd=repo,text=True).splitlines();locales={'en-US'};keyword_source=None
    for relative in paths:
        path=repo/relative
        if path.suffix=='.xcstrings' and path.exists():
            d=json.loads(path.read_text());locales.add(d.get('sourceLanguage','en'))
            for entry in d.get('strings',{}).values():locales.update(entry.get('localizations',{}))
        for part in path.parts:
            if part.endswith('.lproj'):locales.add(part.removesuffix('.lproj'))
        if path.name in ['description.txt','keywords.txt'] and re.fullmatch(r'[a-z]{2}(?:-[A-Za-z]{2,4})?',path.parent.name):
            locales.add(path.parent.name)
            if path.name=='keywords.txt' and path.parent.name=='en-US':keyword_source=path
    locales={x.replace('_','-') for x in locales if x!='Base'}
    if 'en' in locales:locales.remove('en')
    inventory[p['slug']]={'observed_source_locales':sorted(locales),'source':'Tracked string catalogs, localization folders and store metadata at collection; not a claim that all locales are publicly released.'}
    comparison.append({'slug':p['slug'],'repository_keyword_file':str(keyword_source) if keyword_source else None,'repository_keywords':keyword_source.read_text().strip() if keyword_source else None,'proposed_keywords':p['keywords'],'live_app_store_connect_keywords_inspected':False})
all_locales=set().union(*(set(x['observed_source_locales']) for x in inventory.values()),{'de-DE','es-ES','fr-FR','pt-BR','ja','ko','zh-Hans'})
for locale in sorted(all_locales-{'en-US'}):
    target=out/'locales'/f'{locale}.json'
    if not target.exists():target.write_text(json.dumps({'locale':locale,'reference':'en-US.json','allow_english_ui_fallback':False,'rtl':locale in ['ar','ar-SA','he'],'products':{p['slug']:{'copy':None,'native_capture_paths':[],'translated_caption_paths':[],'voiceover_paths':[],'source_locale_observed':locale in inventory[p['slug']]['observed_source_locales'],'approval':'not started'} for p in products}},indent=2)+'\n')
(out/'supported-locales.json').write_text(json.dumps({'target_pool':sorted(all_locales),'products':inventory},indent=2)+'\n')
(out/'keyword-comparison.json').write_text(json.dumps(comparison,indent=2)+'\n')
print(f'Prepared locale references for {len(all_locales)} observed/target language tags; live keyword fields were not inspected.')
