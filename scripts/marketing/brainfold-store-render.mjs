/** Approved import panel localization and native macOS gallery, without changing old iOS pixels. */
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),base=path.join(root,'docs/marketing/october-2026'),out=path.join(base,'brainfold-1.2.1');
const req=createRequire(path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')),sharp=req('sharp'),{chromium}=req('playwright');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),copy=(await read(path.join(out,'import-copy.json'))).locales,langs=(await read(path.join(base,'localized/languages.json'))).brainfold.locales;
const selection=process.argv.find(a=>a.startsWith('--locales='))?.slice(10).split(',')||langs,formats=process.argv.find(a=>a.startsWith('--formats='))?.slice(10).split(',')||['iphone','ipad','mac'];
const asset=p=>pathToFileURL(path.resolve(root,p)).href;
const iphone={asset:asset(path.join(base,'.frames-cache/iphone.png')),dimensions:[1470,3000],screen:[75,66,1320,2868]},ipad={asset:asset(path.join(base,'.frames-cache/ipad.png')),dimensions:[2300,3000],screen:[118,124,2064,2752]},mac={...(await read(path.join(out,'mac-frame.json'))),asset:asset(path.join(base,'.frames-cache/macbook-pro-m5-16-black.png'))};
async function measureCard(file,blue=false){
 const {data,info}=await sharp(file).resize({width:600,kernel:'nearest'}).removeAlpha().raw().toBuffer({resolveWithObject:true}),W=info.width,H=info.height,C=info.channels,mask=new Uint8Array(W*H),queue=new Int32Array(W*H),found=[];
 for(let i=0;i<mask.length;i++)mask[i]=blue?(data[i*C+2]>data[i*C]*1.2&&data[i*C+2]>data[i*C+1]*1.1&&data[i*C+2]>100&&data[i*C]<180&&data[i*C+1]<180):Math.min(data[i*C],data[i*C+1],data[i*C+2])>253;
 for(let start=0;start<mask.length;start++){if(!mask[start])continue;let first=0,last=1,minX=W,minY=H,maxX=0,maxY=0;queue[0]=start;mask[start]=0;while(first<last){const id=queue[first++],x=id%W,y=Math.floor(id/W);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const n of [x?id-1:-1,x<W-1?id+1:-1,y?id-W:-1,y<H-1?id+W:-1])if(n>=0&&mask[n]){mask[n]=0;queue[last++]=n;}}const w=maxX-minX+1,h=maxY-minY+1;if(w>W*.2&&h>H*.025&&last/(w*h)>.6&&minY>H*.1)found.push({rect:[minX*4,minY*4,(maxX+1)*4,(maxY+1)*4],area:last});}
 found.sort((a,b)=>b.area-a.area);assert(found.length,'No native component found: '+file);return found[0].rect;
}
const macOverrides=(await read(path.join(out,'mac-copy-overrides.json'))).locales,nativeShort=(await read(path.join(out,'native-short-copy.json'))).locales;
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
try{for(const locale of selection){const folder=path.join(out,'exports',locale);await fs.mkdir(folder,{recursive:true});const validation=[];
 for(const format of formats){const isMac=format==='mac',isIpad=format==='ipad',[width,height]=isMac?[2880,1800]:isIpad?[2064,2752]:[1320,2868],prefix=isMac?'mac-store':isIpad?'ipad-store':'store';
  if(!isMac)for(let n=1;n<=6;n++)await fs.copyFile(path.join(base,'localized/exports',locale,'brainfold',`${prefix}-${n}.png`),path.join(folder,`${prefix}-${n===1?1:n+1}.png`));
  const panels=isMac?(await read(path.join(base,'localized/copy',locale+'.json'))).products.brainfold.panels:null;
  for(const number of isMac?[1,2,3,4,5,6,7]:[2]){
   const target=path.join(folder,`${prefix}-${number}.png`);
   if(format==='iphone'&&locale==='en-US'){await fs.copyFile(path.join(base,'brainfold-import-pilot/exports/en-US/store-2-pilot.png'),target);validation.push({format,number,preservedApprovedEnglishPilot:true});continue;}
   const isImport=number===2,index=isImport?2:number===1?1:number-1;
   const capture=isMac?path.join(out,'native',locale,`native-${index}.png`):path.join(base,'localized/native/brainfold',locale,format,`native-2.png`);
   let rect=null,radius=50;if(isImport){if(isMac){rect=await measureCard(capture);radius=40;}else{const bounds=(await read(path.join(base,'localized/card-bounds/brainfold',locale,format+'.json')))[1][0];if(bounds){rect=bounds.rect;radius=bounds.radius;}else if(locale==='bn'&&format==='iphone'){rect=[60,920,1256,2176];radius=50;}else throw Error('Missing native card bounds '+locale+' '+format);}}
   if(isMac&&!isImport&&[3,5].includes(number)){rect=await measureCard(capture,number===5);radius=40;}
   const panel=isMac&&!isImport?(macOverrides[locale]?.[String(number)]||panels[index-1]):null;
   const config={number,locale,direction:copy[locale].direction,format,width,height,import:isImport,headline:isImport?(isMac&&copy[locale].macHeadline?copy[locale].macHeadline:copy[locale].headline):panel[0],description:isImport?copy[locale][isMac?'macDescription':'iosDescription']:panel[1],capture:asset(capture),frame:isMac?mac:isIpad?ipad:iphone,rect,radius,icon:asset('images/portfolio/brainfold/icon.webp'),photo:asset(path.join(base,'brainfold-import-pilot/assets/scan-schoolbook-sticker-v2.png'))};
   await page.setViewportSize({width,height});await page.goto(pathToFileURL(path.join(out,'art.html')).href);let metrics=await page.evaluate(c=>window.render(c),config);
   if(isMac&&!isImport&&(metrics.copy.bottom>1330||(metrics.card&&metrics.card.width<600))){config.headline=nativeShort[locale][index-1].headline;config.compactHeadline=true;metrics=await page.evaluate(c=>window.render(c),config);if(metrics.copy.bottom>1330||(metrics.card&&metrics.card.width<600)){config.description=nativeShort[locale][index-1].description||config.description;metrics=await page.evaluate(c=>window.render(c),config);}}
   if(isMac){assert(metrics.copy.bottom<=1400,`${locale} ${number}: shorten Mac copy`);assert(metrics.fonts.headline*390/2880>=31.9);assert(metrics.fonts.description*390/2880>=15.7);if(isImport)assert(metrics.copy.bottom<=1260,`${locale}: shorten Mac import copy`);if(metrics.card)assert(metrics.card.width>=600,`${locale} ${number}: native detail too small`);}
   assert(!metrics.copyOverflow,`${locale} ${format}: copy overflow`);assert(metrics.device.y>=metrics.copy.bottom||isMac);if(metrics.card){assert(metrics.card.y>=metrics.copy.bottom,`${locale} ${format}: card over copy`);assert(metrics.card.x>=0&&metrics.card.x+metrics.card.width<=width+8);assert(metrics.card.y+metrics.card.height<=height,`${locale} ${format}: card clipped`);}
   const bytes=await page.locator('#art').screenshot();await sharp(bytes).removeAlpha().png({compressionLevel:9}).toFile(target);const data=await fs.readFile(target),meta=await sharp(data).metadata();assert.equal(meta.hasAlpha,false);assert.equal(meta.width,width);assert.equal(meta.height,height);
   validation.push({format,number,file:path.relative(root,target),sha256:createHash('sha256').update(data).digest('hex'),capture:path.relative(root,capture),copy:{headline:config.headline,description:config.description,compactHeadline:config.compactHeadline||false},metrics});
   if(['en-US','pt-BR','ar','ja','de','ml','ta','zh-HK'].includes(locale)){const previews=path.join(out,'previews',locale);await fs.mkdir(previews,{recursive:true});await sharp(data).resize({width:format==='mac'?780:390}).jpeg({quality:92}).toFile(path.join(previews,`${prefix}-${number}.jpg`));}
  }
 }
 const record=path.join(out,'validation',locale+'.json');await fs.mkdir(path.dirname(record),{recursive:true});let existing=[];try{existing=(await read(record)).images;}catch{};await fs.writeFile(record,JSON.stringify({checkedAt:new Date().toISOString(),locale,images:[...existing.filter(x=>!formats.includes(x.format)),...validation]},null,2)+'\n');console.log('RENDERED',locale,formats.join(','));
}}finally{await browser.close();}
