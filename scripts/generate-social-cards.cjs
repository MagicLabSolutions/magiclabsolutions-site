#!/usr/bin/env node
// Render share cards from approved icons and editable website copy. Requires sharp.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const width = 1200, height = 630;
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const svg = body => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`);
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const iconCache = new Map();
async function icon(file, size) {
  const key = `${file}:${size}`;
  if (!iconCache.has(key)) {
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * .22}" fill="white"/></svg>`);
    iconCache.set(key, await sharp(path.join(root, file)).resize(size, size).composite([{input:mask, blend:'dest-in'}]).png().toBuffer());
  }
  return iconCache.get(key);
}
async function text(value, {size = 70, maxWidth = 650, maxHeight = 230, color = '#f5f3ed', bold = true, font = 'Arial'} = {}) {
  for (let n = size; n >= 12; n -= 2) {
    const input = await sharp({text: {text: `<span foreground="${color}">${xml(value)}</span>`, font: `${font}${bold ? ' Bold' : ''} ${n}`, width: maxWidth, rgba: true, dpi: 72, wrap: 'word-char', ...(font === 'Nunito' ? {fontfile:path.join(root,'images/tumtum/Nunito-ExtraBold.ttf')} : {})}}).png().toBuffer();
    if ((await sharp(input).metadata()).height <= maxHeight) return input;
  }
  throw new Error(`Share text does not fit: ${value}`);
}
function backdrop(accent, light = false) {
  return `<defs><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".14"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="${light ? '#f6f0e5' : '#090a0e'}"/><ellipse cx="965" cy="305" rx="390" ry="370" fill="url(#glow)"/><path d="M-80 435C175 255 352 730 795 405S1320 80 1320 430" fill="none" stroke="${accent}" stroke-width="2" opacity=".32"/><path d="M-80 450C175 270 352 745 795 420S1320 95 1320 445" fill="none" stroke="${accent}" stroke-width="1" opacity=".12"/><text x="64" y="73" font-family="Arial, sans-serif" font-size="31" font-weight="700" letter-spacing="-1" fill="${light ? '#343b32' : '#f5f3ed'}">magic lab<tspan fill="${accent}">.</tspan></text><text x="64" y="585" font-family="Arial, sans-serif" font-size="16" fill="${light ? '#616657' : '#a4a1b0'}">magiclabsolutions.com</text>`;
}
async function save(name, composite, background, alt) {
  const bytes = await sharp(svg(background)).composite(composite).jpeg({quality:92, mozjpeg:true}).toBuffer();
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 10);
  const image = `/images/share/${name}-${hash}.jpg`;
  await fs.writeFile(path.join(root, image), bytes);
  return {image, width, height, alt};
}
async function main() {
  const homes = await read('_data/home_page.json'), products = await read('_data/portfolio.json');
  await fs.mkdir(path.join(root, 'images/share'), {recursive: true});
  const manifest = {home: {}, products: {}};
  for (const [lang, home] of Object.entries(homes)) {
    const layers = [
      {input:await text(home.title_first,{size:93,maxWidth:660,maxHeight:112}),left:64,top:185},
      {input:await text(home.title_second,{size:93,maxWidth:660,maxHeight:120,color:'#b5a5ff'}),left:64,top:300},
      {input:await text(home.eyebrow,{size:23,maxWidth:650,maxHeight:70,color:'#b9b5c7',bold:false}),left:66,top:463}
    ];
    const slugs = ['toctoc','poof','zuzu','memories','tumtum','brainfold'];
    for (let i=0;i<slugs.length;i++) {
      const app=products.find(p=>p.slug===slugs[i]), size=126;
      const buffer=await sharp(await icon(app.icon,size)).rotate(i%2?9:-7,{background:'#00000000'}).png().toBuffer();
      layers.push({input:buffer,left:760+(i%2)*208,top:83+Math.floor(i/2)*165});
    }
    manifest.home[lang]=await save(`magiclab-${lang}`,layers,backdrop('#b5a5ff'),`Magic Lab Solutions — ${home.title_first} ${home.title_second}`);
  }
  for (const app of products) {
    manifest.products[app.slug]={};
    for (const [lang, copy] of Object.entries(app.copy)) {
      const light=app.slug==='tumtum', accent=light?'#a06847':app.color;
      const ink=light?'#343b32':'#f5f3ed', font=light?'Nunito':'Arial';
      const layers=[
        {input:await text(app.name,{size:34,maxWidth:660,maxHeight:65,color:accent,font}),left:64,top:169},
        {input:await text(copy.headline,{size:76,maxWidth:650,maxHeight:252,color:ink,font}),left:60,top:238},
        {input:await text(app.platform,{size:20,maxWidth:660,maxHeight:52,color:light?'#616657':'#a4a1b0',bold:false}),left:65,top:520},
        {input:await icon(app.icon,286),left:831,top:196}
      ];
      manifest.products[app.slug][lang]=await save(`${app.slug}-${lang}`,layers,backdrop(accent,light),`${app.name} — ${copy.headline}`);
    }
  }
  await fs.writeFile(path.join(root,'_data/share_images.json'),JSON.stringify(manifest,null,2)+'\n');
  const count=Object.keys(manifest.home).length+Object.values(manifest.products).reduce((n,p)=>n+Object.keys(p).length,0);
  console.log(`Rendered ${count} versioned JPEG cards at ${width}×${height}.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
