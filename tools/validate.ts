import fs from 'node:fs';
import {catalog} from '../src/core/contracts';
const errors:string[]=[];const ids=new Set<string>();
for(const o of catalog.offerings){if(ids.has(o.id))errors.push('duplicate '+o.id);ids.add(o.id);if(!Number.isSafeInteger(o.cost)||o.cost<=0||!Number.isSafeInteger(o.suggestedPrice)||o.suggestedPrice<=0)errors.push('numeric '+o.id);if(!catalog.qualityTiers.includes(o.quality))errors.push('tier '+o.id);if(o.quality==='Masterpiece')errors.push('W1 Masterpiece drop');for(const set of o.set_tags)if(set!==catalog.set.id)errors.push('set ref');}
for(const p of catalog.set.pieces)if(!ids.has(p))errors.push('set piece '+p);
const locales=['zh-HK','en','ja','th','zh-CN'];let base:string[]=[];
for(const l of locales){const strings=JSON.parse(fs.readFileSync(`src/content/${l}.json`,'utf8'));const keys=Object.keys(strings).sort();if(!base.length)base=keys;if(JSON.stringify(keys)!==JSON.stringify(base))errors.push('locale keys '+l);if(Object.values(strings).some(s=>typeof s!=='string'||!s))errors.push('empty '+l);for(const o of catalog.offerings)if(!strings[o.key])errors.push('missing offering '+l);}
if(catalog.set.demandBonusBp>catalog.config.demandCapBp||catalog.supplier.discountBp>catalog.config.discountCapBp)errors.push('cap');
for(const asset of ['counter.glb','skin-test.glb','sale.wav'])if(!fs.existsSync('public/assets/'+asset))errors.push('asset '+asset);
if(catalog.discovery.story_ref!=='tutorial.sample')errors.push('story');
const result={errors,offerings:ids.size,locales:locales.length,keysPerLocale:base.length,qualityTiers:catalog.qualityTiers,uniqueSeparate:catalog.uniqueTagSeparate,review:'Provisional W1 fixtures; no cultural facts or final balance approved'};fs.writeFileSync('evidence/content-validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
