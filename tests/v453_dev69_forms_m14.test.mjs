/** M14 form grammar — 2x3 QWE sets, cooldown isolation and PvP manifest. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,abilityRule} from '../engine.mjs';
import {FORM_KITS_V453_M14} from '../multiplayer/form_kits_v453_m14.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const load=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let count=0;
function check(name,fn){fn();count++;console.log('✓ M14 FORMS '+name)}
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6915,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,autoFarm:false,autoFollow:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,level:6,x:.5,y:.5,hp:1400,maxHp:1400,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.507,y:.5,hp:1800,maxHp:1800,armor:0,mr:0});
 a.visible=()=>true;
 return {a,u,enemy,team};
}
check('all six QWE spells are described independently in both forms',()=>{
 for(const champ of ['Nidalee','Elise','Shyvana']){
  const forms=FORM_KITS_V453_M14[champ];
  assert.equal(Object.keys(forms).length,2);
  for(const mode of Object.keys(forms))for(const slot of ['Q','W','E']){
   assert.equal(forms[mode][slot].kind,'board_effect');
   assert.equal(forms[mode][slot].implemented,'form_prototype');
  }
 }
});
for(const team of ['blue','red'])for(const champ of ['Nidalee','Elise']){
 const {a,u,enemy}=fixture(champ,team);
 check(team+' '+champ+' R is learnable at level one',()=>{
  const fresh=new Arena(map,mask,{seed:6915,mode:'pvp',draft:{[team]:{MID:champ}}});
  const newU=fresh.units.find(x=>x.id===team+'_MID');
  assert.equal(newU.skillRanks.R,1);
 });
 check(team+' '+champ+' human→'+(champ==='Nidalee'?'cougar':'spider')+'→human R with independent QWE cooldowns',()=>{
  const h=abilityRule(u,'Q');
  assert.equal(h.shape,champ==='Nidalee'?'line_enemy':'target_enemy');
  // Human Q commits its cooldown, then R swaps to a separately ready Q.
  const queued=h.shape==='line_enemy'?
   a.queueDirectionalSkill(team,u.id,'Q',{x:.8,y:.5}):
   a.queueTargetedSkill(team,u.id,'Q',enemy.id);
  assert.equal(queued.ok,true,queued.reason);
  a.resolveBoardSkillsV453Dev69();
  const humanCd=u.skillCds.Q;
  assert.ok(humanCd>0);
  assert.equal(a.queueKitSkillV42(team,u.id,'R',null).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.boardFormV453M14,champ==='Nidalee'?'cougar':'spider');
  assert.equal(u.skillCds.Q,0,'second form has own Q timer');
  assert.notEqual(abilityRule(u,'Q').shape,h.shape);
  assert.equal(a.queueTargetedSkill(team,u.id,'Q',enemy.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.ok(u.skillCds.Q>0);
  a.gameTime=3;
  assert.equal(a.queueKitSkillV42(team,u.id,'R',null).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.boardFormV453M14,'human');
  assert.equal(u.skillCds.Q,humanCd);
  const cp=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
  assert.equal(checksumV40(cp.snapshotV40()),checksumV40(a.snapshotV40()));
 });
}
for(const team of ['blue','red']){
 const {a,u}=fixture('Shyvana',team);
 check(team+' 2026 Shyvana dragon R requires full Fury and uses reworked names',()=>{
  assert.equal(FORM_KITS_V453_M14.Shyvana.human.Q.missing.includes('emberstrike'),true);
  assert.equal(a.queueKitSkillV42(team,u.id,'R',{x:.52,y:.5}).ok,false);
  u.boardFuryV453M14=100;
  assert.equal(a.queueKitSkillV42(team,u.id,'R',{x:.52,y:.5}).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.boardFormV453M14,'dragon');
  assert.equal(u.boardFuryV453M14,0);
  assert.equal(abilityRule(u,'Q').implemented,'form_prototype');
 });
 check(team+' Shyvana returns to human form when temporary dragon duration expires',()=>{
  a.gameTime=u.boardDragonUntilV453M14;
  a.advanceBoardPassivesV453Dev69();
  assert.equal(u.boardFormV453M14,'human');
 });
}
async function apiTest(){
 const app=createPvPServerV453Dev47({tickMs:0});
 const a=await app.listen(0,'127.0.0.1'),root='http://127.0.0.1:'+a.port;
 try{
  const create=await fetch(root+'/api/create',{method:'POST',
   headers:{'content-type':'application/json'},body:JSON.stringify({maxSeats:2})});
  const cookie=create.headers.get('set-cookie')?.split(';')[0];
  const result=await (await fetch(root+'/api/kits',{headers:{cookie}})).json();
  assert.equal(Object.keys(result.kits).length,30,'previous 30 remain stable');
  for(const champ of ['Nidalee','Elise','Shyvana'])
   assert.equal(Object.keys(result.formKits[champ]).length,2);
  count++;console.log('✓ M14 FORMS authenticated client manifest exposes both QWER sets');
 }finally{await app.close()}
}
await apiTest();
console.log('DEV69 FORMS M14 '+count+'/'+count+' PASS');
