import {writeFileSync} from 'node:fs';
import {CHAMPION_STATS_V38,CHAMPION_GROWTH_V38,CHAMPION_BASE_AA_RANGE,growthAtLevelV42,KIT_PATCH_V42} from '../engine.mjs';
const sources={
 Lux:'https://wiki.leagueoflegends.com/en-us/Lux',
 Nami:'https://wiki.leagueoflegends.com/en-us/Nami',
 Vex:'https://wiki.leagueoflegends.com/en-us/Vex',
 Jinx:'https://wiki.leagueoflegends.com/en-us/Jinx',
 Ahri:'https://wiki.leagueoflegends.com/en-us/Ahri',
};
const stats={};
for(const champion of Object.keys(sources).sort()){
 const base=CHAMPION_STATS_V38[champion], growth=CHAMPION_GROWTH_V38[champion];
 if(!base||!growth)throw Error('Missing audited stats for '+champion);
 const perLevel=[];
 for(let level=1;level<=18;level++){
  const row={level};
  for(const [field,growthVal] of Object.entries(growth)){
   const increment=Array.from({length:level-1},(_,i)=>growthAtLevelV42(growthVal,i+2)).reduce((a,b)=>a+b,0);
   row[field]=Number((Number(base[field]||0)+increment).toFixed(4));
  }
  row.ap=0;
  row.moveSpeed=base.moveSpeed;
  row.attackRange=CHAMPION_BASE_AA_RANGE[champion];
  perLevel.push(row);
 }
 stats[champion]={status:'base_and_growth_audited',source:sources[champion],base, growth,perLevel};
}
const out={schema:'coachlol.championStats.v4.2',patch:KIT_PATCH_V42,mode:'SummonersRift PC',generatedFrom:'engine.mjs constants via tools/export_champion_stats_v42.mjs',
 caveats:['AP 0 by natural growth; items and passives can add AP','Attack speed and HP/MP regen not yet individually certified','Not all champion kits certified'],champions:stats};
writeFileSync(new URL('../data/champion_stats_v42.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
