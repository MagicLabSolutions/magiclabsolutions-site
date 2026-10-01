/** Verify the owner's large-device, intentional-crop and clean-component pilot. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'docs/marketing/october-2026');
const {chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('playwright');
const campaign=JSON.parse(await fs.readFile(path.join(out,'campaign.json'),'utf8')),p=campaign.products.find(p=>p.slug==='giftly');
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage(),results=[],errors=[];
for(const [platform,size,product] of [['iphone',[1320,2868],p],['ipad',p.ipad_store.dimensions,{...p,...p.ipad_store}]])for(let i=0;i<4;i++){
 await page.setViewportSize({width:size[0],height:size[1]});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/giftly-pilot.html');
 await page.evaluate(async({product,i,size})=>window.renderArtwork(product,i,'store',size),{product,i,size});
 const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {copy:rect('.copy'),device:rect('#device'),screen:rect('#capture'),headline:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),description:parseFloat(getComputedStyle(document.querySelector('.description')).fontSize),cutouts:[...document.querySelectorAll('.ui-cutout')].map(el=>({box:el.getBoundingClientRect().toJSON(),source:el.dataset.source,rect:JSON.parse(el.dataset.rect)}))};});
 const key=platform+'-'+(i+1),[fw,fh]=product.frame.dimensions;
 if(r.device.width/size[0]<.78)errors.push(key+': device too small');
 if(Math.abs(r.device.width/r.device.height-fw/fh)>.0001)errors.push(key+': distorted hardware');
 if(r.device.bottom<=size[1])errors.push(key+': expected intentional bottom crop');
 if(r.copy.bottom>r.device.top-size[0]*.035)errors.push(key+': text overlaps device');
 if(r.headline/size[0]*320<29||r.description/size[0]*320<15)errors.push(key+': copy too small at 320px');
 for(const c of r.cutouts){if(c.box.top<r.device.top+size[0]*.15||c.box.bottom>size[1]||c.box.left<0||c.box.right>size[0])errors.push(key+': cutout clips or covers camera');if(!product.screens.includes(c.source))errors.push(key+': detail is not native to this platform');}
 if(i>0&&!r.cutouts.length)errors.push(key+': missing layered detail');
 results.push({key,...r,headlineAt390:r.headline/size[0]*390,descriptionAt390:r.description/size[0]*390});
}
// A contact sheet is a code-native layout of the accepted exports, not a generated UI.
await page.setViewportSize({width:1608,height:925});await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#eeeae1;font:16px -apple-system,sans-serif;padding:20px}.grid{display:flex;gap:12px}.grid img{display:block;width:383px;height:auto}h1{font-size:19px;margin:0 0 18px}</style><h1>Giftly · English store artwork pilot · iPhone</h1><div class="grid">'+[1,2,3,4].map(i=>'<img src="http://127.0.0.1:8766/docs/marketing/october-2026/exports/en-US/giftly/store-'+i+'.png">').join('')+'</div>');await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.screenshot({path:path.join(out,'giftly-pilot-preview.png')});
await browser.close();await fs.writeFile(path.join(out,'giftly-pilot-validation.json'),JSON.stringify({passed:!errors.length,checked:results.length,errors,results},null,2)+'\n');console.log(JSON.stringify({checked:results.length,errors},null,2));if(errors.length)process.exitCode=1;
