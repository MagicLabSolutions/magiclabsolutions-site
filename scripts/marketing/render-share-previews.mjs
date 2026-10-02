/** Prepare English link previews without publishing paused product-page changes. */
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'docs/marketing/october-2026'),require=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'));
const {chromium}=require('playwright'),sharp=require('sharp'),campaign=JSON.parse(await fs.readFile(path.join(out,'campaign.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1200,height:630}}),records={};
for(const p of campaign.products){
 await page.goto('http://127.0.0.1:8766/docs/marketing/october-2026/share-art.html');
 const metrics=await page.evaluate(p=>window.renderShare(p),p);
 if(metrics.copy.right>700||metrics.copy.bottom>560||metrics.title.height>280)throw Error(p.slug+': share copy does not fit');
 const output=path.join(out,'exports/en-US',p.slug,'share-preview.jpg');
 await sharp(await page.screenshot()).jpeg({quality:94,mozjpeg:true}).toFile(output);
 records[p.slug]={image:'exports/en-US/'+p.slug+'/share-preview.jpg',width:1200,height:630,alt:p.name+' — '+p.share_preview.headline.replaceAll('\n',' '),locale:'en-US',publication:'Prepared, website content changes paused',metrics};
 console.log('Prepared link preview:',p.slug);
}
await browser.close();await fs.writeFile(path.join(out,'share-preview-proposal.json'),JSON.stringify(records,null,2)+'\n');
