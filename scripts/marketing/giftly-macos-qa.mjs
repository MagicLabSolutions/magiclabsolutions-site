import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'docs/marketing/october-2026/giftly-macos');
const sharp=createRequire(path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'))('sharp');
const read=async name=>JSON.parse(await fs.readFile(path.join(out,name),'utf8'));
const locales=JSON.parse(await fs.readFile(path.join(root,'docs/marketing/october-2026/localized/languages.json'),'utf8')).giftly.locales;
const captures=await read('capture-manifest.json'),exports=await read('export-manifest.json');
assert.equal(captures.captures.length,locales.length*4);assert.equal(exports.length,locales.length*4);
for(const locale of locales){assert.equal(captures.captures.filter(c=>c.locale===locale).length,4);assert.equal(exports.filter(c=>c.locale===locale).length,4);}
for(const c of captures.captures){const bytes=await fs.readFile(path.join(root,c.file));assert.equal(createHash('sha256').update(bytes).digest('hex'),c.sha256);assert(c.nativeLocale.endsWith('bundle='+(c.locale==='en-US'?'en':c.locale)),`Native fallback for ${c.locale}`);const m=await sharp(bytes).metadata();assert.equal(m.width,2560);assert.equal(m.height,1600);}
for(const e of exports){const bytes=await fs.readFile(path.join(root,e.file));assert.equal(createHash('sha256').update(bytes).digest('hex'),e.sha256);assert.equal(createHash('md5').update(bytes).digest('hex'),e.md5);const m=await sharp(bytes).metadata();assert.equal(m.width,2880);assert.equal(m.height,1800);assert.equal(m.hasAlpha,false);assert.equal(m.format,'png');assert(e.copyFits);assert(e.headlineSize/2880*390>=32);assert(e.descriptionSize/2880*390>=16);assert.equal(e.windowTop-Math.ceil(e.copyBottom),80);assert.equal(e.crop!==null,[3,4].includes(e.panel));}
const selected=['en-US','de','el','ar','he','hi','ko','th','zh-Hans'],tiles=[];
for(let i=0;i<selected.length;i++){
 const e=exports.find(e=>e.locale===selected[i]&&e.panel===3);
 for(const [col,w] of [[0,390],[1,320]]){
  const left=(i%3)*750+(col===1?410:0),top=Math.floor(i/3)*300;
  const label=Buffer.from(`<svg width="${w}" height="24"><rect width="100%" height="100%" fill="#e7e2d7"/><text x="8" y="17" font-family="sans-serif" font-size="15">${e.locale} — ${w}px</text></svg>`);
  tiles.push({input:label,left,top},{input:await sharp(path.join(root,e.file)).resize(w).png().toBuffer(),left,top:top+28});
 }
}
await sharp({create:{width:2230,height:900,channels:3,background:'#e7e2d7'}}).composite(tiles).png().toFile(path.join(out,'mobile-qa.png'));
await fs.copyFile(path.join(out,'exports/en-US/contact-sheet.jpg'),path.join(out,'english-preview.jpg'));
const report={checkedAt:new Date().toISOString(),languages:locales.length,nativeCaptures:captures.captures.length,masters:exports.length,size:[2880,1800],opacity:'RGB without alpha',nativeLocaleFallbacks:0,highlightedPanels:exports.filter(e=>e.crop).length,copyOverflow:0,translationMethod:'Model-written concise Mac benefit copy; layout and brand QA, not certified native-speaker review',sourceRevision:captures.sourceRevision};
await fs.writeFile(path.join(out,'asset-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
