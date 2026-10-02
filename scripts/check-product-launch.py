#!/usr/bin/env python3
"""Validate clean native product pages and usable destinations across locales."""
import argparse,json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.images=[];self.products=[];self.h1=0;self.videos=0;self.demos=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag=='img':self.images.append(a.get('src',''))
        if tag=='body':self.products.append(a.get('data-product'))
        if tag=='h1':self.h1+=1
        if tag=='video':self.videos+=1
        if 'data-demo' in a:self.demos+=1

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('build',type=Path);build=parser.parse_args().build
launch=json.loads((root/'_data/product_launch.json').read_text());localized=json.loads((root/'_data/product_launch_localized.json').read_text());catalog=json.loads((root/'_data/portfolio.json').read_text());errors=[];count=0
for locale in ['','pt-BR','de','es','fr','ja','ko','zh-Hans']:
    for slug,config in launch.items():
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
