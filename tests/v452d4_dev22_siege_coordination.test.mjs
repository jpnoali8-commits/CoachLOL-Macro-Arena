import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const make=()=>new Arena(map,mask,{seed:22,mode:'bot',roundSeconds:10});
let n=0;function test(label,fn){fn();n++;console.log('✓ DEV22 '+label)}
function point(line,at){const target=at*line.total;for(let i=1;i<line.path.length;i++)if(line.lens[i]>=target){const t=(target-line.lens[i-1])/(line.lens[i]-line.lens[i-1]);return {x:line.path[i-1].x+t*(line.path[i].x-line.path[i-1].x),y:line.path[i-1].y+t*(line.path[i].y-line.path[i-1].y)};}return line.path.at(-1)}
function fakeWave(a,team,lane,progress){const p=point(a.lanes[lane],progress);return {id:`wave_${team}_${lane}`,team,lane,kind:'melee',progress,x:p.x,y:p.y,hp:250,maxHp:250,damage:20,range:.015,interval:1,attackAt:99999,spawnAt:0};}
function tower(a,team,lane,tier){return a.structures.find(s=>s.id===`${team}_${lane}_${tier}`)}

test('antes do tempo de cerco, nenhum agrupamento artificial altera o early farm',()=>{const a=make();a.gameTime=300;tower(a,'red','mid','t1').alive=false;assert.equal(a.botSiegeFocusLaneV452d4Dev22('blue'),null);});
test('macro prioriza rota com torres externas destruídas e não consulta posição inimiga',()=>{
 const a=make();a.gameTime=1200;tower(a,'red','mid','t1').alive=false;
 assert.equal(a.botSiegeFocusLaneV452d4Dev22('blue'),'mid');
 const before=a.botSiegeFocusLaneV452d4Dev22('blue');for(const u of a.units.filter(u=>u.team==='red')){u.x=.03;u.y=.03;}
 assert.equal(a.botSiegeFocusLaneV452d4Dev22('blue'),before);
});
test('bot coordena MID/ADC/SUP sobre wave verdadeira, sem teleporte e sem dano extra',()=>{
 const a=make();a.gameTime=1200;tower(a,'red','mid','t1').alive=false;a.minions=[fakeWave(a,'blue','mid',.72)];
 const before=a.structures.map(s=>s.hp),positions=a.units.map(u=>[u.id,u.x,u.y]);
 a.botPlan('blue');
 for(const role of ['MID','ADC','SUP']){
  const u=a.units.find(u=>u.team==='blue'&&u.role===role);
  assert.equal(u.botSiegeLaneV452d4Dev22,'mid');assert.equal(u.order.kind,'push');
 }
 assert.deepEqual(a.structures.map(s=>s.hp),before);assert.deepEqual(a.units.map(u=>[u.id,u.x,u.y]),positions);
});
test('sem outer aberta, bot mantém funções/rotas originais',()=>{
 const a=make();a.gameTime=1200;a.minions=[fakeWave(a,'blue','mid',.72)];a.botPlan('blue');
 const adc=a.units.find(u=>u.id==='blue_ADC');assert.equal(adc.botSiegeLaneV452d4Dev22,null);
});
test('com wave real avançada e outer destruída, campeão pode alcançar inibidor além de 87%',()=>{
 const a=make(),u=a.units.find(u=>u.id==='blue_MID');a.gameTime=1500;
 const t=tower(a,'red','mid','t1');t.alive=false;t.hp=0;
 a.minions=[fakeWave(a,'blue','mid',.94)];u.order={kind:'push'};u.autoFollow=true;u.explicitOrder=false;u.manualMoveHold=false;u.plan=null;u.awaitingShop=false;u.x=point(a.lanes.mid,.65).x;u.y=point(a.lanes.mid,.65).y;
 const goals=[];a.findPath=(src,dest)=>{goals.push(dest);return [dest]};a.moveAlong=()=>0;
 a.autoAdvanceLane(u,200);
 assert.equal(goals.length,1);assert.ok(a.lineProgress(a.lanes.mid,goals[0])>.87,'o alvo deve passar do limite antigo');
 assert.ok(a.lineProgress(a.lanes.mid,goals[0])<=.965);
});
test('sem wave aliada, o limite de segurança continua evitando dives profundos',()=>{
 const a=make(),u=a.units.find(u=>u.id==='blue_MID');a.gameTime=1500;tower(a,'red','mid','t1').alive=false;
 u.order={kind:'push'};u.autoFollow=true;u.explicitOrder=false;u.manualMoveHold=false;u.plan=null;u.awaitingShop=false;u.x=point(a.lanes.mid,.45).x;u.y=point(a.lanes.mid,.45).y;
 const goals=[];a.findPath=(src,dest)=>{goals.push(dest);return [dest]};a.moveAlong=()=>0;a.minions=[];
 a.autoAdvanceLane(u,200);assert.equal(goals.length,1);assert.ok(a.lineProgress(a.lanes.mid,goals[0])<=.875);
});
test('inibidor e Nexus continuam protegidos pela sequência de estruturas',()=>{
 const a=make(),inib=a.structures.find(s=>s.id==='red_mid_inhibitor'),nexus=a.structures.find(s=>s.id==='red_nexus');
 assert.equal(a.structureVulnerable(inib),false);assert.equal(a.structureVulnerable(nexus),false);
 for(const id of ['t1','t2','t3']){const t=tower(a,'red','mid',id);t.hp=0;t.alive=false;}
 assert.equal(a.structureVulnerable(inib),true);assert.equal(a.structureVulnerable(nexus),false);
 inib.hp=0;inib.alive=false;assert.equal(a.structureVulnerable(nexus),false);
 for(const g of a.structures.filter(s=>s.team==='red'&&s.lane==='nexus'&&s.type==='tower')){g.hp=0;g.alive=false;}
 assert.equal(a.structureVulnerable(nexus),true);
});
test('snapshot mantém foco no cerco e não recalcula dano fantasma',()=>{
 const a=make();a.gameTime=1200;tower(a,'red','mid','t1').alive=false;a.minions=[fakeWave(a,'blue','mid',.7)];a.botPlan('blue');
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(b.units.find(u=>u.id==='blue_ADC').botSiegeLaneV452d4Dev22,'mid');
 assert.deepEqual(b.structures,a.structures);assert.equal(b.botSiegeFocusLaneV452d4Dev22('blue'),a.botSiegeFocusLaneV452d4Dev22('blue'));
});
console.log(`V4.5.2d-4-dev22 ${n}/8 PASS`);
