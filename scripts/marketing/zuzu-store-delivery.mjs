/** Scoped zuzu 2.8.0 delivery audit, keyword localization and final read-back. */
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),audit=path.join(root,'docs/marketing/october-2026/app-store-connect/zuzu-2.8.0');
const {api:rawApi,useAccount}=await import(path.join(root,'../Skills/app-store-products/scripts/asc.mjs'));useAccount('MagicLabSolutions');
const save=async(name,data)=>{await fs.mkdir(audit,{recursive:true});await fs.writeFile(path.join(audit,name),JSON.stringify(data,null,2)+'\n');},read=async name=>JSON.parse(await fs.readFile(path.join(audit,name),'utf8'));
let cooldown,rateLimitedSince;
async function api(...args){for(;;){if(cooldown)await cooldown;try{const value=await rawApi(...args);rateLimitedSince=null;return value;}catch(e){if(e.status!==429)throw e;rateLimitedSince??=Date.now();if(Date.now()-rateLimitedSince>90*60*1000)throw Error('Apple rate limit persisted for 90 minutes; progress is preserved.');if(!cooldown){console.log('Apple rate limit: waiting 60 seconds; audit progress preserved.');cooldown=new Promise(r=>setTimeout(r,60000)).finally(()=>{cooldown=null;});}await cooldown;}}}
async function all(url){const rows=[];do{const p=await api(url);rows.push(...p.data);url=p.links?.next?new URL(p.links.next).pathname+new URL(p.links.next).search:null;}while(url);return rows;}
async function mapLimit(rows,fn){const result=[];let i=0;await Promise.all(Array.from({length:Math.min(3,rows.length)},async()=>{while(i<rows.length){const j=i++;result[j]=await fn(rows[j]);}}));return result;}
async function snapshot(v){
 const build=(await api(`/v1/appStoreVersions/${v.id}/build`)).data;
 const locs=await all(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations?limit=200`);
 const localizations=await mapLimit(locs,async loc=>{
  const shots=await api(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?include=appScreenshots&limit=200&limit[appScreenshots]=10`);
  const previews=await api(`/v1/appStoreVersionLocalizations/${loc.id}/appPreviewSets?include=appPreviews&limit=200&limit[appPreviews]=3`);
  const get=(response,type,id)=>{const item=response.included?.find(x=>x.type===type&&x.id===id);assert(item,`Missing included ${type}`);return item;};
  return {id:loc.id,attributes:loc.attributes,sets:shots.data.map(s=>{assert.equal(s.relationships.appScreenshots.meta.paging.total,s.relationships.appScreenshots.data.length);return {id:s.id,type:s.attributes.screenshotDisplayType,screenshots:s.relationships.appScreenshots.data.map(ref=>{const x=get(shots,ref.type,ref.id);return {id:x.id,fileName:x.attributes.fileName,md5:x.attributes.sourceFileChecksum,state:x.attributes.assetDeliveryState?.state,width:x.attributes.imageAsset?.width,height:x.attributes.imageAsset?.height};})};}),previewSets:previews.data.map(s=>({id:s.id,type:s.attributes.previewType,previews:s.relationships.appPreviews.data.map(ref=>{const x=get(previews,ref.type,ref.id);return {id:x.id,md5:x.attributes.sourceFileChecksum,state:x.attributes.assetDeliveryState?.state};})}))};
 });return {id:v.id,attributes:v.attributes,build:build?{id:build.id,attributes:build.attributes}:null,localizations};
}
const versions=await all('/v1/apps/6757988505/appStoreVersions?filter[platform]=IOS&limit=200');
const draft=versions.find(v=>v.attributes.versionString==='2.8.0'),published=versions.find(v=>(v.attributes.appVersionState??v.attributes.appStoreState)==='READY_FOR_DISTRIBUTION');
assert(draft&&published);assert.equal(draft.attributes.appVersionState??draft.attributes.appStoreState,'PREPARE_FOR_SUBMISSION');
if(process.argv.includes('--before')){
 try{await fs.access(path.join(audit,'before.json'));throw Error('Baseline already exists; do not overwrite');}catch(e){if(e.code!=='ENOENT')throw e;}
 const data={checkedAt:new Date().toISOString(),draft:await snapshot(draft),published:await snapshot(published)};
 const ids=new Set(data.published.localizations.flatMap(l=>l.sets.map(s=>s.id)));assert(data.draft.localizations.every(l=>l.sets.every(s=>!ids.has(s.id))));
 await save('before.json',data);console.log('Independent draft galleries and published baseline saved');
}else if(process.argv.includes('--keyword-plan')){
 const plan=await read('plan.json'),candidates=Object.fromEntries((await fs.readFile(path.join(audit,'keyword-candidates.tsv'),'utf8')).trim().split('\n').map(l=>l.split('|'))),locales=[];
 for(const task of plan.tasks){if(locales.some(l=>l.locale===task.locale))continue;const candidate=candidates[task.sourceLocale];assert(candidate,`No localized keywords for ${task.sourceLocale}`);
  const terms=[];for(const term of candidate.split(',')){if([...([...terms,term].join(','))].length<=100)terms.push(term);}
  const keywords=terms.join(',');assert(keywords.length>2&&keywords===keywords.trim()&&!keywords.includes(', '));
  locales.push({locale:task.locale,sourceLocale:task.sourceLocale,keywords,bytes:Buffer.byteLength(keywords,'utf8'),characters:[...keywords].length,omittedTerms:candidate.split(',').filter(t=>!terms.includes(t))});
 }
 const planned=(await fs.readFile(path.join(root,'docs/marketing/october-2026/metadata/en-US/zuzu/keywords.txt'),'utf8')).trim();assert.equal(locales.find(l=>l.locale==='en-US').keywords,planned);
 await save('keyword-plan.json',{createdAt:new Date().toISOString(),baseKeywords:planned,method:'Native-market wording of campaign intent; prioritized whole terms within 100 characters; English AU/GB nappy variant',reference:'https://developer.apple.com/app-store/product-page/',unicodeNote:'Existing valid ASC fields exceed 100 UTF-8 bytes (Hindi 178, Japanese 110); use the product-page character guidance and verify every PATCH read-back.',locales});console.log(`${locales.length} localized keyword fields planned`);
}else if(process.argv.includes('--keywords')){
 const plan=await read('keyword-plan.json'),locs=await all(`/v1/appStoreVersions/${draft.id}/appStoreVersionLocalizations?limit=200`),records=[];
 for(const entry of plan.locales){const loc=locs.find(l=>l.attributes.locale===entry.locale);assert(loc,`Missing ${entry.locale}`);
  if(loc.attributes.keywords!==entry.keywords)await api(`/v1/appStoreVersionLocalizations/${loc.id}`,'PATCH',{data:{type:'appStoreVersionLocalizations',id:loc.id,attributes:{keywords:entry.keywords}}});
  const verified=(await api(`/v1/appStoreVersionLocalizations/${loc.id}`)).data;assert.equal(verified.attributes.keywords,entry.keywords);records.push({...entry,id:loc.id,before:loc.attributes.keywords,after:verified.attributes.keywords});
  await save('keywords-progress.json',{checkedAt:new Date().toISOString(),versionId:draft.id,records});
  console.log(`KEYWORDS ${entry.locale} verified (${records.length}/${plan.locales.length})`);
 }
 await save('keywords-verification.json',{checkedAt:new Date().toISOString(),versionId:draft.id,records});console.log(`${records.length} localized keyword fields verified`);
}else if(process.argv.includes('--verify')){
 const before=await read('before.json'),plan=await read('plan-applied.json'),kw=await read('keywords-verification.json');assert(plan.tasks.every(t=>t.slug==='zuzu'&&t.platform==='IOS'&&t.version==='2.8.0'));
 const after={checkedAt:new Date().toISOString(),draft:await snapshot(draft),published:await snapshot(published)};assert.deepEqual(after.published,before.published,'Published version changed');assert.deepEqual(after.draft.build,before.draft.build,'Attached build changed');assert.equal(after.draft.attributes.releaseType,before.draft.attributes.releaseType);
 for(const old of before.draft.localizations){const current=after.draft.localizations.find(l=>l.id===old.id);assert(current);const keywords=kw.records.find(k=>k.locale===old.attributes.locale)?.after;assert(keywords);assert.deepEqual(current.attributes,{...old.attributes,keywords},'Other localized metadata changed');assert.deepEqual(current.previewSets,old.previewSets,'Previews changed');assert.deepEqual(current.sets.filter(s=>s.type.startsWith('APP_WATCH')),old.sets.filter(s=>s.type.startsWith('APP_WATCH')),'Watch screenshots changed');}
 const galleries=plan.tasks.map(t=>{const loc=after.draft.localizations.find(l=>l.attributes.locale===t.locale);assert(loc);assert.equal(loc.attributes.keywords,kw.records.find(k=>k.locale===t.locale)?.after);const set=loc.sets.find(s=>s.type===t.type);assert(set);assert.equal(set.screenshots.length,6);assert.equal(t.files.length,6);set.screenshots.forEach((s,i)=>{assert.equal(s.state,'COMPLETE');assert.equal(s.md5,t.files[i].md5);assert.equal(s.width,t.files[i].width);assert.equal(s.height,t.files[i].height);});return {locale:t.locale,sourceLocale:t.sourceLocale,type:t.type,setId:set.id,screenshots:set.screenshots};});
 const missing=after.draft.localizations.flatMap(l=>{const fields=['description','supportUrl','whatsNew'].filter(f=>!l.attributes[f]);return fields.length?[{locale:l.attributes.locale,fields}]:[];});
 await save('after.json',after);await save('delivered-galleries.json',{checkedAt:after.checkedAt,appId:'6757988505',version:'2.8.0',versionId:draft.id,galleries});await save('delivery-status.json',{checkedAt:after.checkedAt,app:'zuzu',version:'2.8.0',versionId:draft.id,state:draft.attributes.appVersionState??draft.attributes.appStoreState,galleries:galleries.length,images:galleries.reduce((n,g)=>n+g.screenshots.length,0),locales:kw.records.length,allStates:'COMPLETE',publishedBuildReleasePreviewsAndWatchPreserved:true,missingListingFields:missing,submittedForReview:false});console.log(JSON.stringify({verified:true,galleries:galleries.length,images:galleries.reduce((n,g)=>n+g.screenshots.length,0),keywords:kw.records.length,missingListingLocales:missing.length}));
}else throw Error('Use --before, --keyword-plan, --keywords or --verify');
