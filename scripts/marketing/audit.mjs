/** Inspect rendered pages and real capture controls at desktop and mobile sizes. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({reducedMotion:'reduce'});
const base=process.env.MAGICLAB_SITE_URL||'http://127.0.0.1:8767';
const products=JSON.parse(await fs.readFile(path.join(root,'docs/marketing/october-2026/campaign.json'),'utf8')).products;
const catalog=JSON.parse(await fs.readFile(path.join(root,'_data/portfolio.json'),'utf8'));
const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,390])for(const route of ['/',...catalog.map(p=>'/apps/'+p.slug+'/'),'/pt-BR/apps/giftly/','/contact/','/privacy-policy/']){
 await page.setViewportSize({width,height:1000});await page.goto(base+route);await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading="eager"));await page.waitForLoadState("networkidle");
 const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,body:getComputedStyle(document.body).fontSize,small:[...document.querySelectorAll('p,a,button,label,figcaption,span,li,small,summary,input')].filter(e=>e.textContent.trim()&&!e.closest('[aria-hidden="true"]')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&parseFloat(getComputedStyle(e).fontSize)<14).map(e=>({text:e.textContent.trim().slice(0,65),class:e.className,font:getComputedStyle(e).fontSize})),images:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&!i.naturalWidth).map(i=>i.src),videos:[...document.querySelectorAll('video')].map(v=>({autoplay:v.autoplay,tracks:v.querySelectorAll('track').length})),tour:!!document.querySelector('[data-capture-tour]')}));
 if(metrics.overflow)errors.push(route+' '+width+': horizontal page overflow');
 if(metrics.images.length)errors.push(route+': broken images '+metrics.images.join(','));
 if(metrics.videos.some(v=>v.autoplay||!v.tracks))errors.push(route+': uncontrolled or uncaptioned video');
 if(metrics.tour){
   const buttons=page.locator('[data-tour-image]');if(await buttons.count()>1){await buttons.nth(1).click();if(await buttons.nth(1).getAttribute('aria-pressed')!=='true')errors.push(route+': tour selection failed');const image=await page.locator('[data-capture-tour] img').getAttribute('src');if(image!==await buttons.nth(1).getAttribute('data-tour-image'))errors.push(route+': wrong capture shown');}
   const zoom=page.locator('[data-capture-tour] [data-p-image]');await zoom.focus();await page.keyboard.press('Enter');if(!await page.locator('.p-lightbox').evaluate(d=>d.open))errors.push(route+': keyboard image enlargement failed');await page.keyboard.press('Escape');if(await page.locator('.p-lightbox').evaluate(d=>d.open))errors.push(route+': lightbox Escape failed');
 }
 results.push({route,width,...metrics});
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/index.html');
for(const p of products){await page.locator('button[data-slug="'+p.slug+'"]').click();if(await page.locator('video').count()!==2)errors.push(p.slug+': review videos missing');}
await page.goto(base+'/apps/giftly/');await page.evaluate(()=>document.activeElement?.blur());await page.locator('.p-campaign').screenshot({path:path.join(root,'docs/marketing/october-2026/site-mobile-giftly.png')});
await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/apps/groundcontrol/');await page.evaluate(()=>document.activeElement?.blur());await page.locator('.p-campaign').screenshot({path:path.join(root,'docs/marketing/october-2026/site-desktop-groundcontrol.png')});
await browser.close();await fs.writeFile(path.join(root,'docs/marketing/october-2026/site-audit.json'),JSON.stringify({results,errors},null,2)+'\n');
console.log(JSON.stringify({pages:results.length,errors,smallText:results.filter(x=>x.small.length).map(x=>({route:x.route,width:x.width,small:x.small}))},null,2));if(errors.length)process.exitCode=1;
