/** Validate native geometry and the legibility of the approved studio pattern. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'docs/marketing/october-2026');
const {chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('playwright');
const campaign=JSON.parse(await fs.readFile(path.join(out,'campaign.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
for(const p of campaign.products.filter(p=>process.argv.slice(2).includes(p.slug))){
 const results=[],errors=[];
 const primarySize=p.device==='mac'?[2880,1800]:p.device==='web'?[2400,1500]:p.device==='landscape'?[2868,1320]:p.preserve_store?[1080,1350]:[1320,2868];
 const formats=[['primary',primarySize,p]];
 if(p.ipad_store)formats.push(['ipad',p.ipad_store.dimensions,{...p,...p.ipad_store}]);
 if(p.play_store)formats.push(['android',p.play_store.dimensions,{...p,...p.play_store,frame:null}]);
 for(const [platform,size,product] of formats){
  let layered=0;
  for(let i=0;i<product.panels.length;i++){
   await page.setViewportSize({width:size[0],height:size[1]});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/studio-art.html');
   await page.evaluate(({product,i,size})=>window.renderArtwork(product,i,'store',size),{product,i,size});
   const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {copy:rect('.copy'),device:rect('#device'),screen:rect('#capture'),natural:[document.querySelector('#capture').naturalWidth,document.querySelector('#capture').naturalHeight],headline:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),description:parseFloat(getComputedStyle(document.querySelector('.description')).fontSize),cutouts:[...document.querySelectorAll('.ui-cutout')].map(el=>({box:el.getBoundingClientRect().toJSON(),source:el.dataset.source,rect:JSON.parse(el.dataset.rect)}))};});
   const key=platform+'-'+(i+1);
   if(r.device.width/size[0]<.78)errors.push(key+': device too small');
   if(product.frame&&Math.abs(r.device.width/r.device.height-product.frame.dimensions[0]/product.frame.dimensions[1])>.0001)errors.push(key+': distorted hardware');
   if(r.copy.bottom>r.device.top-size[0]*.015)errors.push(key+': copy overlaps hardware');
   if(r.headline/size[0]*390<32||r.description/size[0]*390<16)errors.push(key+': copy too small');
   for(const c of r.cutouts){if(c.box.top<r.device.top+size[0]*.07||c.box.bottom>size[1]||c.box.left<0||c.box.right>size[0])errors.push(key+': accidental component clipping or camera overlap');if(!product.screens.includes(c.source))errors.push(key+': component belongs to another platform');}
   if(r.cutouts.length)layered++;
   results.push({key,...r,headlineAt390:r.headline/size[0]*390,descriptionAt390:r.description/size[0]*390});
  }
  if(layered<Math.ceil(product.panels.length/2))errors.push(platform+': too few meaningful layered panels');
  const columns=product.panels.length===6?3:4,width=390,total=columns*width+40;
  const format=platform==='primary'?(p.preserve_store?'social':'store'):platform==='ipad'?'ipad-store':'play-store';
  const height=Math.ceil(size[1]/size[0]*width)+(product.panels.length===6?2:1)*50;
  await page.setViewportSize({width:total,height:product.panels.length===6?height*2+80:height+55});
  await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#eeeae1;font:18px -apple-system,sans-serif;padding:20px}.grid{display:grid;grid-template-columns:repeat('+columns+',390px);gap:0}img{display:block;width:390px;height:auto}h1{font-size:20px;margin:0 0 18px}</style><h1>'+p.name+' · layered studio direction · '+platform+'</h1><div class="grid">'+product.panels.map((_,i)=>'<img src="http://127.0.0.1:8766/docs/marketing/october-2026/exports/en-US/'+p.slug+'/'+format+'-'+(i+1)+'.png">').join('')+'</div>');await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  await page.screenshot({path:path.join(out,p.slug+'-studio-'+platform+'-preview.png')});
 }
 await fs.writeFile(path.join(out,p.slug+'-studio-validation.json'),JSON.stringify({passed:!errors.length,results,errors},null,2)+'\n');
 console.log(JSON.stringify({slug:p.slug,checked:results.length,errors}));if(errors.length)process.exitCode=1;
}
await browser.close();
