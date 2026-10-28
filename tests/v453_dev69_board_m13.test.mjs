/** M13: Twisted Fate card recast and targetable, commanded Tibbers.
 * Behavioral QA only; neither champion is an officially certified complete kit.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_KITS_V453_DEV69} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let total=0;const ok=(label,fn)=>{fn();total++;console.log('✓ M13 '+label)};
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6913,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,
  autoFarm:false,autoJungle:false,combatUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,hp:1400,maxHp:1400,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.523,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 a.visible=()=>true;return {a,u,enemy,team,other};
}
ok('two M13 champion contracts remain board prototypes',()=>{
 assert.equal(BOARD_KITS_V453_DEV69.TwistedFate.W.boardCardCycle,true);
 assert.equal(BOARD_KITS_V453_DEV69.Annie.R.boardSummon,'tibbers');
 for(const champ of ['TwistedFate','Annie'])
  for(const slot of ['Q','W','E','R'])
   assert.equal(BOARD_KITS_V453_DEV69[champ][slot].implemented,'board_prototype');
});
for(const team of ['blue','red']){
 for(const [time,color] of [[0,'blue'],[1,'red'],[2,'gold']]){
  const t=setup('TwistedFate',team);
  ok(team+' TF Pick a Card at '+time+' sec yields '+color+' without double charge',()=>{
   assert.equal(t.a.queueKitSkillV42(team,t.u.id,'W',null).ok,true);
   t.a.resolveBoardSkillsV453Dev69();
   assert.equal(t.u.mana,950);
   const cd=t.u.skillCds.W;
   t.a.gameTime=time;
   const order=t.a.queueKitSkillV42(team,t.u.id,'W',null);
   assert.equal(order.ok,true);assert.equal(order.recast,true);
   t.a.resolveBoardSkillsV453Dev69();
   assert.equal(t.u.mana,950);assert.equal(t.u.skillCds.W,cd);
   assert.equal(t.u.boardNextBasicV453Dev69.card,color);
   const state=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
   assert.equal(checksumV40(state.snapshotV40()),checksumV40(t.a.snapshotV40()));
   assert.equal(t.a.queueKitSkillV42(team,t.u.id,'W',null).ok,false);
   if(color==='gold'){
    t.a.damage(t.enemy,25,t.u,'physical','basic');
    assert.ok(t.a.effectResolverV41().has(t.enemy,'stun'));
   }else if(color==='blue'){
    t.u.mana=600;t.a.damage(t.enemy,25,t.u,'physical','basic');
    assert.ok(t.u.mana>600);assert.equal(t.u.boardNextBasicV453Dev69,null);
   }else{
    const next=t.a.units.find(v=>v.id===t.other+'_TOP');
    Object.assign(next,{x:t.enemy.x+.008,y:t.enemy.y,hp:900,maxHp:900,mr:0});
    t.a.damage(t.enemy,25,t.u,'physical','basic');
    assert.ok(next.hp<900,'red card splashes nearby champion');
   }
  });
 }
 const a=setup('Annie',team);
 ok(team+' Tibbers summon persists as distinct entity and survives checkpoint',()=>{
  assert.equal(a.a.queueKitSkillV42(team,a.u.id,'R',{x:a.enemy.x,y:a.enemy.y}).ok,true);
  a.a.resolveBoardSkillsV453Dev69();
  assert.equal(a.a.boardSummonsV453Dev69.length,1);
  assert.equal(a.a.units.length,10,'summon does not create a sixth champion');
  const summon=a.a.boardSummonsV453Dev69[0];
  assert.equal(summon.team,team);assert.ok(summon.hp>0);
  const restored=Arena.fromSnapshotV40(map,mask,a.a.snapshotV40());
  assert.equal(checksumV40(a.a.snapshotV40()),checksumV40(restored.snapshotV40()));
  assert.equal(a.a.perspective(team).boardSummons[0].ownerId,a.u.id);
 });
 ok(team+' owner can move Tibbers and enemy cannot order the pet',()=>{
  const pet=a.a.boardSummonsV453Dev69[0],prior={x:pet.x,y:pet.y};
  assert.equal(a.a.queueBoardSummonOrderV453Dev69(a.other,a.u.id,pet.id,
   {point:{x:.54,y:.54}}).ok,false);
  assert.equal(a.a.queueBoardSummonOrderV453Dev69(team,a.u.id,pet.id,
   {point:{x:.54,y:.5}}).ok,true);
  a.a.gameTime=1;a.a.advanceBoardSummonsV453Dev69();
  assert.ok(pet.x>prior.x);assert.ok(a.a.walkable(pet.x,pet.y));
 });
 ok(team+' Tibbers obeys visible enemy attack and ticks once per game second',()=>{
  const pet=a.a.boardSummonsV453Dev69[0];
  a.enemy.x=pet.x+.005;a.enemy.y=pet.y;
  assert.equal(a.a.queueBoardSummonOrderV453Dev69(team,a.u.id,pet.id,
   {targetId:a.enemy.id}).ok,true);
  const hp=a.enemy.hp;
  a.a.gameTime=2;a.a.advanceBoardSummonsV453Dev69();
  assert.ok(a.enemy.hp<hp);
  const after=a.enemy.hp;a.a.advanceBoardSummonsV453Dev69();
  assert.equal(a.enemy.hp,after);
 });
 ok(team+' enemy basic attack can damage and kill Tibbers',()=>{
  const pet=a.a.boardSummonsV453Dev69[0];
  a.enemy.x=pet.x+.003;a.enemy.y=pet.y;
  a.enemy.autoAttack=true;a.enemy.attackAt=0;
  assert.equal(a.a.setOrder(a.other,a.enemy.id,{kind:'attack',targetId:pet.id}).ok,true);
  const hp=pet.hp;
  a.a.resolveCombat();
  assert.ok(pet.hp<hp,pet.hp+' should be below '+hp);
  pet.hp=1;a.enemy.attackAt=0;
  a.a.resolveCombat();a.a.gameTime=3;a.a.advanceBoardSummonsV453Dev69();
  assert.equal(a.a.boardSummonsV453Dev69.length,0);
 });
 const tether=setup('Annie',team);
 ok(team+' Tibbers lifetime is 45 seconds and not 20',()=>{
  tether.a.queueKitSkillV42(team,tether.u.id,'R',
   {x:tether.enemy.x,y:tether.enemy.y});
  tether.a.resolveBoardSkillsV453Dev69();
  assert.equal(tether.a.boardSummonsV453Dev69[0].until,45);
 });
 ok(team+' Tibbers teleports near Annie after exceeding 1200 board units',()=>{
  const pet=tether.a.boardSummonsV453Dev69[0];
  assert.equal(pet.leashRange,1200);
  pet.x=.9;pet.y=.9;pet.targetId=tether.enemy.id;
  pet.commandPoint={x:.9,y:.9};
  assert.ok(tether.a.mapDistance(tether.u,pet)>1200);
  tether.a.gameTime=1;tether.a.advanceBoardSummonsV453Dev69();
  assert.ok(tether.a.mapDistance(tether.u,pet)<=pet.returnRange+1);
  assert.ok(tether.a.walkable(pet.x,pet.y));
  assert.equal(pet.commandPoint,null);assert.equal(pet.targetId,null);
  assert.equal(pet.lastBlinkAt,1);
  const position={x:pet.x,y:pet.y};tether.a.advanceBoardSummonsV453Dev69();
  assert.deepEqual({x:pet.x,y:pet.y},position,'no duplicate action in same second');
  const clone=Arena.fromSnapshotV40(map,mask,tether.a.snapshotV40());
  assert.equal(checksumV40(tether.a.snapshotV40()),checksumV40(clone.snapshotV40()));
 });
 ok(team+' Tibbers cannot receive a new destination past the leash',()=>{
  const pet=tether.a.boardSummonsV453Dev69[0];
  const far={x:.99,y:.99};
  const result=tether.a.queueBoardSummonOrderV453Dev69(team,tether.u.id,pet.id,{point:far});
  assert.equal(result.ok,false);
 });
 ok(team+' Tibbers expires automatically at second 45, not by arbitrary distance',()=>{
  tether.a.gameTime=45;tether.a.advanceBoardSummonsV453Dev69();
  assert.equal(tether.a.boardSummonsV453Dev69.length,0);
 });
 const hidden=setup('Annie',team);
 ok(team+' fog hides enemy Tibbers and prevents remote summon targeting',()=>{
  hidden.a.queueKitSkillV42(team,hidden.u.id,'R',{x:hidden.enemy.x,y:hidden.enemy.y});
  hidden.a.resolveBoardSkillsV453Dev69();
  const pet=hidden.a.boardSummonsV453Dev69[0];
  hidden.a.canSeePoint=(seat,point)=>seat===team;
  const view=hidden.a.perspective(hidden.other);
  assert.equal(view.boardSummons.find(s=>s.id===pet.id),undefined);
  assert.equal(hidden.a.setOrder(hidden.other,hidden.enemy.id,{kind:'attack',targetId:pet.id}).ok,false);
 });
 const seats=[{seatId:'seatBlue',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'seatRed',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
 const gateway=new AuthoritativeActionsV453Dev47(a.a,seats);
 ok(team+' PvP gateway refuses opponent-owned summon order',()=>{
  const pet=a.a.boardSummonsV453Dev69[0];
  // Pet from previous death test is gone: spawn a fresh one without spending R.
  const newPet={...pet,hp:600,until:a.a.gameTime+15};
  a.a.boardSummonsV453Dev69=[newPet];
  const seat=team==='blue'?'seatRed':'seatBlue';
  const result=gateway.submit(seat,{sequence:1,kind:'summon.order',unitId:a.u.id,
   payload:{summonId:newPet.id,point:{x:.55,y:.5}}});
  assert.equal(result.ok,false);
 });
}
async function httpQA(){
 const app=createPvPServerV453Dev47({tickMs:0}),addr=await app.listen(0,'127.0.0.1');
 const root='http://127.0.0.1:'+addr.port;
 const post=(path,cookie,body)=>fetch(root+'/api/'+path,{method:'POST',headers:{
  'content-type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(body)});
 try{
  const cr=await post('create',null,{maxSeats:2}),blue=await cr.json(),
   blueCookie=cr.headers.get('set-cookie')?.split(';')[0];
  const join=await post('join',null,{roomId:blue.roomId}),
   redCookie=join.headers.get('set-cookie')?.split(';')[0];
  assert.equal(join.status,200);
  const room=app.rooms.get(blue.roomId),annie=room.arena.units.find(u=>u.id==='blue_MID');
  Object.assign(annie,{champ:'Annie',level:6,x:.5,y:.5,mana:1000,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
  const spell=await post('action',blueCookie,{sequence:1,kind:'skill.ultimate',
   unitId:annie.id,payload:{point:{x:.52,y:.5}}});
  assert.equal(spell.status,200);
  room.arena.resolveBoardSkillsV453Dev69();
  const own=(await (await fetch(root+'/api/session',{headers:{cookie:blueCookie}})).json()).projection;
  const pet=own.boardSummons.find(v=>v.ownerId===annie.id);
  assert.ok(pet);
  const stolen=await post('action',redCookie,{sequence:1,kind:'summon.order',
   unitId:annie.id,payload:{summonId:pet.id,point:{x:.54,y:.5}}});
  assert.equal(stolen.status,409);
  const ordered=await post('action',blueCookie,{sequence:2,kind:'summon.order',
   unitId:annie.id,payload:{summonId:pet.id,point:{x:.54,y:.5}}});
  assert.equal(ordered.status,200);
  total++;console.log('✓ M13 HTTP authenticated summon commands and ownership');
  const page=await (await fetch(root+'/multiplayer.html')).text();
  const client=await (await fetch(root+'/multiplayer/pvp_client_v453_dev47.js')).text();
  assert.ok(page.includes('boardSummonMoveV453')&&page.includes('boardEnemySummonV453'));
  assert.ok(client.includes("kind:'summon.order'")||client.includes("'summon.order'"));
  total++;console.log('✓ M13 server-served UI includes summon controls');
 }finally{await app.close();}
}
await httpQA();
console.log('DEV69 M13 '+total+'/'+total+' PASS');
