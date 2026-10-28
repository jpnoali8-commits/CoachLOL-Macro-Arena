import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const rd=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=rd('coachlol_map_v6.json'),mask=rd('masks_128.json');
const make=()=>new Arena(map,mask,{seed:25,mode:'bot',roundSeconds:10});
const check=(name,fn)=>{fn();console.log('✓ DEV25 '+name);};
const referenceNearby=(a,p,r)=>{const b=new Map(),cell=.035;
 for(const m of a.minions){if(m.hp<=0||m.spawnAt>a.gameTime)continue;const key=Math.floor(m.x/cell)+','+Math.floor(m.y/cell);if(!b.has(key))b.set(key,[]);b.get(key).push(m);}
 const out=[],xx=Math.floor(p.x/cell),yy=Math.floor(p.y/cell),reach=Math.ceil(r/cell);
 for(let y=yy-reach;y<=yy+reach;y++)for(let x=xx-reach;x<=xx+reach;x++)for(const m of b.get(x+','+y)||[])if(m.hp>0&&Math.hypot(m.x-p.x,m.y-p.y)<=r)out.push(m);
 return out.map(m=>m.id);
};
const referenceBlocker=(a,minion)=>{
 const line=a.lanes[minion.lane],forward=minion.team==='blue'?1:-1;
 const candidates=a.structures.filter(o=>o.alive&&o.team!==minion.team&&a.structureVulnerable(o)&&
  ((o.type==='tower'&&o.lane===minion.lane)||(o.type==='inhibitor'&&o.lane===minion.lane)||
   ((o.lane==='nexus'||o.type==='nexus')&&a.structures.filter(v=>v.team===o.team&&v.alive&&v.lane===minion.lane&&v.type!=='nexus').length===0)));
 const ahead=candidates.map(o=>({s:o,p:a.lineProgress(line,o)})).filter(o=>forward*(o.p-minion.progress)>-.035);
 ahead.sort((x,y)=>forward*(x.p-y.p));return ahead[0]||null;
};
check('consultas espaciais dão os mesmos minions e ordem do índice antigo',()=>{
 const a=make();a.gameTime=1200;a.minions=[];
 for(let k=0;k<220;k++)a.minions.push({id:'m'+k,x:.05+((k*29)%87)/100,y:.04+((k*53)%91)/100,hp:k%13===0?0:80,spawnAt:k%17===0?1300:0,team:k%2?'red':'blue',lane:['top','mid','bot'][k%3]});
 a.buildMinionIndex();
 for(let k=0;k<120;k++){const pt={x:.018+((k*37)%91)/100,y:.019+((k*47)%91)/100},radius=[.015,.035,.05,.105,.13,.25][k%6];
  assert.deepEqual(a.nearbyMinions(pt,radius).map(m=>m.id),referenceNearby(a,pt,radius),`${k} ${radius}`);
 }
});
check('o índice mantém filtros por HP e momento do spawn',()=>{
 const a=make();a.gameTime=200;a.minions=[
 {id:'active',x:.5,y:.5,hp:100,spawnAt:0},
 {id:'dead',x:.5,y:.5,hp:0,spawnAt:0},
 {id:'notspawned',x:.5,y:.5,hp:100,spawnAt:201}
 ];a.buildMinionIndex();assert.deepEqual(a.nearbyMinions({x:.5,y:.5},.05).map(m=>m.id),['active']);
 a.gameTime=201;a.buildMinionIndex();assert.deepEqual(a.nearbyMinions({x:.5,y:.5},.05).map(m=>m.id),['active','notspawned']);
});
check('bloqueador da rota mantém vulnerabilidade e alvo original',()=>{
 const a=make();
 for(const team of ['blue','red'])for(const lane of ['top','mid','bot'])for(const t of [.1,.25,.4,.6,.8,.98]){
  const m={team,lane,progress:t};
  const before=referenceBlocker(a,m),after=a.laneBlocker(m);
  assert.equal(after?.s.id??null,before?.s.id??null,`${team}:${lane}:${t}`);
  assert.equal(after?.p??null,before?.p??null);
 }
});
check('cache da rota só existe durante o movimento e é invalidado',()=>{
 const a=make();a.gameTime=1200;
 a.minions=[{id:'mcache',team:'blue',lane:'mid',kind:'melee',progress:.43,x:.43,y:.43,hp:200,maxHp:200,spawnAt:0,speed:0,range:.015,damage:20}];
 a.buildMinionIndex();a.moveMinions();assert.equal(a._laneBlockerCacheV452d4Dev25,null);
 const t=a.structures.find(s=>s.id==='red_mid_t1');const old=a.laneBlocker({team:'blue',lane:'mid',progress:.1});
 t.alive=false;
 const updated=a.laneBlocker({team:'blue',lane:'mid',progress:.1});
 assert.notEqual(old?.s.id??null,updated?.s.id??null);
});
check('estados do combate seguem serializáveis sem caches temporários',()=>{
 const a=make();a.gameTime=800;a.buildMinionIndex();a.moveMinions();
 const ss=a.snapshotV40(), b=Arena.fromSnapshotV40(map,mask,ss);
 assert.equal(b.gameTime,a.gameTime);assert.ok(b._laneBlockerCacheV452d4Dev25==null);
 assert.equal(b.units.length,a.units.length);
});
console.log('DEV25 5/5 PASS');
