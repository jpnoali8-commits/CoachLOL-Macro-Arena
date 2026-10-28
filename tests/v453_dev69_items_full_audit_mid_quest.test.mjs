import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const map=read('../data/coachlol_map_v6.json'),mask=read('../data/masks_128.json');
const mk=()=>new Arena(map,mask,{seed:6901,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const center=(a,u)=>{const path=a.lanes.mid.path,p=path[Math.floor(path.length/2)];u.x=p.x;u.y=p.y;};
const advance=(a,u,seconds)=>{for(let j=0;j<seconds;j++){a.gameTime++;a.b7MidQuestPassive();}};
let passed=0;
function test(name,fn){fn();console.log('PASS audit MID: '+name);passed++;}

test('quest reward is absent until MID quest completes',()=>{
 const a=mk(),u=hero(a),top=hero(a,'blue','TOP');
 assert.deepEqual(a.b7MidQuestStatReward(u),{ad:0,ap:0});
 assert.deepEqual(a.b7MidQuestStatReward(top),{ad:0,ap:0});
 assert.equal(a.b7MidQuestAdd(top,1350),0);
});
test('26.11 reward grants 8% total AP, no permanent AP mutation',()=>{
 const a=mk(),u=hero(a);
 u.ap=250;
 const before=a.elementalStatsV452d3(u).ap;
 a.b7MidQuestAdd(u,1350);
 const after=a.elementalStatsV452d3(u).ap;
 assert.ok(Math.abs(after-before-20)<1e-7);
 assert.equal(u.ap,250);
 assert.equal(a.elementalStatsV452d3(u).ap,after);
});
test('26.11 AD reward uses bonus attack damage, not innate attack damage',()=>{
 const a=mk(),u=hero(a);
 const native=a.elementalStatsV452d3(u).ad;
 u.ad+=75;
 const pre=a.elementalStatsV452d3(u).ad;
 a.b7MidQuestAdd(u,1350);
 const post=a.elementalStatsV452d3(u).ad;
 assert.equal(pre-native,75);
 assert.ok(Math.abs(post-pre-6)<1e-7);
});
test('reward recalculates from items and remains independent for both teams',()=>{
 const a=mk(),blue=hero(a),red=hero(a,'red');
 a.b7MidQuestAdd(blue,1350);
 const base=a.elementalStatsV452d3(blue).ad;
 blue.ad+=50;
 assert.ok(Math.abs(a.elementalStatsV452d3(blue).ad-base-54)<1e-7);
 assert.deepEqual(a.b7MidQuestStatReward(red),{ad:0,ap:0});
 assert.equal(a.b7MidQuestAdd(blue,1),0);
});
test('mid quest needs 1350, with seven T3 rewards only via MID',()=>{
 const a=mk(),u=hero(a);
 u.gold=100000;
 a.b7MidQuestAdd(u,1350);
 for(const id of Object.values(a.b7MidQuestTier3Map())){
  assert.equal(a.canBuy('blue',u.id,id).ok,false,id);
  assert.equal(a.b7MidBootUpgrade(u),false);
 }
});
test('roaming bank accumulates at level >=3, at most 60s from 120s lane',()=>{
 const a=mk(),u=hero(a);center(a,u);u.level=3;
 a.gameTime=65;u.b7MidQuestLastTick=65;
 advance(a,u,120);
 assert.ok(Math.abs(u.b7MidQuestRoamBank-60)<1e-7, String(u.b7MidQuestRoamBank));
 assert.ok(Math.abs(u.b7MidQuestPoints-180)<1e-7);
 advance(a,u,10);
 assert.equal(u.b7MidQuestRoamBank,60);
});
test('banked roaming preserves in-lane passive rate, and expires when consumed',()=>{
 const a=mk(),u=hero(a);center(a,u);u.level=3;
 a.gameTime=65;u.b7MidQuestLastTick=65;
 advance(a,u,120);
 u.x=0;u.y=0;
 assert.equal(a.b7InMidLane(u),false);
 const start=u.b7MidQuestPoints;
 advance(a,u,60);
 assert.ok(Math.abs(u.b7MidQuestPoints-start-90)<1e-7);
 assert.equal(u.b7MidQuestRoamBank,0);
 advance(a,u,3);
 assert.ok(Math.abs(u.b7MidQuestPoints-start-91)<1e-7);
});
test('level 2 cannot bank roaming credit',()=>{
 const a=mk(),u=hero(a);center(a,u);u.level=2;
 a.gameTime=65;u.b7MidQuestLastTick=65;
 advance(a,u,12);
 assert.equal(u.b7MidQuestRoamBank,0);
});
test('completed recall blocks passive quest points for 12 simulated seconds',()=>{
 const a=mk(),u=hero(a);a.phase='planning';a.gameTime=100;
 u.order={kind:'recall',spell:'none'};u.recallProgress=7;u.lastHitAt=-999;
 a.reviveAndMove();
 assert.equal(u.b7MidQuestRecallBlockUntil,112);
 const start=u.b7MidQuestPoints||0;
 u.b7MidQuestLastTick=100;
 advance(a,u,11);
 assert.equal(u.b7MidQuestPoints||0,start);
 advance(a,u,1);
 assert.ok((u.b7MidQuestPoints||0)>start);
});
test('dead MID does not accumulate passive quest points or roaming bank',()=>{
 const a=mk(),u=hero(a);center(a,u);u.level=3;u.hp=0;
 a.gameTime=65;u.b7MidQuestLastTick=65;advance(a,u,20);
 assert.equal(u.b7MidQuestPoints||0,0);
 assert.equal(u.b7MidQuestRoamBank||0,0);
});
test('snapshot restore preserves role quest bank and derived reward without double applying',()=>{
 const a=mk(),u=hero(a);center(a,u);u.level=3;u.ad+=40;u.ap+=150;
 a.gameTime=65;u.b7MidQuestLastTick=65;advance(a,u,50);
 a.b7MidQuestAdd(u,1350);
 const rewardBefore=a.elementalStatsV452d3(u);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40()),v=hero(b);
 assert.equal(v.b7MidQuestComplete,true);
 assert.equal(v.b7MidQuestRoamBank,25);
 const rewardAfter=b.elementalStatsV452d3(v);
 assert.equal(rewardAfter.ad,rewardBefore.ad);
 assert.equal(rewardAfter.ap,rewardBefore.ap);
 assert.equal(b.elementalStatsV452d3(v).ap,rewardAfter.ap);
});
console.log('MID ROLE QUEST AUDIT '+passed+'/'+passed+' PASS');
