/** Compose native Mac windows; measure localized complete cards independently. */
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'docs/marketing/october-2026/giftly-macos');
const runtime=process.env.MAGICLAB_NODE_MODULES||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require=createRequire(path.join(runtime,'../package.json')),{chromium}=require('playwright'),sharp=require('sharp');
const wanted=process.argv.slice(2),base=process.env.MAGICLAB_CAMPAIGN_URL||'http://127.0.0.1:8766';
const rows=(await fs.readFile(path.join(out,'marketing-copy.tsv'),'utf8')).trim().split('\n').map(l=>l.split('|'));
const expected=JSON.parse(await fs.readFile(path.join(root,'docs/marketing/october-2026/localized/languages.json'),'utf8')).giftly.locales;
assert.deepEqual(rows.map(r=>r[0]).sort(),[...expected].sort());
async function measureCards(file,rtl){
 const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,2560);assert.equal(info.height,1600);
 const left=rtl?0:1880,right=rtl?680:2560;
 const ranges=[];let current=null;
 for(let y=450;y<1600;y++){
  let n=0,min=right,max=left;
  for(let x=left;x<right;x++){const i=(y*info.width+x)*3;if(data[i]===255&&data[i+1]===253&&data[i+2]===248){n++;min=Math.min(min,x);max=Math.max(max,x);}}
  if(n>50){current??={top:y,left:min,right:max};current.bottom=y;current.left=Math.min(current.left,min);current.right=Math.max(current.right,max);}
  else if(current){if(current.bottom-current.top>70)ranges.push(current);current=null;}
 }
 // Shoes/clothing, interests, gift ideas: separate native paper cards.
 assert(ranges.length>=3,`${file}: missing complete native cards`);
 return ranges.slice(0,3).map(r=>[r.left-2,r.top-2,r.right-r.left+5,r.bottom-r.top+5]);
}
const browser=await chromium.launch({headless:true,channel:'chrome'}),records=[];
try{const page=await browser.newPage({viewport:{width:2880,height:1800},deviceScaleFactor:1});
for(const row of rows){const locale=row[0];if(wanted.length&&!wanted.includes(locale))continue;
 const dest=path.join(out,'exports',locale);await fs.mkdir(dest,{recursive:true});
 for(let panel=0;panel<4;panel++){
  const screen=['today','upcoming','people','calendar'][panel],file=path.join(out,'native',locale,screen+'.png'),cards=await measureCards(file,['ar','he'].includes(locale));
  const crop=panel===2?{rect:cards[2],width:1030,left:1710,top:1010,angle:3}:panel===3?{rect:cards[1],width:1060,left:140,top:1190,angle:-3}:null;
  // Long scripts may wrap in the title. Keep emphasis below the measured copy.
  const copy=[row[1+panel*2],row[2+panel*2]];
  await page.goto(base+'/docs/marketing/october-2026/giftly-macos/art.html');
  const first=await page.evaluate(input=>window.renderMac(input),{locale,panel,copy,crops:[]});
  if(crop){const minimumTop=first.windowTop+200;crop.width=Math.min(crop.width,(1740-minimumTop)*crop.rect[2]/crop.rect[3]);crop.top=Math.max(minimumTop,Math.min(crop.top,1740-crop.rect[3]*crop.width/crop.rect[2]));assert(crop.width>=600,`${locale}/${panel}: card would be unreadably small`);}
  const metric=await page.evaluate(input=>window.renderMac(input),{locale,panel,copy,crops:crop?[crop]:[]});
  assert(metric.copyFits,`${locale}/${panel}: copy overflow`);
  assert(metric.cutouts.every(r=>r.x>=0&&r.x+r.width<=2880&&r.y>=metric.copyBottom&&r.y+r.height<=1800),`${locale}/${panel}: cropped card`);
  const buffer=await page.screenshot();const target=path.join(dest,`mac-store-${panel+1}.png`);
  await sharp(buffer).removeAlpha().png({compressionLevel:9}).toFile(target);
  const bytes=await fs.readFile(target),meta=await sharp(bytes).metadata();assert.equal(meta.width,2880);assert.equal(meta.height,1800);assert.equal(meta.hasAlpha,false);
  records.push({locale,panel:panel+1,file:path.relative(root,target),native:path.relative(root,file),sha256:createHash('sha256').update(bytes).digest('hex'),md5:createHash('md5').update(bytes).digest('hex'),...metric,crop});
 }
 console.log(locale+' Mac store artwork rendered');
}
await page.close();
}finally{await browser.close();}
const manifest=path.join(out,'export-manifest.json'),previous=JSON.parse(await fs.readFile(manifest,'utf8').catch(()=>'[]')),keys=new Set(records.map(r=>r.locale+'/'+r.panel));
await fs.writeFile(manifest,JSON.stringify([...previous.filter(r=>!keys.has(r.locale+'/'+r.panel)),...records],null,2)+'\n');
for(const locale of new Set(records.map(r=>r.locale))){
 const dest=path.join(out,'exports',locale),tiles=[];
 for(let i=0;i<4;i++){const file=path.join(dest,`mac-store-${i+1}.png`);tiles.push({input:await sharp(file).resize(640,400).toBuffer(),left:(i%2)*660,top:Math.floor(i/2)*420});}
 await sharp({create:{width:1300,height:820,channels:3,background:'#e9e6de'}}).composite(tiles).jpeg({quality:92}).toFile(path.join(dest,'contact-sheet.jpg'));
}
