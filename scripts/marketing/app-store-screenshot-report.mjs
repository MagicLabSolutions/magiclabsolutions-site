/** Summarize verified upload checkpoints and the current draft/review states. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const audit=path.join(root,'docs/marketing/october-2026/app-store-connect');
const {all,useAccount}=await import(process.env.ASC_TRANSPORT||path.resolve(root,'../Skills/app-store-products/scripts/asc.mjs'));useAccount('MagicLabSolutions');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const plan=await read(path.join(audit,'plan.json')),inventory=await read(path.join(audit,'inventory-before.json'));
const dir=path.join(audit,'work/results'),verified=await Promise.all((await fs.readdir(dir)).filter(f=>f.endsWith('.json')).map(f=>read(path.join(dir,f))));
const entries=[];
for(const app of inventory.records.filter(r=>r.appId&&!r.retainCurrentDesign)){
 const platforms=app.slug==='toctoc'?['IOS','MAC_OS']:['groundcontrol','poof'].includes(app.slug)?['MAC_OS']:['IOS'];
 for(const platform of platforms){
  const v=(await all(`/v1/apps/${app.appId}/appStoreVersions?filter[platform]=${platform}&limit=200`))[0];
  const expected=plan.tasks.filter(t=>t.slug===app.slug&&t.platform===platform),done=verified.filter(t=>t.slug===app.slug&&t.platform===platform&&t.versionId===v.id);
  const localizations=await all(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations?limit=200`);
  const needsText=localizations.map(l=>({locale:l.attributes.locale,missing:['description','supportUrl',...(app.versions.some(old=>old.platform===platform&&old.id!==v.id&&old.state==='READY_FOR_DISTRIBUTION')?['whatsNew']:[])].filter(f=>!l.attributes[f])})).filter(l=>l.missing.length);
  const entry={slug:app.slug,appId:app.appId,platform,version:v.attributes.versionString,versionId:v.id,state:v.attributes.appVersionState||v.attributes.appStoreState,releaseType:v.attributes.releaseType,expectedSets:expected.length,verifiedSets:done.length,verifiedImages:done.reduce((n,t)=>n+t.screenshots.length,0),verifiedLocales:new Set(done.map(t=>t.locale)).size,complete:expected.length>0&&expected.every(t=>done.some(d=>d.locale===t.locale&&d.type===t.type&&d.screenshots.length===t.files.length&&d.screenshots.every((s,i)=>s.md5===t.files[i].md5&&s.state==='COMPLETE'))),listingTextToCompleteBeforeReview:needsText,appStoreConnect:`https://appstoreconnect.apple.com/apps/${app.appId}/distribution/${platform==='MAC_OS'?'macos':'ios'}/version/inflight`};
  entries.push(entry);console.log(app.slug,platform,entry.version,entry.state,`${entry.verifiedImages} verified images (${entry.verifiedSets}/${entry.expectedSets} sets)`);
 }
}
const report={generatedAt:new Date().toISOString(),verifiedImages:entries.reduce((n,e)=>n+e.verifiedImages,0),entries,retained:['tumtum','soooon'],noAppleAppRecord:['hooray'],unsupportedListingLocales:['bg','kk','lt'],pendingReviewWithdrawal:entries.filter(e=>['WAITING_FOR_REVIEW','IN_REVIEW'].includes(e.state)&&!e.complete).map(e=>e.slug)};
await fs.writeFile(path.join(audit,'upload-status.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(path.join(audit,'delivered-galleries.json'),JSON.stringify({generatedAt:report.generatedAt,galleries:verified.filter(g=>entries.some(e=>e.versionId===g.versionId))},null,2)+'\n');
const lines=['# App Store screenshot delivery',`Checked: ${report.generatedAt}`,'','| App | Platform | Version | State | Verified images | Verified sets |','| --- | --- | --- | --- | ---: | ---: |',...entries.map(e=>`| ${e.slug} | ${e.platform} | ${e.version} | ${e.state} | ${e.verifiedImages} | ${e.expectedSets?`${e.verifiedSets}/${e.expectedSets}`:'Pending review decision'} |`),'',`Total verified images: **${report.verifiedImages}**. TumTum and Soooon retain their current images; Hooray has no Apple app record.`,report.pendingReviewWithdrawal.length?`Pending owner decision about withdrawing existing reviews: ${report.pendingReviewWithdrawal.join(', ')}.`:'','', 'Uploaded draft screenshots are not yet published in the public store. Newly created localization records with incomplete listing text are listed in upload-status.json and require that text before a future review submission. Sundust retains its original complete iPhone/iPad preview videos before the screenshots. API credentials, original binaries and release schedules are not changed by the screenshot upload.'];
await fs.writeFile(path.join(audit,'upload-status.md'),lines.join('\n')+'\n');
