/** Compose English Kinfold masters from verified native captures and Apple PNG hardware. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const folder=path.join(root,'docs/marketing/october-2026/kinfold-store');
const req=createRequire(path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'));
const sharp=req('sharp'),{chromium}=req('playwright');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const url=file=>pathToFileURL(file).href;
const copy=await read(path.join(folder,'copy.json')),layout=await read(path.join(folder,'layout.json')),frames=await read(path.join(folder,'frames.json'));
assert.equal(copy.panels.length,6);
const exports=path.join(folder,'exports/en-US'),previews=path.join(folder,'previews/en-US');
await fs.mkdir(exports,{recursive:true});await fs.mkdir(previews,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
const records=[];
try {
 for(const platform of ['iphone','ipad']) {
  const proof=await read(path.join(folder,'capture-'+platform+'.json'));
  assert.equal(proof.records.length,7);
  for(const record of proof.records) assert.equal(await hash(path.join(root,record.file)),record.sha256,'Capture changed: '+record.file);
  const [width,height]=platform==='iphone'?[1320,2868]:[2064,2752];
  const frame=frames.find(f=>f.hardware===platform),asset=path.join(root,frame.asset.slice(1));
  assert.equal(await hash(asset),frame.sha256);
  await page.setViewportSize({width,height});
  for(const [index,panel] of copy.panels.entries()) {
   const number=index+1,capture=path.join(folder,'native/en-US',platform,number+'-'+panel.key+'.png'),source=await sharp(capture).metadata();
   assert.deepEqual([source.width,source.height],[width,height]);
   const details=(layout[platform][number]||[]).map(d=>({...d,source:url(path.join(folder,'native/en-US',platform,d.source+'.png'))}));
   for(const d of details) {assert(d.rect[0]>=0&&d.rect[1]>=0&&d.rect[2]<=width&&d.rect[3]<=height);assert(d.rect[2]>d.rect[0]&&d.rect[3]>d.rect[1]);}
   await page.goto(url(path.join(folder,'art.html')));
   const metrics=await page.evaluate(c=>window.render(c),{...panel,number,platform,width,height,capture:url(capture),details,frame:{...frame,asset:url(asset)},background:url(path.join(folder,'assets/family-airport.png')),icon:url(path.join(folder,'assets/app-icon.png'))});
   assert(!metrics.overflow,'Copy overflow');
   assert(metrics.fonts.headline*390/width>=32);assert(metrics.fonts.description*390/width>=16);
   assert(metrics.fonts.headline*320/width>=26);assert(metrics.fonts.description*320/width>=13);
   if(number>1) assert(metrics.device.y-metrics.copy.bottom<=width*.06);
   assert.deepEqual(metrics.sourceSize,[width,height]);
   for(const d of metrics.details) {assert(d.y>metrics.copy.bottom,'Detail covers headline');assert(d.x>=10&&d.right<=width-10,'Detail clipped horizontally');assert(d.bottom<height-20,'Detail clipped vertically');}
   const file=path.join(exports,(platform==='ipad'?'ipad-store-':'store-')+number+'.png');
   await sharp(await page.locator('#art').screenshot()).removeAlpha().png({compressionLevel:6}).toFile(file);
   const meta=await sharp(file).metadata();assert(!meta.hasAlpha);assert.deepEqual([meta.width,meta.height],[width,height]);
   for(const previewWidth of [390,320]) await sharp(file).resize({width:previewWidth}).jpeg({quality:92}).toFile(path.join(previews,path.basename(file,'.png')+'-'+previewWidth+'.jpg'));
   records.push({number,platform,key:panel.key,file:path.relative(root,file),sha256:await hash(file),capture:path.relative(root,capture),captureSha256:await hash(capture),details:layout[platform][number]||[],headline:panel.headline,description:panel.description,metrics});
   console.log('Rendered',platform,number,panel.key);
  }
 }
} finally {await browser.close();}
assert.equal(records.length,12);
await fs.writeFile(path.join(folder,'validation.json'),JSON.stringify({locale:'en-US',stage:'English owner-review pilot',renderedAt:new Date().toISOString(),count:records.length,records},null,2)+'\n');
for(const platform of ['iphone','ipad']) {
 const phone=platform==='iphone',thumbWidth=phone?320:390,thumbHeight=Math.round(thumbWidth*(phone?2868/1320:2752/2064));
 const gap=18,title=70,columns=3,rows=2,canvasWidth=columns*(thumbWidth+gap)+gap,canvasHeight=rows*(thumbHeight+48+gap)+title+gap,layers=[];
 for(let n=1;n<=6;n++) {const prefix=phone?'store':'ipad-store',x=gap+((n-1)%columns)*(thumbWidth+gap),y=title+Math.floor((n-1)/columns)*(thumbHeight+48+gap);
  layers.push({input:await sharp(path.join(exports,prefix+'-'+n+'.png')).resize({width:thumbWidth}).toBuffer(),left:x,top:y});
  layers.push({input:Buffer.from(`<svg width="${thumbWidth}" height="40"><text x="0" y="27" font-family="Arial" font-size="18" fill="#242145">${n}. ${copy.panels[n-1].key}</text></svg>`),left:x,top:y+thumbHeight+5});
 }
 layers.push({input:Buffer.from(`<svg width="${canvasWidth}" height="60"><text x="18" y="40" font-family="Arial" font-size="26" font-weight="bold" fill="#242145">Kinfold · English · ${phone?'iPhone':'iPad'} · 6 images</text></svg>`),left:0,top:0});
 await sharp({create:{width:canvasWidth,height:canvasHeight,channels:3,background:'#eae7e0'}}).composite(layers).jpeg({quality:92}).toFile(path.join(folder,'contact-'+platform+'.jpg'));
}
console.log('Verified 12 opaque RGB masters; preview sizes 390 and 320.');
