/** Check the actual composition geometry at export size and mobile reading scale. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'docs/marketing/october-2026');
const {chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('playwright');
const campaign=JSON.parse(await fs.readFile(path.join(out,'campaign.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();const results=[],errors=[];
for(const p of campaign.products){
 const cases=[['social',[1080,1350],p,4],['video',[1080,1920],p,3]];
 if(!p.preserve_store)cases.push(['store',p.device==='mac'?[2880,1800]:p.device==='web'?[2400,1500]:p.device==='landscape'?[2868,1320]:[1320,2868],p,p.panels.length]);
 if(p.ipad_store)cases.push(['ipad-store',p.ipad_store.dimensions,{...p,...p.ipad_store},p.ipad_store.panels.length]);
 if(p.play_store)cases.push(['play-store',p.play_store.dimensions,{...p,...p.play_store,frame:null},p.play_store.panels.length]);
 for(const [format,size,product,count] of cases)for(let i=0;i<count;i++){
  // The layered store pilot permits intentional crop and overlap; validate it separately.
  if(p.store_pilot&&['store','ipad-store'].includes(format))continue;
  await page.setViewportSize({width:size[0],height:size[1]});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/art.html');
  await page.evaluate(async({product,i,format,size})=>await window.renderArtwork(product,i,['ipad-store','play-store'].includes(format)?'store':format,size),{product,i,format,size});
  const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();const focus=document.querySelector('.focus');return {copy:rect('.copy'),wrap:rect('.capture-wrap'),device:rect('#device'),focus:focus.hidden?null:rect('.focus'),headline:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),description:parseFloat(getComputedStyle(document.querySelector('.description')).fontSize)};});
  const key=`${p.slug}/${format}-${i+1}`;if(r.copy.bottom>r.wrap.top-3)errors.push(key+': copy overlaps product area');
  for(const [name,box] of [['device',r.device],['detail',r.focus]])if(box&&(box.top<r.wrap.top-2||box.bottom>r.wrap.bottom+2||box.left<r.wrap.left-2||box.right>r.wrap.right+2))errors.push(key+': '+name+' overflows product area');
  if(r.focus&&r.focus.left<r.device.right-2&&r.focus.right>r.device.left+2&&r.focus.top<r.device.bottom&&r.focus.bottom>r.device.top)errors.push(key+': detail obstructs hardware');
  if(r.headline/size[0]*390<31||r.description/size[0]*390<16)errors.push(key+': copy too small at 390px');
  results.push({key,...r,headlineAt390:r.headline/size[0]*390,descriptionAt390:r.description/size[0]*390});
 }
}
await browser.close();await fs.writeFile(path.join(out,'art-geometry-validation.json'),JSON.stringify({passed:!errors.length,checked:results.length,errors,results},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,errors},null,2));if(errors.length)process.exitCode=1;
