/** Confirm the owner-requested video pause on every campaign product page. */
import fs from 'node:fs/promises';import {createRequire}from'node:module';import assert from'node:assert/strict';
const {chromium}=createRequire(process.env.MAGICLAB_NODE_MODULES+'/package.json')('playwright');
const products=JSON.parse(await fs.readFile('docs/marketing/october-2026/campaign.json','utf8')).products;
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:900}}),results=[];
try{for(const p of products){await page.goto((process.env.MAGICLAB_SITE_URL||'http://127.0.0.1:8772')+'/apps/'+p.slug+'/');const visible=await page.locator('video').evaluateAll(videos=>videos.filter(v=>v.getClientRects().length&&getComputedStyle(v).visibility!=='hidden').length);assert.equal(visible,0,p.slug+' must not show a product video');results.push({slug:p.slug,visibleVideos:visible});}await fs.writeFile('docs/marketing/october-2026/product-video-policy-validation.json',JSON.stringify({passed:true,results},null,2)+'\n');console.log('PASS: all '+results.length+' campaign product pages omit public video sections.');}finally{await browser.close()}
