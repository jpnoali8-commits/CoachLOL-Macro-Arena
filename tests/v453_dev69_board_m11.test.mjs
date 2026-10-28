/** M11 temporal board mechanics and PvP gateway/HTTP kit contracts.
 * Certified only for the behavior checked here, NOT for full Riot kit parity.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_KITS_V453_DEV69,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;
const ok=(name,fn)=>{fn();count++;console.log('✓ M11 '+name);};
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6911,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,
  autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),v=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:6,hp:1400,maxHp:1400,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(v,{x:.522,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(ally,{x:.512,y:.5,hp:800,maxHp:1000});
 a.visible=()=>true;return {a,u,v,ally,team,other};
}
for(const team of ['blue','red']){
 const taric=setup('Taric',team);
 ok(team+' Taric R is delayed and applies only to allies at release',()=>{
  assert.equal(taric.a.queueKitSkillV42(team,taric.u.id,'R',null).ok,true);
  taric.a.resolveBoardSkillsV453Dev69();
  assert.equal(taric.a.effectResolverV41().has(taric.ally,'invulnerable'),false);
  taric.a.gameTime=2;taric.a.advanceBoardTemporalV453Dev69();
  assert.equal(taric.a.effectResolverV41().has(taric.ally,'invulnerable'),false);
  taric.a.gameTime=3;taric.a.advanceBoardTemporalV453Dev69();
  assert.equal(taric.a.effectResolverV41().has(taric.ally,'invulnerable'),true);
  assert.equal(taric.a.effectResolverV41().has(taric.v,'invulnerable'),false);
  assert.equal(taric.a.boardTemporalV453Dev69.length,0);
 });
 const cage=setup('Veigar',team);
 ok(team+' Veigar E stuns ring only, not its center, with no instant CC',()=>{
  const center={x:.5,y:.5},outer=cage.a.units.find(v=>v.id===cage.other+'_TOP');
  Object.assign(cage.v,{x:.5,y:.5});
  Object.assign(outer,{x:.5+325/cage.a.worldWidth,y:.5,hp:1000});
  assert.equal(cage.a.queueKitSkillV42(team,cage.u.id,'E',center).ok,false,'zero-point skill rejected');
  cage.u.x=.49; // Cast from a real distance to ring center.
  assert.equal(cage.a.queueKitSkillV42(team,cage.u.id,'E',center).ok,true);
  cage.a.resolveBoardSkillsV453Dev69();
  assert.equal(cage.a.effectResolverV41().has(outer,'stun'),false);
  cage.a.gameTime=1;cage.a.advanceBoardTemporalV453Dev69();
  assert.equal(cage.a.effectResolverV41().has(outer,'stun'),true);
  assert.equal(cage.a.effectResolverV41().has(cage.v,'stun'),false);
 });
 const morg=setup('Morgana',team);
 ok(team+' Morgana W stays at cast coordinate, not attached to victim',()=>{
  assert.equal(morg.a.queueKitSkillV42(team,morg.u.id,'W',{x:morg.v.x,y:morg.v.y}).ok,true);
  morg.a.resolveBoardSkillsV453Dev69();
  assert.equal(morg.v.hp,2000);
  morg.v.x=.8;morg.a.gameTime=1;morg.a.advanceBoardTemporalV453Dev69();
  assert.equal(morg.v.hp,2000);
  morg.v.x=.522;morg.a.gameTime=2;morg.a.advanceBoardTemporalV453Dev69();
  assert.ok(morg.v.hp<2000);
  const clone=Arena.fromSnapshotV40(map,mask,morg.a.snapshotV40());
  assert.equal(checksumV40(morg.a.snapshotV40()),checksumV40(clone.snapshotV40()));
 });
 const zig=setup('Ziggs',team);
 ok(team+' Ziggs mines arm on next tactical second and hit each enemy only once',()=>{
  assert.equal(zig.a.queueKitSkillV42(team,zig.u.id,'E',{x:zig.v.x,y:zig.v.y}).ok,true);
  zig.a.resolveBoardSkillsV453Dev69();
  assert.equal(zig.v.hp,2000);
  zig.a.gameTime=1;zig.a.advanceBoardTemporalV453Dev69();
  const hp=zig.v.hp;assert.ok(hp<2000);
  zig.a.gameTime=2;zig.a.advanceBoardTemporalV453Dev69();
  assert.equal(zig.v.hp,hp);
 });
 const annie=setup('Annie',team);
 ok(team+' Annie R deploys persistent tactical Tibbers aura on the board',()=>{
  assert.equal(annie.a.queueKitSkillV42(team,annie.u.id,'R',{x:annie.v.x,y:annie.v.y}).ok,true);
  annie.a.resolveBoardSkillsV453Dev69();
  assert.ok(annie.a.boardTemporalV453Dev69.some(z=>z.kind==='tibbers_aura'));
  const hp=annie.v.hp;annie.a.gameTime=2;annie.a.advanceBoardTemporalV453Dev69();
  assert.ok(annie.v.hp<hp);
 });
 const miss=setup('MissFortune',team);
 ok(team+' Miss Fortune R channels discrete waves and stops on stun',()=>{
  assert.equal(miss.a.queueDirectionalSkill(team,miss.u.id,'R',{x:.9,y:.5}).ok,true);
  miss.a.resolveBoardSkillsV453Dev69();
  assert.equal(miss.v.hp,2000,'no upfront full channel damage');
  miss.a.gameTime=1;miss.a.advanceBoardTemporalV453Dev69();assert.ok(miss.v.hp<2000);
  const hp=miss.v.hp;
  miss.a.applyEffectV41(miss.u,'stun',{source:miss.v,duration:3});
  miss.a.gameTime=2;miss.a.advanceBoardTemporalV453Dev69();
  assert.equal(miss.v.hp,hp);assert.equal(miss.a.boardTemporalV453Dev69.length,0);
 });
 const sona=setup('Sona',team);
 ok(team+' Sona E gives team mobility instead of invented healing',()=>{
  const hp=sona.ally.hp;
  assert.equal(sona.a.queueKitSkillV42(team,sona.u.id,'E',null).ok,true);
  sona.a.resolveBoardSkillsV453Dev69();
  assert.equal(sona.ally.hp,hp);
  assert.ok(sona.ally.boardSpeedV453Dev69?.until>0);
 });
 const gate=setup('Garen',team);
 const seats=[{seatId:'seatBlue',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'seatRed',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
 const gateway=new AuthoritativeActionsV453Dev47(gate.a,seats);
 gate.a.phase='planning';
 ok(team+' authenticated skill.self respects seat ownership and no upfront spend',()=>{
  const own=team==='blue'?'seatBlue':'seatRed',otherSeat=team==='blue'?'seatRed':'seatBlue';
  const deny=gateway.submit(otherSeat,{sequence:1,kind:'skill.self',unitId:gate.u.id,payload:{slot:'W'}});
  assert.equal(deny.ok,false);
  const accepted=gateway.submit(own,{sequence:1,kind:'skill.self',unitId:gate.u.id,payload:{slot:'W'}});
  assert.equal(accepted.ok,true,accepted.reason);
  assert.equal(gate.u.mana,1000);
  gate.a.resolveBoardSkillsV453Dev69();
  assert.equal(gate.u.boardTemporalV453Dev69,undefined);
  assert.ok(gate.a.effectResolverV41().has(gate.u,'shield'));
 });
 const ultimate=setup('Annie',team);ultimate.a.phase='planning';
 const action=new AuthoritativeActionsV453Dev47(ultimate.a,seats);
 ok(team+' authenticated board R uses the board executor instead of the old special router',()=>{
  const seat=team==='blue'?'seatBlue':'seatRed';
  const accepted=action.submit(seat,{sequence:1,kind:'skill.ultimate',unitId:ultimate.u.id,payload:{point:{x:ultimate.v.x,y:ultimate.v.y}}});
  assert.equal(accepted.ok,true,accepted.reason);
  ultimate.a.resolveBoardSkillsV453Dev69();
  assert.ok(ultimate.a.boardTemporalV453Dev69.some(z=>z.kind==='tibbers_aura'));
 });
}
ok('M11 six temporal shapes are described explicitly rather than certified',()=>{
 for(const [champ,slot] of [['Annie','R'],['Taric','R'],['Morgana','W'],['Veigar','E'],['MissFortune','R'],['Ziggs','E']])
  assert.ok(BOARD_KITS_V453_DEV69[champ][slot].boardTemporal);
});
async function webContract(){
 const server=createPvPServerV453Dev47({tickMs:0});
 const address=await server.listen(0,'127.0.0.1'),root='http://127.0.0.1:'+address.port;
 try{
  const initial=await fetch(root+'/api/kits');assert.equal(initial.status,401);
  const created=await fetch(root+'/api/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({maxSeats:2})});
  assert.equal(created.status,201);const cookie=created.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  const manifest=await fetch(root+'/api/kits',{headers:{cookie}});assert.equal(manifest.status,200);
  const kit=await manifest.json();assert.equal(Object.keys(kit.kits).length,30);
  assert.equal(kit.kits.Taric.R.shape,'circle_ally');
  assert.equal(kit.kits.Vayne.W.passiveOnly,true);
  assert.equal(kit.kits.Ashe.E.shape,'vision_point');
  count++;console.log('✓ M11 authenticated HTTP kit metadata for QWER');
 }finally{await server.close();}
}
await webContract();
console.log('DEV69 M11 '+count+'/'+count+' PASS');
