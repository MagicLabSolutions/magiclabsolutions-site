# coding: utf-8
"""Attach translated copy to the preserved Soooon store story."""
import json,pathlib
b=pathlib.Path('docs/marketing/october-2026/localized');s=json.loads((b/'soooon-original-source.json').read_text());requests=json.loads((b/'soooon-original-requests.json').read_text());ids={r['text']:str(r['id']) for r in requests};langs=json.loads((b/'languages.json').read_text())['soooon']['locales'];aliases={'es-419':'es','es-US':'es','fr-CA':'fr','zh-HK':'zh-Hant'};fixtures={}
for locale in langs:
 raw={r['id']:r['text'] for r in requests} if locale=='en-US' else json.loads((pathlib.Path('/private/tmp/magiclab-soooon-original-translations')/(aliases.get(locale,locale)+'.json')).read_text())
 raw={str(k):v for k,v in raw.items()}
 def t(text):return text if text in ['SOOOON!!!','GIF'] else raw[ids[text]] if text else text
 original={k:[{a:t(v) if a in ['title','highlight','subtitle','bubble'] else v for a,v in item.items()}for item in items] for k,items in s.items() if k!='labels'}
 original['labels']={v:t(v) for v in ids}
 original['provenance']={'method':'existing native Soooon art and actual app language resources; editable marketing translation','source_locale':'en-US','locale':locale}
 file=b/'copy'/f'{locale}.json';d=json.loads(file.read_text());d['products']['soooon']['original_store']=original;file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 fixtures[locale]={text:t(text) for text in ['Mom','Lisbon trip','The weekend','Big concert','Our anniversary','Grandpa']}
(b/'sources/soooon-fictional-titles.json').write_text(json.dumps(fixtures,ensure_ascii=False,indent=2)+'\n')
print('Preserved store copy:',len(langs),'locales')
