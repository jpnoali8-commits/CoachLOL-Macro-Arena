/**
 * M31/B01: REAL authored witnesses for all 35 champions, both PvP human seats.
 * Each witness demands a UNIQUE champion identity effect on the server.
 * Does not certify full P+QWER or 17-dimensional parity; M27 remains binding.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {buildM31B01ContractLedger} from '../../tools/skills_m31_b01_contract_ledger.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const ledger=buildM31B01ContractLedger();
assert.equal(ledger.metrics.fullyCertifiedPqwerKits,0);
assert.equal(ledger.champions.length,35);
const results={champions:35,seats:2,passed:0,failed:0,identityWitnesses:0,snapshots:0,
 certifiedChampions:0},failures=[];
function fixture(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:310035,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3000,maxHp:4000,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.513,y:.5,hp:7000,maxHp:7000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.51,y:.5,hp:2800,maxHp:4000});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const receipt=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(receipt.ok,true,champ+' '+slot+' queue '+JSON.stringify(receipt));
  let execution;
  const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,q)=>(execution=old(actor,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=old;
  assert.equal(execution?.ok,true,champ+' '+slot+' execution '+JSON.stringify(execution));
  assert.ok(u.skillCds[slot]>a.gameTime||u.mana<10000,
   champ+' '+slot+' no committed receipt');
  const snap=checksumV40(a.snapshotV40());
  a.resolveBoardSkillsV453Dev69();
  assert.equal(checksumV40(a.snapshotV40()),snap,champ+' "+slot+" duplicate resolve');
 };
 return {a,u,e,ally,cast,team,foe};
}
const directed={x:.52,y:.5};
const checks={
 Alistar:({u,cast,a})=>{cast('R');assert.ok(u.m26AlistarUnbreakableUntil>a.gameTime);},
 Braum:({u,cast,a})=>{cast('E');assert.ok(u.m26BraumShield?.until>a.gameTime);},
 Cassiopeia:({a,e,cast})=>{
  e.m28FacingV453={x:-1,y:0};cast('R',{point:directed});
  assert.equal(a.effectResolverV41().has(e,'stun'),true,'Petrifying Gaze requires opponent to face Cassiopeia');
 },
 Corki:({u,cast})=>{cast('R',{point:directed});assert.equal(u.m22MagazineV453?.shots,1);},
 Fizz:({u,a,cast})=>{cast('E',{point:directed});assert.ok(u.m24FizzLeapV453?.until>a.gameTime);},
 Galio:({a,u,ally,cast})=>{
  cast('R',{targetId:ally.id});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m25_galio_entrance'&&z.ownerId===u.id));
 },
 Gragas:({a,u,cast})=>{
  cast('Q',{point:directed});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m21_gragas_barrel'&&z.ownerId===u.id));
 },
 Heimerdinger:({a,u,cast})=>{
  cast('Q',{point:directed});assert.equal(u.m28HeimerStock?.charges,2);
  assert.ok(a.boardSummonsV453Dev69.some(z=>z.ownerId===u.id&&z.kind==='heimer_turret'));
 },
 JarvanIV:({a,u,cast})=>{
  cast('E',{point:directed});
  assert.ok(a.boardSummonsV453Dev69.some(z=>z.kind==='jarvan_flag'&&z.ownerId===u.id));
 },
 Karthus:({u,cast,a})=>{cast('E');assert.ok(u.m26KarthusE?.until>a.gameTime);},
 Kassadin:({u,a,e,cast})=>{
  cast('Q',{targetId:e.id});assert.equal(a.effectResolverV41().has(u,'shield'),true);
 },
 KogMaw:({a,u,cast})=>{
  cast('E',{point:directed});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_kog_ooze'&&z.ownerId===u.id));
 },
 LeeSin:({u,cast,a})=>{cast('E');assert.equal(u.m30LeeFlurry?.charges,2);assert.ok(u.m30LeeFlurry.until>a.gameTime);},
 Locke:({e,u,cast})=>{
  cast('Q',{point:directed});assert.ok(e.m26LockeNails?.[u.id]?.stacks>=1);
 },
 Lucian:({u,e,cast})=>{
  const before=e.hp;cast('Q',{targetId:e.id});
  assert.ok(e.hp<before,'Q requires and strikes initially targetable victim');
 },
 Lulu:({u,ally,cast,a})=>{
  cast('E',{targetId:ally.id});
  assert.deepEqual(u.m25LuluPix?.targetId,ally.id);assert.ok(u.m25LuluPix?.until>a.gameTime);
 },
 MasterYi:({u,cast,a})=>{cast('W');assert.ok(u.m29YiMeditateUntil>a.gameTime);},
 Mel:({a,u,cast})=>{
  cast('Q',{point:directed});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_mel_volley'&&z.ownerId===u.id));
 },
 Milio:({u,ally,cast})=>{cast('E',{targetId:ally.id});assert.equal(u.m29MilioEStock.charges,1);},
 Quinn:({u,e,cast,a})=>{
  cast('W',{point:directed});
  assert.ok(e.m20MarksV453?.['harrier_'+u.id]>a.gameTime);
 },
 Rell:({u,cast})=>{
  cast('W',{point:directed});
  assert.equal(u.m25RellMounted,false,'W1 must dismount originally mounted Rell');
  assert.equal(u.m31RellLastWMode,'crash_down');
 },
 Sejuani:({u,e,cast,a})=>{
  cast('W',{point:directed});
  assert.ok(e.m21FrostV453?.sourceId===u.id);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_sej_second'&&z.ownerId===u.id));
 },
 Seraphine:({a,e,cast,u})=>{
  a.applyEffectV41(e,'slow',{source:u,duration:3,power:.3});
  cast('E',{point:directed});assert.equal(a.effectResolverV41().has(e,'root'),true);
 },
 Sett:({u,cast})=>{cast('Q');assert.equal(u.boardNextBasicV453Dev69?.charges,2);},
 Shen:({a,u,ally,cast})=>{
  cast('R',{targetId:ally.id});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m26_shen_arrival'&&z.ownerId===u.id));
 },
 Syndra:({u,cast})=>{cast('Q',{point:directed});assert.equal(u.m20SyndraOrbsV453?.length,1);},
 TahmKench:({a,u,cast})=>{
  u.m27TahmGrey=180;cast('E');assert.equal(u.m27TahmGrey,0);
  assert.ok(a.effectResolverV41().has(u,'shield'));
 },
 Urgot:({a,u,e,cast})=>{
  cast('W',{targetId:e.id});
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m27_urgot_purge'&&z.ownerId===u.id));
 },
 Varus:({a,u,cast})=>{cast('W');assert.ok(u.m30VarusEmpoweredQUntil>a.gameTime);},
 Vi:({u,cast})=>{cast('W');assert.equal(u.boardNextBasicV453Dev69?.charges,3);},
 Viktor:({a,u,e,cast})=>{
  cast('Q',{targetId:e.id});assert.equal(a.effectResolverV41().has(u,'shield'),true);
 },
 Xerath:({a,u,cast})=>{
  cast('R',{point:directed});assert.ok(u.m22ArtilleryV453?.remaining>0);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m22_artillery_channel'&&z.ownerId===u.id));
 },
 Yunara:({u,a,cast})=>{cast('R');assert.ok(u.m25YunaraTranscendentUntil>a.gameTime);},
 Zac:({u,cast})=>{cast('W');assert.equal(u.m25ZacGoo?.length,1);},
 Zilean:({u,a,cast})=>{
  u.skillCds.Q=a.gameTime+30;u.skillCds.E=a.gameTime+30;
  cast('W');assert.ok(u.skillCds.Q<a.gameTime+30&&u.skillCds.E<a.gameTime+30);
 }
};
assert.deepEqual(Object.keys(checks).sort(),ledger.champions.map(x=>x.champion));
for(const champion of ledger.champions)for(const team of ['blue','red'])try{
 const {champion:champ,witness,QWER,dimensions}=champion;
 const env=fixture(champ,team);
 assert.equal(env.a.units.length,10,'two humans control five champion units each');
 assert.equal(QWER[witness.slot].state,'IMPLEMENTED_PARTIAL_NOT_CERTIFIED');
 assert.equal(BOARD_M20_B01_V453[champ][witness.slot][witness.key],true,
  champ+' authored contract key missing');
 assert.equal(champion.certification,'NOT_CERTIFIED');
 assert.equal(Object.values(dimensions).filter(v=>v==='NOT_FULLY_CERTIFIED').length,17);
 const receiptless=checksumV40(env.a.snapshotV40());
 const illegal=env.a.queueBoardSkillV453Dev69(team,env.u.id,'NOT_A_SKILL',{});
 assert.equal(illegal.ok,false);assert.equal(checksumV40(env.a.snapshotV40()),receiptless);
 checks[champ](env);
 results.identityWitnesses++;
 const snap=env.a.snapshotV40();
 assert.equal(checksumV40(snap),
  checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()),
  champ+' '+team+' snapshot checksum');
 results.snapshots++;results.passed++;
}catch(err){results.failed++;failures.push({champion:champion.champion,team,error:String(err?.stack||err)})}
for(const x of failures)console.error('M31_WITNESS_FAIL',JSON.stringify(x));
console.log('M31_B01_35_AUTHORED_WITNESSES '+JSON.stringify(results));
assert.equal(results.failed,0);
assert.equal(results.passed,70);assert.equal(results.identityWitnesses,70);
assert.equal(results.snapshots,70);
