#!/usr/bin/env node
/** M45 B02 Skills S15 — LEGACY source oracle, not an authoritative Rust test.
 * Pinned engine blob 41679f7328a42e379fdfb8de5b92006e1bfb529f.
 * This characterizes a legacy Sylas→Shaco clone APPEARANCE DEFECT explicitly.
 * Rust must fix it; do not port the observed wrong appearance as intended.
 * No HTTP, real network, real fog, browser, Rust native or WASM exercised.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../../../multiplayer/authoritative_actions_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../../../../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');

function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6915,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:6,hp:1200,maxHp:1200,
  mana:800,maxMana:800,skillRanks:{Q:1,W:1,E:1,R:1},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.518,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 a.canSeePoint=()=>true;a.visible=()=>true;
 const seats=[
  {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}
 ];
 return {a,u,enemy,team,other,
  gateway:new AuthoritativeActionsV453Dev47(a,seats),
  enemySeat:other==='blue'?'B':'R'};
}
function snapshotPass(a){
 const v=a.snapshotV40(),c=Arena.fromSnapshotV40(map,mask,v);
 assert.equal(checksumV40(v),checksumV40(c.snapshotV40()));
 assert.equal(c.units.length,10);
}
let cases=0,knownAppearanceBugs=0;
const checkpoints=[];
for(const team of ['blue','red']){
 const neeko=fixture('Neeko',team);
 const ally=neeko.a.units.find(v=>v.id===team+'_TOP');
 assert.equal(neeko.a.queueNeekoDisguiseV453M15(team,neeko.u.id,ally.id).ok,true);
 assert.equal(neeko.u.champ,'Neeko');
 const alias=neeko.u.neekoDisguiseV453M15.publicId;
 const target=neeko.a.perspective(neeko.other);
 assert.ok(target.units.some(v=>v.id===alias&&v.champ===ally.champ));
 assert.ok(!target.units.some(v=>v.id===neeko.u.id));
 const denied=neeko.gateway.submit(neeko.enemySeat,
  {sequence:1,kind:'order.attack',unitId:neeko.enemy.id,
   payload:{targetId:neeko.u.id}});
 assert.equal(denied.ok,false);
 assert.equal(denied.reason,'alvo_identidade_oculta');
 const allowed=neeko.gateway.submit(neeko.enemySeat,
  {sequence:1,kind:'order.attack',unitId:neeko.enemy.id,
   payload:{targetId:alias}});
 assert.equal(allowed.ok,true);
 neeko.a.event('Neeko usou habilidade oculta.',team,'skill_vfx',
  neeko.u.id,{observedBy:['blue','red']});
 const projected=neeko.a.perspective(neeko.other);
 assert.ok(projected.events.some(v=>v.unitId===alias&&v.text==='Ação de uma unidade visível.'));
 assert.ok(!projected.events.some(v=>v.unitId===neeko.u.id));
 snapshotPass(neeko.a);cases++;

 const shaco=fixture('Shaco',team);
 assert.equal(shaco.a.queueKitSkillV42(team,shaco.u.id,'R',{x:.525,y:.5}).ok,true);
 shaco.a.resolveBoardSkillsV453Dev69();
 const realClone=shaco.a.boardSummonsV453Dev69.find(v=>v.kind==='shaco_clone');
 assert.ok(realClone);
 assert.equal(realClone.appearance.champ,'Shaco');
 assert.equal(shaco.a.units.length,10);
 shaco.a.gameTime=1;
 const shacoView=shaco.a.perspective(shaco.other);
 assert.ok(shacoView.units.some(v=>v.id===shaco.u.shacoPublicAliasV453M15&&v.champ==='Shaco'));
 assert.ok(shacoView.units.some(v=>v.id===realClone.publicId&&v.champ==='Shaco'));
 assert.ok(!shacoView.units.some(v=>v.id===shaco.u.id));
 assert.ok(!shacoView.units.some(v=>v.id===realClone.id));
 snapshotPass(shaco.a);cases++;

 const sylas=fixture('Sylas',team);
 sylas.enemy.champ='Shaco';
 const q=sylas.a.queueSylasHijackV453M14(team,sylas.u.id,sylas.enemy.id);
 assert.equal(q.ok,true);
 sylas.a.resolveSylasHijacksV453M14();
 assert.equal(sylas.u.mana,725);
 const cast=sylas.a.queueKitSkillV42(team,sylas.u.id,'R',{x:.525,y:.5});
 assert.equal(cast.ok,true);
 sylas.a.resolveBoardSkillsV453Dev69();
 const clone=sylas.a.boardSummonsV453Dev69.find(v=>v.kind==='shaco_clone');
 assert.ok(clone);
 assert.equal(sylas.u.champ,'Sylas','the real owner is still Sylas');
 assert.equal(sylas.u.mana,725,'no second mana debit on borrowed R');
 assert.equal(sylas.u.sylasStolenV453M14,null,'single stolen cast');
 // Intentional BUG WITNESS: the original legacy engine wrongly uses the
 // temporary donor Shaco identity rather than the real Sylas at spawn.
 assert.equal(clone.appearance.champ,'Shaco','pinned JS wrong appearance');
 assert.equal(clone.appearance.champ!==sylas.u.champ,true,
  'must NOT be accepted as intended Rust identity parity');
 knownAppearanceBugs++;
 sylas.a.gameTime=1;
 const view=sylas.a.perspective(sylas.other);
 const real=view.units.find(v=>v.id===sylas.u.shacoPublicAliasV453M15);
 const decoy=view.units.find(v=>v.id===clone.publicId);
 assert.equal(real?.champ,'Sylas','real owner public appearance');
 assert.equal(decoy?.champ,'Shaco','wrong clone public appearance reproduced');
 assert.ok(!view.units.some(v=>v.id===sylas.u.id),'stable owner id is still concealed');
 assert.equal(sylas.a.units.length,10);
 snapshotPass(sylas.a);
 checkpoints.push({team,owner:sylas.u.champ,wrong_clone_appearance:clone.appearance.champ,
  clone_alias:clone.publicId,stable_id_hidden:true,hash:checksumV40(sylas.a.snapshotV40())});
 cases++;

 const cast2=sylas.a.queueKitSkillV42(team,sylas.u.id,'R',{x:.545,y:.5});
 assert.equal(cast2.ok,true);assert.equal(cast2.recast,true);
 sylas.a.resolveBoardSkillsV453Dev69();
 assert.equal(sylas.u.mana,725);
 assert.equal(sylas.a.boardSummonsV453Dev69.filter(v=>v.kind==='shaco_clone').length,1);
 assert.equal(clone.commandPoint.x,.545);
 snapshotPass(sylas.a);cases++;
}
assert.equal(knownAppearanceBugs,2);
assert.equal(cases,8);
console.log('M45_S15_CLONE_IDENTITY '+JSON.stringify({
 source:'f0b1147a',cases,knownAppearanceBugs,checkpoints,
 status:'LEGACY_V8_CHARACTERIZED_NOT_RUST_PARITY'}));
