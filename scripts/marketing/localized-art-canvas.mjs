/** Deterministic localization compositor. Native UI is preserved; explicitly approved fictional photo edits are recorded.
 * Uses system shaping/fallback fonts, real hardware PNGs and approved artwork.
 * Independent of browser automation; output is lossless PNG at store dimensions.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {memoriesPhotoPlate} from './memories-photo-plate.mjs';
const require=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES||'/Users/fabio.hoffmann/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','package.json'));
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const sharp=require('sharp');
const cache=new Map();
export function clearRenderCache(){cache.clear()}
export const root=path.resolve('.');
async function bitmap(src){const p=path.join(root,src);if(!cache.has(p))cache.set(p,loadImage(p));return cache.get(p)}
function rounded(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2))}
function cover(c,im,x,y,w,h){const s=Math.max(w/im.width,h/im.height),sw=w/s,sh=h/s;c.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,x,y,w,h)}
function font(locale){return ({ar:'Arial',he:'Arial',ur:'Arial',bn:'Bangla Sangam MN',gu:'Gujarati Sangam MN',hi:'Kohinoor Devanagari',mr:'Kohinoor Devanagari',kn:'Kannada Sangam MN',ml:'Malayalam Sangam MN',or:'Noto Sans Oriya',pa:'Gurmukhi MN',ta:'Tamil Sangam MN',te:'Kohinoor Telugu',th:'Thonburi',ja:'Hiragino Sans',ko:'Apple SD Gothic Neo','zh-Hans':'PingFang SC','zh-Hant':'PingFang TC','zh-HK':'PingFang HK'})[locale]||'Avenir Next'}
function wrap(c,text,width,locale){
 const result=[];
 for(const paragraph of text.split('\n')){
  const tokens=[...new Intl.Segmenter(locale,{granularity:'word'}).segment(paragraph)].map(x=>x.segment);let line='';
  for(const token of tokens){if(c.measureText(line+token).width>width&&line.trim()){result.push(line.trim());line=token.trimStart()}else line+=token}
  if(line.trim())result.push(line.trim());
 }
 return result;
}
function text(c,value,{x,y,width,size,minSize,weight=750,color,locale,maxLines=4,leading=1.12}){
 let lines;do{c.font=`${weight>=600?'bold':'normal'} ${size}px "${weight<600&&!['ar','he','ur','bn','gu','hi','mr','kn','ml','or','pa','ta','te','th','ja','ko','zh-Hans','zh-Hant','zh-HK'].includes(locale)?'Arial':font(locale)}"`;lines=wrap(c,value,width,locale);if(lines.length<=maxLines)break;size-=2}while(size>=minSize);
 if(lines.length>maxLines)throw Error(`${locale}: copy exceeds ${maxLines} lines: ${value}`);
 const rtl=['ar','he','ur'].includes(locale);c.direction=rtl?'rtl':'ltr';c.textAlign=rtl?'right':'left';c.textBaseline='top';c.fillStyle=color;
 for(let i=0;i<lines.length;i++)c.fillText(lines[i],rtl?x+width:x,y+i*size*leading);
 return {bottom:y+lines.length*size*leading,size,lines};
}
async function device(c,p,x,y,width){
 const im=p.photoPlate?await loadImage((await memoriesPhotoPlate(await fs.readFile(path.join(root,p.screens[0])))).buffer):await bitmap(p.screens[0]);
 if(p.frame){const [fw,fh]=p.frame.dimensions,[sx,sy,sw,sh]=p.frame.screen,s=width/fw;
  c.save();rounded(c,x+sx*s,y+sy*s,sw*s,sh*s,(p.frame.radius||(p.device==='ipad'?42:150))*s);c.clip();c.drawImage(im,x+sx*s,y+sy*s,sw*s,sh*s);c.restore();
  c.drawImage(await bitmap(p.frame.asset),x,y,fw*s,fh*s);return fh*s;
 }
 const height=width*im.height/im.width,b=width*.009;c.save();c.shadowColor='#00000033';c.shadowBlur=width*.06;c.fillStyle=p.device==='web'?'#faf7ef':'#29303e';rounded(c,x-b,y-b,width+2*b,height+2*b,width*.015);c.fill();c.restore();
 c.save();rounded(c,x,y,width,height,width*.008);c.clip();c.drawImage(im,x,y,width,height);c.restore();return height;
}
async function prop(c,asset,x,y,w,angle=0){const im=await bitmap(asset);c.save();c.translate(x+w/2,y);c.rotate(angle*Math.PI/180);c.drawImage(im,-w/2,0,w,w*im.height/im.width);c.restore()}
async function cutout(c,record,W,H,social=false){const im=await bitmap(record.source),[l,t,r,b]=record.rect;const width=social?Math.min(W*.87,H*.235*(r-l)/(b-t)):W*record.width,s=width/(r-l),height=(b-t)*s,x=social?W*.065:W*record.left,y=social?H*.9-height:H*record.top,angle=social?-2:record.angle||0;
 if(record.transparent){c.save();c.translate(x+width/2,y+height/2);c.rotate(angle*Math.PI/180);c.drawImage(im,l,t,r-l,b-t,-width/2,-height/2,width,height);c.restore();return;}
 c.save();c.translate(x+width/2,y+height/2);c.rotate(angle*Math.PI/180);c.shadowColor='#00000033';c.shadowBlur=W*.02;c.shadowOffsetY=W*.013;c.fillStyle='#fff';rounded(c,-width/2,-height/2,width,height,(record.radius||24)*s);c.fill();c.shadowColor='transparent';rounded(c,-width/2,-height/2,width,height,(record.radius||24)*s);c.clip();c.drawImage(im,l,t,r-l,b-t,-width/2,-height/2,width,height);c.restore();
}
export async function render(p,index,format,size,output){
 const [W,H]=size,c=createCanvas(W,H).getContext('2d'),locale=p.locale||'en-US',cfg=p.studio_art||p.store_pilot||{},tablet=p.device==='ipad',wide=W>H,hero=index===0,platform=tablet?'ipad':p.device==='android'?'android':'primary',v=cfg[platform]||cfg;
 const wideStore=wide&&format==='store';
 const background=cfg.backgrounds?.[index]||(hero&&cfg.hero_background?cfg.hero_background:p.background),social=format==='social',share=format==='share';
 c.fillStyle=p.palette[0];c.fillRect(0,0,W,H);
 if(!share){cover(c,await bitmap(background),0,0,W,H);const g=c.createLinearGradient(0,0,0,H);if(hero||cfg.game){g.addColorStop(0,'#0b101cdc');g.addColorStop(.3,'#0b101c99');g.addColorStop(1,'#0b101c33')}else{g.addColorStop(0,p.palette[0]+'fa');g.addColorStop(.4,p.palette[0]+'f2');g.addColorStop(1,p.palette[0]+'a6')}c.fillStyle=g;c.fillRect(0,0,W,H)}
 const ink=!share&&(hero||cfg.game)?'#fff':p.palette[1],margin=share?W*.047:W*.07;
 const icon=await bitmap(p.icon),iw=share?W*.052:W*(tablet?.054:.062),by=share?H*.076:H*.04;
 c.save();rounded(c,margin,by,iw,iw,iw*.24);c.clip();c.drawImage(icon,margin,by,iw,iw);c.restore();c.font=`bold ${share?30:W*(tablet?.035:.039)}px "Avenir Next"`;c.direction='ltr';c.textAlign='left';c.textBaseline='middle';c.fillStyle=ink;c.fillText(p.name,margin+iw+W*.018,by+iw/2);
 const words=(social?p.social_copy?.[index]:null)||p.panels[index];
 const heading=text(c,words[0],{x:margin,y:share?H*.22:wideStore?H*.24:H*(social?.14:.12),width:share?W*.48:wideStore?W*.34:W*.86,size:share?68:W*(wideStore?.073:social?.096:tablet?.096:.108),minSize:share?48:W*(wideStore?.055:.078),color:ink,locale,maxLines:4,leading:1.08});
 const description=text(c,words[1],{x:margin,y:heading.bottom+W*(share?.012:tablet?.025:.028),width:share?W*.45:wideStore?W*.32:W*.86,size:share?27:W*(wideStore?.031:social?.047:tablet?.047:.049),minSize:share?23:W*(wideStore?.027:.042),weight:450,color:ink,locale,maxLines:3,leading:1.3});
 let left=share?W*.64:wideStore?W*.44:W*(social?.12:tablet?.05:.08),width=share?W*.295:wideStore?W*.55:W*(social?.76:tablet?.9:.84),top=share?H*.085:wideStore?H*.22:Math.max(description.bottom+W*.04,H*(v.device_tops?.[index]??v.device_top??cfg.device_top??(wide?.46:.43)));
 if(v.compact_from!=null&&index>=v.compact_from&&!share&&!wideStore)top=description.bottom+W*.045;
 if(!p.frame&&share){left=W*.59;width=W*.43;top=H*.36}
 if(!share&&!hero){for(const item of cfg.props||[]){if(item.panels&&!item.panels.includes(index))continue;const im=await bitmap(item.asset),w=W*item.width,y=item.top!=null?H*item.top:H*(1-(item.bottom||0))-w*im.height/im.width;await prop(c,item.asset,W*item.left,y,w,item.angle||0)}}
 await device(c,{...p,screens:[p.screens[index]],photoPlate:p.slug==='memories'&&index===1},left,top,width);
 const crops=[...(v.cutouts?.[index]||cfg.cutouts?.[index]||[]),...(cfg.photo_cutouts?.[platform]?.[index]||[])];
 for(const record of crops){if(social){if(index%2!==1||(record.rect[2]-record.rect[0])/(record.rect[3]-record.rect[1])<2)continue;await cutout(c,record,W,H,true);break}else if(!share)await cutout(c,record,W,H)}
 if(social){c.fillStyle=p.palette[0];c.fillRect(0,H*.93,W,H*.07);text(c,p.cta,{x:margin,y:H*.946,width:W*.68,size:W*.031,minSize:W*.025,weight:650,color:p.palette[1],locale,maxLines:1});c.font=`${W*.024}px "Avenir Next"`;c.textAlign='right';c.fillText('magiclabsolutions.com',W*.93,H*.965)}
 if(share){c.font='20px "Avenir Next"';c.direction='ltr';c.textAlign='left';c.fillStyle=ink;c.fillText('magiclabsolutions.com',margin,H*.93)}
 await fs.mkdir(path.dirname(output),{recursive:true});const png=c.canvas.toBuffer('image/png');await fs.writeFile(output,format==='store'?await sharp(png).flatten({background:'#ffffff'}).removeAlpha().png().toBuffer():png);
 return {locale,format,index,dimensions:size,headline:heading,description,device_top:top,source:p.screens[index],background:share?null:background};
}
