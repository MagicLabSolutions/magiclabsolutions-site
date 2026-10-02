#!/usr/bin/env python3
"""Validate clean native product pages and usable destinations across locales."""
import argparse,json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.images=[];self.products=[];self.h1=0;self.videos=0;self.demos=0;self.components=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag=='img':self.images.append(a.get('src',''))
        if tag=='img' and 'data-native-component' in a:self.components.append(a)
        if tag=='body':self.products.append(a.get('data-product'))
        if tag=='h1':self.h1+=1
        if tag=='video':self.videos+=1
        if 'data-demo' in a:self.demos+=1

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('build',type=Path);build=parser.parse_args().build
launch=json.loads((root/'_data/product_launch.json').read_text());localized=json.loads((root/'_data/product_launch_localized.json').read_text());catalog=json.loads((root/'_data/portfolio.json').read_text());errors=[];count=0
global_locales=['','pt-BR','de','es','fr','ja','ko','zh-Hans']
routes=[(locale,slug,config) for locale in global_locales for slug,config in launch.items()]
routes += [(locale,slug,launch[slug]) for slug,variants in localized.items() for locale in variants if locale!='en-US' and locale not in global_locales]
for locale,slug,config in routes:
    file=build/locale/'apps'/slug/'index.html';label=str(file.relative_to(build))
    if not file.is_file():errors.append(label+': missing');continue
    html=file.read_text();page=Page();page.feed(html);count+=1
    if page.products!=[slug] or page.h1!=1 or page.demos!=1 or page.videos:errors.append(label+': incorrect product, heading, demo or video policy')
    if '/Users/' in html:errors.append(label+': local source paths in public markup')
    for image in page.images:
        if '/exports/' in image or '/store-' in image or '/ipad-store-' in image:errors.append(label+': store composition in native page')
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc:continue
        if not url.path:
            if url.fragment and url.fragment not in page.ids:errors.append(label+': missing '+link)
            continue
        target=build/unquote(url.path).lstrip('/')
        if not target.is_file() and not (target/'index.html').is_file():errors.append(label+': missing '+link)
    product=next(p for p in catalog if p['slug']==slug)
    if product['status']!='released' and any(urlsplit(u).netloc in ['apps.apple.com','play.google.com'] for u in page.links):errors.append(label+': unreleased download promise')
    page_config=localized.get(slug,{}).get(locale or 'en-US',config)
    expected=[c for c in [page_config.get('hero_cutout')]+[f.get('cutout') for f in page_config['features']] if c]
    if len(page.components)!=len(expected):errors.append(label+': missing or empty native component')
    for crop in expected:
        rendered=crop.get('rendered',{})
        if not rendered.get('src') or rendered['src'] not in page.images:errors.append(label+': component has no real crop image');continue
        if not (build/rendered['src'].lstrip('/')).is_file():errors.append(label+': missing component asset')
        if rendered.get('width',0)<1 or rendered.get('height',0)<1 or not rendered.get('source_sha256'):errors.append(label+': unverified component geometry')
    if len(page_config['fleet'])>1 and 'l-fleet--stacked' not in html:errors.append(label+': multi-device platform stage is not combined')
    for feature in page_config['features']:
        if feature['device']['image']['src'] not in page.images:errors.append(label+': missing native feature capture')
for slug,config in launch.items():
    for item in config['fleet']:
        device=item['device'];frame=device['frame']
        if not frame:continue
        x,y,w,h=frame['screen'];fw,fh=frame['dimensions'];image=device['image']
        if x<0 or y<0 or x+w>fw or y+h>fh:errors.append(slug+': hardware opening outside device')
        if abs((image['width']/image['height'])/(w/h)-1)>.001:errors.append(slug+': native screenshot aspect mismatch')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {count} native product pages; links, availability, original screens, frame geometry and video policy.')
