/** Inspect social exports and every product in the private review portal. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'docs/marketing/october-2026'),require=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json')),{chromium}=require('playwright'),sharp=require('sharp'),campaign=JSON.parse(await fs.readFile(path.join(out,'campaign.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),results=[],errors=[];
for(const p of campaign.products){
 const visual=p.social_platform==='ipad'?{...p,...p.ipad_store}:p;
 for(const format of ['social','carousel'])for(let i=0;i<4;i++){
  await page.setViewportSize({width:1080,height:1350});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/social-art.html');await page.evaluate(({p,i,format})=>window.renderArtwork(p,i,format,[1080,1350]),{p:visual,i,format});
  const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {copy:rect('.copy'),device:rect('#device'),capture:rect('#capture'),natural:[document.querySelector('#capture').naturalWidth,document.querySelector('#capture').naturalHeight],footer:rect('.footer'),headline:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)*390/1080,description:parseFloat(getComputedStyle(document.querySelector('.description')).fontSize)*390/1080,cutouts:[...document.querySelectorAll('.ui-cutout')].map(e=>e.getBoundingClientRect().toJSON()),broken:[...document.images].some(i=>i.getAttribute('src')&&(!i.complete||!i.naturalWidth))}});
  const key=p.slug+'/'+format+'-'+(i+1);if(r.copy.bottom+20>r.device.top||r.copy.bottom>730||r.headline<32||r.description<16||r.broken)errors.push(key+': unreadable copy, broken image or hardware overlap');
  if(visual.frame&&Math.abs(r.natural[0]/r.natural[1]/(visual.frame.screen[2]/visual.frame.screen[3])-1)>.003)errors.push(key+': wrong device fit');
  for(const c of r.cutouts)if(c.left<0||c.right>1080||c.top<r.device.top+35||c.bottom>r.footer.top)errors.push(key+': clipped detail or camera overlap');
  const meta=await sharp(path.join(out,'exports/en-US',p.slug,format+'-'+(i+1)+'.png')).metadata();if(meta.width!==1080||meta.height!==1350)errors.push(key+': wrong export dimensions');
  results.push({key,...r});
 }
 console.log('Checked social exports:',p.slug);
 const share=await sharp(path.join(out,'exports/en-US',p.slug,'share-preview.jpg')).metadata();if(share.format!=='jpeg'||share.width!==1200||share.height!==630)errors.push(p.slug+': incorrect link preview');
}
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/index.html');
 console.log('Checking review at',width);
 for(const p of campaign.products){console.log('Review',width,p.slug);await page.locator('nav button[data-slug="'+p.slug+'"]').click();await page.evaluate(()=>{const images=[...document.querySelectorAll('#product img')];images.forEach(i=>i.loading='eager');return Promise.race([Promise.all(images.map(i=>i.decode())),new Promise((_,reject)=>setTimeout(()=>reject(Error('Review images failed to load')),20000))])});const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,missing:[...document.querySelectorAll('#product img')].filter(i=>!i.naturalWidth).length,preserve:document.querySelector('#product').textContent.includes('current')}));if(r.overflow||r.missing)errors.push(width+'/'+p.slug+': broken review layout');}
}
await browser.close();await fs.writeFile(path.join(out,'revision-validation.json'),JSON.stringify({passed:errors.length===0,socialExports:results.length,sharePreviews:campaign.products.length,reviewWidths:[1440,390,320],errors,results},null,2)+'\n');console.log(JSON.stringify({socialExports:results.length,sharePreviews:campaign.products.length,errors}));if(errors.length)process.exitCode=1;
