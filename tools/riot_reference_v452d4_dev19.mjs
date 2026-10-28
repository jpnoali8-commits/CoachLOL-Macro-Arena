// Reference-data normalization ONLY: never grants gameplay parity or alters engine balance.
import {growthAtLevelV42} from '../engine.mjs';

export const PATCH_V452D4_DEV19=Object.freeze({game:'26.21',dataDragon:'16.21.1',mode:'SummonersRift',mapId:'11'});
const finite=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
const fixed=x=>Number(x.toFixed(4));
const levelGrowth=level=>Array.from({length:Math.max(0,level-1)},(_,i)=>growthAtLevelV42(1,i+2)).reduce((s,n)=>s+n,0);
export function championReferenceV452d4Dev19(raw){
 if(!raw||typeof raw!=='object'||typeof raw.data!=='object'||!Object.keys(raw.data).length)throw Error('champion_json_invalido');
 const out={};
 for(const [key,ch] of Object.entries(raw.data).sort(([a],[b])=>a.localeCompare(b))){
  const s=ch.stats;if(!s||!Number.isFinite(s.hp)||!Number.isFinite(s.attackdamage)||!Number.isFinite(s.hpperlevel))throw Error('champion_stats_ausentes_'+key);
  const base={hp:s.hp,mana:finite(s.mp),ad:s.attackdamage,armor:finite(s.armor),mr:finite(s.spellblock),moveSpeed:finite(s.movespeed),attackRange:finite(s.attackrange),attackSpeed:finite(s.attackspeed),hpRegen:finite(s.hpregen),manaRegen:finite(s.mpregen)};
  const growth={hp:s.hpperlevel,mana:finite(s.mpperlevel),ad:finite(s.attackdamageperlevel),armor:finite(s.armorperlevel),mr:finite(s.spellblockperlevel),attackSpeedPercent:finite(s.attackspeedperlevel),hpRegen:finite(s.hpregenperlevel),manaRegen:finite(s.mpregenperlevel)};
  const perLevel=Array.from({length:18},(_,i)=>{
   const level=i+1,f=levelGrowth(level);
   const row={level};
   for(const k of ['hp','mana','ad','armor','mr','hpRegen','manaRegen'])row[k]=fixed(base[k]+growth[k]*f);
   row.attackSpeed=fixed(base.attackSpeed*(1+growth.attackSpeedPercent*f/100));
   row.attackRange=base.attackRange;row.moveSpeed=base.moveSpeed;row.ap=0;return row;
  });
  out[key]={id:ch.id||key,name:ch.name||key,resource:ch.partype||'unknown',base,growth,perLevel,
   hasDetailedSpells:false,hasPassiveMechanics:false,source:'Data Dragon champion.json 16.21.1',status:'reference_data_only'};
 }
 return out;
}
export function itemReferenceV452d4Dev19(raw){
 if(!raw||typeof raw!=='object'||(!raw.data||typeof raw.data!=='object'))throw Error('item_json_invalido');
 const out={};
 for(const [id,item] of Object.entries(raw.data).sort(([a],[b])=>a.localeCompare(b))){
  if(item.maps?.['11']!==true||item.gold?.purchasable!==true)continue;
  const from=(item.from||[]).map(String),into=(item.into||[]).map(String);
  out[id]={id,name:item.name||id,price:{total:finite(item.gold.total),base:finite(item.gold.base),sell:finite(item.gold.sell)},
   stats:item.stats||{},from,into,tags:item.tags||[],
   passiveStatus:'UNVERIFIED_NOT_EXECUTABLE',activeStatus:'UNVERIFIED_NOT_EXECUTABLE',
   source:'Data Dragon item.json 16.21.1',status:'reference_data_only'};
 }
 return out;
}
export function normalizeRiotReferenceV452d4Dev19(champions,items){
 const championList=championReferenceV452d4Dev19(champions);
 const itemList=itemReferenceV452d4Dev19(items);
 return {schema:'coachlol.riot_reference.v1',patch:PATCH_V452D4_DEV19,source:{champions:'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion.json',items:'https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json'},status:'REFERENCE_ONLY_NOT_LIVE_ENGINE',
  warning:'Data Dragon does not implement spells, passives, transformation states or active item behaviors; all must be authored and tested separately. Verify each 26.21 midpatch adjustment.',
  counts:{champions:Object.keys(championList).length,shopItems:Object.keys(itemList).length},champions:championList,items:itemList};
}
