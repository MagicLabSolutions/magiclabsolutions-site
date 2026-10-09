/** Upload approved localized PNG masters only. --plan is read-only; --apply is resumable.
 * Requires the existing ASC transport's account environment. Never logs upload URLs/tokens.
 * Retained TumTum/Soooon sets and app previews are outside this tool's scope.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const transport=process.env.ASC_TRANSPORT || path.resolve(root,'../Skills/app-store-products/scripts/asc.mjs');
const {api:rawApi,useAccount}=await import(transport);useAccount('MagicLabSolutions');
let cooldown=null,rateLimitedSince=null;
async function api(...args) {
 let readFailures=0;
 for(;;) {
  if(cooldown)await cooldown;
  try{const result=await rawApi(...args);rateLimitedSince=null;return result;}catch(error){
   if(!error.status&&(args[1]||'GET')==='GET'&&readFailures++<3){await new Promise(resolve=>setTimeout(resolve,1500*readFailures));continue;}
   if(error.status!==429)throw error;
   rateLimitedSince??=Date.now();
   if(Date.now()-rateLimitedSince>90*60*1000)throw new Error('Apple rate limit persisted for 90 minutes; checkpoints are preserved for a later scoped retry.');
   // A 429 explicitly rejects the operation: unlike an unknown POST timeout,
   // retrying this response cannot duplicate a created resource.
   if(!cooldown){console.log('RATE_LIMIT Apple rejected the request; waiting 60 seconds before retrying.');cooldown=new Promise(resolve=>setTimeout(resolve,60000)).finally(()=>{cooldown=null;});}
   await cooldown;
  }
 }
}
async function all(url) {
 const rows=[];
 do{const page=await api(url);rows.push(...page.data);url=page.links?.next?new URL(page.links.next).pathname+new URL(page.links.next).search:null;}while(url);
 return rows;
}
const sharp=createRequire(process.env.ASC_IMAGE_RUNTIME || path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'))('sharp');
const inventoryAudit=path.join(root,'docs/marketing/october-2026/app-store-connect');
const auditOption=process.argv.find(a=>a.startsWith('--audit-dir='))?.slice(12);
const audit=auditOption?path.resolve(root,auditOption):inventoryAudit;
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=async(p,v)=>{await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,JSON.stringify(v,null,2)+'\n');};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const editable=new Set(['PREPARE_FOR_SUBMISSION','INVALID_BINARY','REJECTED','METADATA_REJECTED','DEVELOPER_REJECTED']);
const state=v=>v.attributes.appVersionState??v.attributes.appStoreState;
const argv=process.argv.slice(2),apply=argv.includes('--apply');
const resumeVerified=argv.includes('--resume-verified');
const selected=argv.find(a=>a.startsWith('--apps='))?.slice(7).split(',');
const targetVersion=argv.find(a=>a.startsWith('--version='))?.slice(10);
if(targetVersion&&selected?.length!==1)throw new Error('--version requires exactly one app in --apps');
const localeFilter=argv.find(a=>a.startsWith('--locales='))?.slice(10).split(',');
const platformFilter=argv.find(a=>a.startsWith('--platforms='))?.slice(12).split(',');
if(platformFilter?.some(p=>!['IOS','MAC_OS'].includes(p)))throw new Error('--platforms accepts IOS and/or MAC_OS');
const limit=Number(argv.find(a=>a.startsWith('--concurrency='))?.slice(14)||3);
const locales={ 'ar-SA':['ar'],'bn-BD':['bn'],ca:['ca'],'zh-Hans':['zh-Hans'],'zh-Hant':['zh-Hant','zh-HK'],hr:['hr'],cs:['cs'],da:['da'],'nl-NL':['nl'],'en-AU':['en-AU','en-US'],'en-CA':['en-US'],'en-GB':['en-GB','en-US'],'en-US':['en-US'],fi:['fi'],'fr-FR':['fr'],'fr-CA':['fr-CA','fr'],'de-DE':['de'],el:['el'],'gu-IN':['gu'],he:['he'],hi:['hi'],hu:['hu'],id:['id'],it:['it'],ja:['ja'],'kn-IN':['kn'],ko:['ko'],ms:['ms'],'ml-IN':['ml'],'mr-IN':['mr'],no:['nb'],'or-IN':['or'],pl:['pl'],'pt-BR':['pt-BR'],'pt-PT':['pt-PT'],'pa-IN':['pa'],ro:['ro'],ru:['ru'],sk:['sk'],'sl-SI':['sl','sl-SI'],'es-MX':['es-419','es'],'es-ES':['es'],sv:['sv'],'ta-IN':['ta'],'te-IN':['te'],th:['th'],tr:['tr'],uk:['uk'],'ur-PK':['ur'],vi:['vi']};
const specs={APP_IPHONE_67:{prefix:'store',size:[1320,2868]},APP_IPAD_PRO_3GEN_129:{prefix:'ipad-store',size:[2064,2752]},APP_DESKTOP:{prefix:'store',size:[2880,1800]}};
const configurations={groundcontrol:['MAC_OS'],sundust:['IOS'],brainfold:['IOS'],memories:['IOS'],myrenewals:['IOS'],toctoc:['IOS','MAC_OS'],giftly:['IOS','MAC_OS'],zuzu:['IOS'],poof:['MAC_OS']};
const inventory=await read(path.join(inventoryAudit,'inventory-before.json'));
const languages=await read(path.join(root,'docs/marketing/october-2026/localized/languages.json'));
const tasks=[],versions=[],excluded=[];
for(const [slug,platforms] of Object.entries(configurations)) {
 if(selected&&!selected.includes(slug))continue;
 const record=inventory.records.find(r=>r.slug===slug);
 for(const platform of platforms) {
  if(platformFilter&&!platformFilter.includes(platform))continue;
  const liveVersions=await all(`/v1/apps/${record.appId}/appStoreVersions?filter[platform]=${platform}&limit=200`);
  const current=targetVersion?liveVersions.find(v=>v.attributes.versionString===targetVersion):liveVersions[0];
  if(!current)throw new Error(`${slug} missing ${platform} version ${targetVersion||''}`);
  if(targetVersion&&!editable.has(state(current)))throw new Error(`${slug} ${targetVersion} is not editable (${state(current)})`);
  let version=current,create=null;
  if(state(current)==='READY_FOR_DISTRIBUTION') {const parts=current.attributes.versionString.split('.').map(Number);parts[parts.length-1]++;create=parts.join('.');}
  else if(!editable.has(state(current))) {excluded.push({slug,platform,version:current.attributes.versionString,state:state(current),reason:'Review withdrawal requires separate authorization'});continue;}
  const types=platform==='MAC_OS'?['APP_DESKTOP']:slug==='toctoc'?['APP_IPHONE_67']:['APP_IPHONE_67','APP_IPAD_PRO_3GEN_129'];
  const versionPlan={slug,appId:record.appId,platform,currentId:current.id,version:create||current.attributes.versionString,create,state:state(current)};versions.push(versionPlan);
  for(const [locale,candidates] of Object.entries(locales)) {
   if(localeFilter&&!localeFilter.includes(locale))continue;
   // GroundControl is English-only; regional English reuse is for translated portfolios.
   if(slug==='groundcontrol'&&locale!=='en-US')continue;
   const source=[locale,...candidates].find(l=>languages[slug].locales.includes(l));if(!source)continue;
   const giftlyMac=slug==='giftly'&&platform==='MAC_OS';
   const folder=giftlyMac?path.join(root,'docs/marketing/october-2026/giftly-macos/exports',source):path.join(root,'docs/marketing/october-2026/localized/exports',source,slug);
   for(const type of types) {
    const spec=specs[type],prefix=giftlyMac?'mac-store':slug==='toctoc'&&type==='APP_IPHONE_67'?'iphone-store':spec.prefix;
    const names=(await fs.readdir(folder)).filter(n=>new RegExp(`^${prefix}-(\\d+)\\.png$`).test(n)).sort((a,b)=>Number(a.match(/(\d+)\.png$/)[1])-Number(b.match(/(\d+)\.png$/)[1]));
    if(!names.length||names.length>10)throw new Error(`${slug} ${source} ${type}: invalid count`);
    const files=[];
    for(const name of names){const file=path.join(folder,name),bytes=await fs.readFile(file),meta=await sharp(bytes).metadata();
     if(meta.width!==spec.size[0]||meta.height!==spec.size[1]||meta.hasAlpha||meta.format!=='png')throw new Error(`${file}: invalid store master`);
     const md5=createHash('md5').update(bytes).digest('hex');files.push({file:path.relative(root,file),fileName:`ml-20261002-${type.toLowerCase()}-${files.length+1}-${md5.slice(0,10)}.png`,md5,size:bytes.length,width:meta.width,height:meta.height});
    }
    tasks.push({slug,appId:record.appId,platform,version:versionPlan.version,locale,sourceLocale:source,type,files});
   }
  }
 }
}
const plan={createdAt:new Date().toISOString(),versions,excluded,tasks,retained:['tumtum','soooon'],noAppleRecord:['hooray']};
await save(path.join(audit,apply?'plan-applied.json':'plan.json'),plan);
console.log(JSON.stringify({mode:apply?'apply':'plan',versions,excluded,sets:tasks.length,images:tasks.reduce((n,t)=>n+t.files.length,0)}));
if(!apply)process.exit(0);
const active=new Map();
for(const v of versions) {
 let current=(await api(`/v1/appStoreVersions/${v.currentId}`)).data;
 if(v.create) {
  const existing=(await all(`/v1/apps/${v.appId}/appStoreVersions?filter[platform]=${v.platform}&limit=200`)).find(x=>x.attributes.versionString===v.version);
  if(existing)current=existing;else current=(await api('/v1/appStoreVersions','POST',{data:{type:'appStoreVersions',attributes:{versionString:v.version,platform:v.platform,releaseType:'MANUAL'},relationships:{app:{data:{type:'apps',id:v.appId}}}}})).data;
 }
 if(!editable.has(state(current)))throw new Error(`${v.slug}: version no longer editable`);
 const key=`${v.slug}:${v.platform}`,locs=await all(`/v1/appStoreVersions/${current.id}/appStoreVersionLocalizations?limit=200`);
 const entry={id:current.id,locales:new Map(locs.map(l=>[l.attributes.locale,l.id]))};active.set(key,entry);
 for(const locale of new Set(tasks.filter(t=>`${t.slug}:${t.platform}`===key).map(t=>t.locale))) {
  if(!entry.locales.has(locale)) {const created=(await api('/v1/appStoreVersionLocalizations','POST',{data:{type:'appStoreVersionLocalizations',attributes:{locale},relationships:{appStoreVersion:{data:{type:'appStoreVersions',id:entry.id}}}}})).data;entry.locales.set(locale,created.id);}
 }
 console.log(`${v.slug} ${v.platform} ${v.version}: editable, ${entry.locales.size} localizations`);
}
async function backup(set,shots,task) {
 const dir=path.join(audit,'work/backups',task.slug,task.platform,task.version,task.locale,set.attributes.screenshotDisplayType);
 const marker=path.join(dir,'original.json');try{await fs.access(marker);return;}catch{}
 const sanitized=shots.map(s=>({id:s.id,attributes:Object.fromEntries(Object.entries(s.attributes).filter(([k])=>!['uploadOperations','assetToken'].includes(k)))}));
 for(const shot of shots) {
  if(shot.attributes.assetDeliveryState?.state!=='COMPLETE')continue;
  const image=shot.attributes.imageAsset;if(!image?.templateUrl)throw new Error('Cannot back up screenshot without imageAsset');
  const url=image.templateUrl.replace('{w}',image.width).replace('{h}',image.height).replace('{f}','png');
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error(`Backup download HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer()),meta=await sharp(bytes).metadata();if(meta.width!==image.width||meta.height!==image.height)throw new Error('Backup dimensions mismatch');
  const file=path.join(dir,`${shot.id}.png`);await fs.mkdir(dir,{recursive:true});await fs.writeFile(file,bytes);
 }
 await save(marker,{savedAt:new Date().toISOString(),setId:set.id,shots:sanitized});
}
async function upload(set,file) {
 const bytes=await fs.readFile(path.join(root,file.file));if(createHash('md5').update(bytes).digest('hex')!==file.md5)throw new Error('Master changed after plan');
 const reserved=(await api('/v1/appScreenshots','POST',{data:{type:'appScreenshots',attributes:{fileName:file.fileName,fileSize:bytes.length},relationships:{appScreenshotSet:{data:{type:'appScreenshotSets',id:set.id}}}}})).data;
 for(const op of reserved.attributes.uploadOperations){const headers=Object.fromEntries((op.requestHeaders||[]).map(h=>[h.name,h.value]));let ok=false;
  for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(op.url,{method:op.method,headers,body:bytes.subarray(op.offset,op.offset+op.length),signal:AbortSignal.timeout(90000)});if(response.ok){ok=true;break;}}catch{}await pause(1000*(attempt+1));}if(!ok)throw new Error('Screenshot byte upload failed');}
 await api(`/v1/appScreenshots/${reserved.id}`,'PATCH',{data:{type:'appScreenshots',id:reserved.id,attributes:{uploaded:true,sourceFileChecksum:file.md5}}});
 return reserved.id;
}
const results=[];let failures=0;
const localeSetReads=new Map();
async function removeScreenshot(id) {
 try{await api(`/v1/appScreenshots/${id}`,'DELETE');}catch(error){if(error.status!==404)throw error;}
}
async function sync(task) {
 const entry=active.get(`${task.slug}:${task.platform}`),locId=entry.locales.get(task.locale);
 if(resumeVerified) {
  let checkpoint=null;try{checkpoint=await read(path.join(audit,'work/results',`${task.slug}-${task.platform}-${task.locale}-${task.type}.json`));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(checkpoint?.versionId===entry.id&&checkpoint.sourceLocale===task.sourceLocale&&checkpoint.screenshots.length===task.files.length&&checkpoint.screenshots.every((s,i)=>s.md5===task.files[i].md5&&s.state==='COMPLETE')){
   console.log(`CACHED ${task.slug} ${task.platform} ${task.locale} ${task.type} ${task.files.length} verified at ${checkpoint.verifiedAt}`);return checkpoint;
  }
 }
 const current=(await api(`/v1/appStoreVersions/${entry.id}`)).data;if(!editable.has(state(current)))throw new Error('Version changed state');
 if(!localeSetReads.has(locId))localeSetReads.set(locId,all(`/v1/appStoreVersionLocalizations/${locId}/appScreenshotSets?limit=200`));
 const sets=await localeSetReads.get(locId);let set=sets.find(s=>s.attributes.screenshotDisplayType===task.type),created=false;
 if(!set){set=(await api('/v1/appScreenshotSets','POST',{data:{type:'appScreenshotSets',attributes:{screenshotDisplayType:task.type},relationships:{appStoreVersionLocalization:{data:{type:'appStoreVersionLocalizations',id:locId}}}}})).data;created=true;sets.push(set);}
 let shots=created?[]:await all(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`);
 const kept=new Set(),order=task.files.map(f=>{const s=shots.find(s=>!kept.has(s.id)&&s.attributes.fileName===f.fileName&&s.attributes.sourceFileChecksum===f.md5&&s.attributes.assetDeliveryState?.state==='COMPLETE');if(s)kept.add(s.id);return s?.id||null;});
 const extra=shots.filter(s=>!kept.has(s.id));
 if(extra.length){await backup(set,shots,task);for(const s of extra)await removeScreenshot(s.id);}
 const missing=task.files.map((f,i)=>({f,i})).filter(({i})=>!order[i]);let uploadCursor=0;
 await Promise.all(Array.from({length:Math.min(3,missing.length)},async()=>{while(uploadCursor<missing.length){const {f,i}=missing[uploadCursor++];order[i]=await upload(set,f);}}));
 // Process the gallery as a batch: avoid busy polling each image while others wait.
 if(missing.length) {
  await pause(8000);let complete=false;
  for(let i=0;i<60;i++) {
   const processing=await all(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`);
   const failed=processing.find(s=>s.attributes.assetDeliveryState?.state==='FAILED');
   if(failed)throw new Error(`Processing failed: ${JSON.stringify(failed.attributes.assetDeliveryState.errors)}`);
   if(order.every(id=>processing.some(s=>s.id===id&&s.attributes.assetDeliveryState?.state==='COMPLETE'))){complete=true;break;}
   await pause(5000);
  }
  if(!complete)throw new Error('Screenshot processing timeout; rerun to resume');
 }
 if(shots.map(s=>s.id).join()!==order.join())await api(`/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`,'PATCH',{data:order.map(id=>({type:'appScreenshots',id}))});
 // Apple can acknowledge ordering before its read endpoint reflects the update.
 const matches=rows=>rows.length===task.files.length&&rows.every((s,i)=>s.id===order[i]&&s.attributes.sourceFileChecksum===task.files[i].md5&&s.attributes.assetDeliveryState?.state==='COMPLETE');
 let verified=await all(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`);
 for(let attempt=0;!matches(verified)&&attempt<3;attempt++){await pause(3000);verified=await all(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`);}
 if(!matches(verified))throw new Error('Read-back mismatch');
 // Remove stale lower-resolution custom galleries so Apple's largest-device fallback is used.
 const family=task.type.startsWith('APP_IPHONE')?'APP_IPHONE_':task.type.startsWith('APP_IPAD')?'APP_IPAD_':null;
 if(family)for(const old of sets.filter(s=>s.id!==set.id&&s.attributes.screenshotDisplayType.startsWith(family))){const oldShots=await all(`/v1/appScreenshotSets/${old.id}/appScreenshots?limit=200`);if(oldShots.length){await backup(old,oldShots,task);for(const s of oldShots)await removeScreenshot(s.id);}}
 const result={slug:task.slug,platform:task.platform,version:task.version,versionId:entry.id,locale:task.locale,sourceLocale:task.sourceLocale,type:task.type,setId:set.id,verifiedAt:new Date().toISOString(),screenshots:verified.map((s,i)=>({id:s.id,file:task.files[i].file,md5:s.attributes.sourceFileChecksum,state:s.attributes.assetDeliveryState.state}))};
 await save(path.join(audit,'work/results',`${task.slug}-${task.platform}-${task.locale}-${task.type}.json`),result);
 await fs.rm(path.join(audit,'work/errors',`${task.slug}-${task.platform}-${task.locale}-${task.type}.json`),{force:true});
 console.log(`VERIFIED ${task.slug} ${task.platform} ${task.locale} ${task.type} ${verified.length}`);return result;
}
let cursor=0;
await Promise.all(Array.from({length:limit},async()=>{while(cursor<tasks.length&&failures<6){const task=tasks[cursor++];try{results.push(await sync(task));}catch(e){failures++;const message=e.message.replace(/https?:\/\/\S+/g,'[URL omitted]');console.log(`ERROR ${task.slug} ${task.platform} ${task.locale} ${task.type}: ${message}`);const failure={slug:task.slug,platform:task.platform,locale:task.locale,type:task.type,error:message};results.push(failure);await save(path.join(audit,'work/errors',`${task.slug}-${task.platform}-${task.locale}-${task.type}.json`),{...failure,time:new Date().toISOString()});}}}));
await save(path.join(audit,`run-${Date.now()}.json`),{finishedAt:new Date().toISOString(),versions,excluded,results,unprocessed:tasks.length-cursor});
console.log(`Finished: ${results.filter(r=>!r.error).length} verified sets, ${failures} failures, ${tasks.length-cursor} unprocessed`);if(failures)process.exitCode=1;
