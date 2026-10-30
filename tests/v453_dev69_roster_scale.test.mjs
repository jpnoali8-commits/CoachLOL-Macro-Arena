/** Broad roster source-integrity test, not a false P/QWER certification. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,CHAMPION_BASE_ROSTER_V453_DEV69,championBaseRosterV453Dev69,
 championLevelStatsV453Dev69M1,CHAMPION_LEVEL_STATS_V453_DEV69_M1} from '../engine.mjs';
const read=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const full=read('riot_reference/source_16_21_1/riot/16.21.1/en_US/champion.json');
const keys=Object.keys(full.data).sort();
assert.equal(keys.length,173,'baseline is pinned to patch 16.21.1');
assert.deepEqual(keys,Object.keys(CHAMPION_BASE_ROSTER_V453_DEV69).sort());
let validated=0;
for(const id of keys){
 const stats=full.data[id].stats,base=championBaseRosterV453Dev69(id);
 assert.ok(base,id);
 for(const [a,b] of [['hp','hp'],['mana','mp'],['ad','attackdamage'],
 ['armor','armor'],['mr','spellblock'],['moveSpeed','movespeed'],
 ['attackRange','attackrange'],['hpRegen','hpregen'],['manaRegen','mpregen'],
 ['attackSpeedBase','attackspeed']])assert.equal(base[a],stats[b],id+' '+a);
 assert.equal(base.source,'riot_ddragon_16_21_1_base');
 assert.equal(base.gameplayCertification,'reference_only');
 assert.equal(base.adGrowthVerified,false);
 assert.equal(base.growth.ad,null);
 validated++;
}
for(const id of Object.keys(CHAMPION_LEVEL_STATS_V453_DEV69_M1)){
 const audited=championLevelStatsV453Dev69M1(id,1);
 assert.equal(audited.ad,CHAMPION_LEVEL_STATS_V453_DEV69_M1[id].ad,
  id+' has independent AD audit; source fallback must not override it');
}
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
for(const seats of [
 {blue:{TOP:'Aatrox',JG:'Amumu',MID:'Annie',ADC:'Ashe',SUP:'Bard'},
  red:{TOP:'Camille',JG:'Diana',MID:'Brand',ADC:'Corki',SUP:'Alistar'}},
 {blue:{TOP:'Garen',JG:'Hecarim',MID:'Hwei',ADC:'Draven',SUP:'Janna'},
  red:{TOP:'Locke',JG:'Kayn',MID:'Lissandra',ADC:'Aphelios',SUP:'Lulu'}}
]){
 const a=new Arena(map,mask,{seed:6989,mode:'pvp',draft:seats});
 assert.equal(a.units.length,10);
 for(const u of a.units){
  const ref=full.data[u.champ].stats;
  assert.equal(u.maxHp,ref.hp,u.champ+' HP');
  assert.equal(u.maxMana,ref.mp,u.champ+' resource');
  assert.equal(u.ad,ref.attackdamage,u.champ+' AD');
  assert.equal(u.armor,ref.armor,u.champ+' armor');
  assert.equal(u.mr,ref.spellblock,u.champ+' MR');
 }
 const snap=a.snapshotV40(),reload=Arena.fromSnapshotV40(map,mask,snap);
 assert.deepEqual(reload.units.map(u=>[u.champ,u.maxHp,u.maxMana,u.ad]),
  a.units.map(u=>[u.champ,u.maxHp,u.maxMana,u.ad]));
}
console.log('DEV69 SCALABLE ROSTER '+validated+'/173 SOURCE BASELINES PASS; '+20+'/20 PvP draft placements PASS; kits remain uncertified');
