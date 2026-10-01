/** Reproducible text-first artwork exports. Set MAGICLAB_NODE_MODULES to a Playwright installation. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const deps=process.env.MAGICLAB_NODE_MODULES;
if(!deps)throw Error('Set MAGICLAB_NODE_MODULES to the bundled Node.js node_modules directory.');
const {chromium}=createRequire(path.join(deps,'package.json'))('playwright');
const campaign=JSON.parse(await fs.readFile(path.join(root,'docs/marketing/october-2026/campaign.json'),'utf8'));
const base=process.env.MAGICLAB_CAMPAIGN_URL || 'http://127.0.0.1:8766';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({deviceScaleFactor:1});
const records=[];
const wanted=process.argv.slice(2);
for(const p of campaign.products){
 if(wanted.length&&!wanted.includes(p.slug))continue;
 const output=path.join(root,'docs/marketing/october-2026/exports/en-US',p.slug);await fs.mkdir(output,{recursive:true});
 const formats=[['social',[1080,1350]],['carousel',[1080,1350]],['video',[1080,1920]]];
 if(!p.preserve_store){
  formats.push(['store',p.device==='mac'?[2880,1800]:p.device==='web'?[2400,1500]:p.slug==='sundust'?[2868,1320]:[1320,2868]]);
  if(p.play_store)formats.push(['play-store',p.play_store.dimensions]);
  if(p.ipad_store)formats.push(['ipad-store',p.ipad_store.dimensions]);
  // iPad and Mac artwork require actual captures from those devices, never a resized phone UI.
 }
 for(const [format,dimensions] of formats){
  if(process.env.MAGICLAB_FORMATS&&!process.env.MAGICLAB_FORMATS.split(',').includes(format))continue;
  await page.setViewportSize({width:dimensions[0],height:dimensions[1]});
  await page.goto(base+'/docs/marketing/october-2026/art.html');
  const variants=format==='video'?[0,1]:[0];
  for(const variant of variants)for(let i=0;i<(format==='video'?3:4);i++){
   const visual=await page.evaluate(({p,i,format,dimensions,variant})=>window.renderArtwork(p,i,format,dimensions,variant),{p:format==='play-store'?{...p,...p.play_store,frame:null,capture_has_device_frame:false}:format==='ipad-store'?{...p,...p.ipad_store,capture_has_device_frame:false}:p,i,format:['play-store','ipad-store'].includes(format)?'store':format,dimensions,variant});
   const filename=format==='video'?`reel-${variant+1}-frame-${i+1}.png`:`${format}-${i+1}.png`;
   await page.screenshot({path:path.join(output,filename)});
   const metrics=await page.evaluate(()=>{const img=document.querySelector('#capture'),h=document.querySelector('h1'),wrap=document.querySelector('.capture-wrap');return {headline:h.getBoundingClientRect().toJSON(),image:img.getBoundingClientRect().toJSON(),wrapper:wrap.getBoundingClientRect().toJSON(),imageNaturalWidth:img.naturalWidth};});
   if(visual.scrollWidth>dimensions[0]||visual.scrollHeight>dimensions[1])throw Error(`${p.slug}/${filename}: artwork overflows`);
   records.push({slug:p.slug,filename,format,dimensions,...metrics});
  }
 }
 console.log(`Rendered ${p.name}`,true);
}
await browser.close();
const metricsPath=path.join(root,'docs/marketing/october-2026/render-metrics.json');
const previous=JSON.parse(await fs.readFile(metricsPath,'utf8').catch(()=>'[]'));
const keys=new Set(records.map(r=>r.slug+'/'+r.filename));
await fs.writeFile(metricsPath,JSON.stringify([...previous.filter(r=>!keys.has(r.slug+'/'+r.filename)),...records],null,2)+'\n');
