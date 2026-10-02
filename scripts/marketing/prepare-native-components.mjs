import fs from 'node:fs/promises';
import {materializeComponent} from './native-component-assets.mjs';
let count=0,omitted=0;
for(const file of ['_data/product_launch.json','_data/product_launch_localized.json']){
  const data=JSON.parse(await fs.readFile(file));
  const products=file.includes('localized')?Object.values(data).flatMap(Object.values):Object.values(data);
  for(const product of products){
    if(product.hero_cutout){const crop=await materializeComponent(product.hero_cutout);product.hero_cutout=crop;crop?count++:omitted++;}
    for(const feature of product.features){if(!feature.cutout)continue;const crop=await materializeComponent(feature.cutout);feature.cutout=crop;crop?count++:omitted++;}
  }
  await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
}
console.log(`Prepared ${count} native UI components; omitted ${omitted} empty/invalid crops.`);
