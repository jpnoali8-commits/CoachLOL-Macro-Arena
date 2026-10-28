/** Champion reference snapshot from Riot Data Dragon. No combat activation. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const base=path.join(root,'data/riot_reference/source_16_21_1/riot/16.21.1');
const read=(loc,id)=>JSON.parse(fs.readFileSync(path.join(base,loc,id?'champion/'+id+'.json':'champion.json'),'utf8'));
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
export function generate(){const en=read('en_US'),pt=read('pt_BR');if(en.version!=='16.21.1'||pt.version!=='16.21.1')throw Error('WRONG_VERSION');
 const champions={};for(const id of Object.keys(en.data).sort()){
  const a=read('en_US',id).data[id],b=read('pt_BR',id).data[id];if(!a||!b||!Array.isArray(a.spells)||a.spells.length!==4)throw Error('INCOMPLETE:'+id);
  champions[id]={id,name:a.name,namePt:b.name,riotKey:String(a.key),stats:a.stats,
   passive:{name:a.passive?.name,namePt:b.passive?.name,description:clean(a.passive?.description),descriptionPt:clean(b.passive?.description)},
   spells:a.spells.map((s,i)=>({slot:['Q','W','E','R'][i],id:s.id,name:s.name,namePt:b.spells?.[i]?.name||s.name,description:clean(s.description),descriptionPt:clean(b.spells?.[i]?.description),maxRank:s.maxrank,cooldown:s.cooldown,cost:s.cost,range:s.range,tooltip:clean(s.tooltip)})),mechanicsCertified:false};
 }
 return {schema:'coachlol.champions.reference.dev36',patch:'26.21',dataDragon:'16.21.1',source:'Riot Data Dragon snapshots supplied by user',status:'REFERENCE_ONLY_NOT_SKILL_IMPLEMENTATION',count:Object.keys(champions).length,champions};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const doc=generate();fs.writeFileSync(path.join(root,'data/riot_reference/champions_26_21_dev36.json'),JSON.stringify(doc,null,2)+'\n');
 console.log(JSON.stringify({count:doc.count,examples:['Mordekaiser','Elise','Nidalee','Shyvana'].filter(x=>doc.champions[x]).map(x=>({id:x,hp:doc.champions[x].stats.hp,spells:doc.champions[x].spells.map(s=>s.name)}))},null,2));
}
