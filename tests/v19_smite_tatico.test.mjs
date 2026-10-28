import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const originalMap=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const fresh=()=>new Arena(structuredClone(originalMap),mask,{mode:'manual',roundSeconds:10});
const test=(name,fn)=>{fn();console.log('✓ '+name);};
const pick=(a,kind,lower=true)=>a.camps.filter(c=>c.timerKey===kind).sort((x,y)=>lower?y.y-x.y:x.y-y.y)[0];
const prepare=()=>{const a=fresh(),u=a.units.find(x=>x.id==='blue_JG');a.buy('blue',u.id,'jungle_mosstomper');const red=pick(a,'red');u.x=red.x;u.y=red.y;return {a,u};};
test('JG compra o pet e recebe 1 carga, ganhando a segunda aos 48s',()=>{
 const {a,u}=prepare();assert.equal(u.smiteCharges,1);a.gameTime=47;a.recoverSmite(u);assert.equal(u.smiteCharges,1);
 a.gameTime=48;a.recoverSmite(u);assert.equal(u.smiteCharges,2);
});
test('Smite red HP 600: não usa aos 700, só usa quando <=600',()=>{
 const {a,u}=prepare(),red=pick(a,'red');red.alive=true;red.spawnCycle=1;
 assert.equal(a.setSmitePolicy('blue',u.id,{mode:'targets',rules:[{targetId:red.id,hpThreshold:600}]}).ok,true);
 a.gameTime=50;a.recoverSmite(u);
 red.health=700;assert.equal(a.useSmite(u,red),0);assert.equal(u.smiteCharges,2);
 red.health=600;assert.equal(a.useSmite(u,red),600);assert.equal(u.smiteCharges,1);
 assert.ok(a.events.some(e=>e.kind==='smite_cast'&&e.text.includes('600 HP')));
 red.health=500;a.gameTime=66;assert.equal(a.useSmite(u,red),0,'não repetir na mesma aparição');
 red.spawnCycle++;assert.equal(a.useSmite(u,red),600,'configuração permanente quando o monstro renasce');
});
test('Somente red: krugs e blue nunca consomem cargas, mesmo dentro do range',()=>{
 const {a,u}=prepare(),red=pick(a,'red'),krugs=pick(a,'krugs'),blue=pick(a,'blue');a.gameTime=50;a.recoverSmite(u);
 for(const c of [red,krugs,blue]){c.alive=true;c.spawnCycle=1;c.health=400;}
 assert.equal(a.setSmitePolicy('blue',u.id,{mode:'targets',rules:[{targetId:red.id,hpThreshold:600}]}).ok,true);
 const charges=u.smiteCharges;assert.equal(a.useSmite(u,krugs),0);assert.equal(a.useSmite(u,blue),0);
 assert.equal(u.smiteCharges,charges);assert.equal(a.useSmite(u,red),600);
});
test('Guardar Smite: nunca dispara, nem com o alvo abaixo do dano',()=>{
 const {a,u}=prepare(),red=pick(a,'red');red.alive=true;red.health=200;
 assert.equal(a.setSmitePolicy('blue',u.id,{mode:'hold',rules:[]}).ok,true);
 a.gameTime=50;a.recoverSmite(u);assert.equal(a.useSmite(u,red),0);assert.equal(u.smiteCharges,2);
});
test('Patamar explícito acima do dano do Golpear ainda é decisão válida',()=>{
 const {a,u}=prepare(),red=pick(a,'red');red.alive=true;red.spawnCycle=1;red.health=900;
 a.gameTime=50;a.recoverSmite(u);a.setSmitePolicy('blue',u.id,{mode:'targets',rules:[{targetId:red.id,hpThreshold:900}]});
 assert.equal(a.useSmite(u,red),600,'usa o dano real, sem executar instantaneamente se HP > 600');
});
test('Danos de jungle são dedicados ao monstro da ordem, sem atacar acampamento adjacente',()=>{
 const map=structuredClone(originalMap);let ref=new Arena(map,mask),red=pick(ref,'red'),krugs=pick(ref,'krugs');
 const redObj=map.objects.find(o=>o.id===red.objectId),krugObj=map.objects.find(o=>o.id===krugs.objectId);
 krugObj.x=redObj.x;krugObj.y=redObj.y;
 const a=new Arena(map,mask),u=a.units.find(x=>x.id==='blue_JG');a.buy('blue',u.id,'jungle_mosstomper');
 const target=a.camps.find(c=>c.id===red.id),other=a.camps.find(c=>c.id===krugs.id);
 u.x=target.x;u.y=target.y;u.order={kind:'jungle',targetId:target.id};
 for(const v of a.units.filter(v=>v!==u))v.order={kind:'stop'};
 a.gameTime=125;a.phase='executing';a.updateObjectives();
 assert.ok(target.health<target.maxHealth,'dano repetido de ataques normais continua');assert.equal(other.health,other.maxHealth,'campo adjacente não foi atacado por engano');
});
test('texto combinado path e smite com HP não duplica o red na rota',()=>{
 const {a,u}=prepare(),preview=interpretCommands('JG red de baixo depois krugs de baixo, golpear red de baixo com 600 hp',a);
 assert.equal(preview.ok,true,JSON.stringify(preview.errors));
 const actions=preview.commands[0].actions,route=actions.find(a=>a.type==='plan').payload;
 assert.deepEqual(route.map(v=>a.camps.find(c=>c.id===v.targetId).timerKey),['red','krugs']);
 assert.equal(actions.find(a=>a.type==='smitePolicy').payload.rules[0].hpThreshold,600);
 assert.equal(applyCommands(preview,a).ok,true);
 assert.equal(u.plan.steps.length,2);
 assert.equal(u.smitePolicy.mode,'targets');
 a.round++;assert.equal(u.smitePolicy.rules[0].hpThreshold,600,'permanece na próxima rodada');
});
test('texto suporta dragão, vários alvos, guardar e Smite automático',()=>{
 const {a,u}=prepare();
 for(const text of ['JG golpear red aos 600 hp e smite blue com 400 hp', 'JG smite apenas no dragao com 1200 de vida','JG guardar smite','JG smite automatico']){
  const preview=interpretCommands(text,a);assert.equal(preview.ok,true,`${text}: ${JSON.stringify(preview.errors)}`);
  assert.equal(applyCommands(preview,a).ok,true,JSON.stringify(preview.errors));
 }
 assert.equal(u.smitePolicy.mode,'auto');
});
test('comando incompleto e função que não é JG são bloqueados antes de aplicar',()=>{
 const {a}=prepare();
 for(const text of ['JG golpear com 600 hp','ADC golpear red com 600 hp','JG golpear red com 0 hp']){
  const preview=interpretCommands(text,a);assert.equal(preview.ok,false,text);
 }
});
test('planejamento pronto impede mudança de Smite em plena execução',()=>{
 const {a,u}=prepare();a.teams.blue.ready=true;
 assert.equal(a.setSmitePolicy('blue',u.id,{mode:'hold',rules:[]}).ok,false);
});
test('Loja e skill QWER continuam independentes da regra do Golpear',()=>{
 const {a,u}=prepare();
 a.upgradeSkill('blue',u.id,'Q');const rank=u.skillRanks.Q,items=[...u.items];
 assert.equal(a.setSmitePolicy('blue',u.id,{mode:'hold',rules:[]}).ok,true);
 assert.equal(u.skillRanks.Q,rank);assert.deepEqual(u.items,items);
});
test('Disputa simultânea de campo: Golpear vence o AA mesmo com ordem alfabética azul primeiro',()=>{
 const {a,u:blue}=prepare(),red=a.units.find(x=>x.id==='red_JG'),camp=pick(a,'red');
 a.buy('red',red.id,'jungle_scorchclaw');
 const status=a.setSmitePolicy('red',red.id,{mode:'targets',rules:[{targetId:camp.id,hpThreshold:600}]});assert.equal(status.ok,true);
 a.setSmitePolicy('blue',blue.id,{mode:'hold',rules:[]});
 blue.order={kind:'jungle',targetId:camp.id};red.order={kind:'jungle',targetId:camp.id};
 blue.x=red.x=camp.x;blue.y=red.y=camp.y;
 for(const v of a.units.filter(v=>v!==blue&&v!==red))v.order={kind:'stop'};
 camp.alive=true;camp.health=50;camp.spawnCycle=1;
 a.gameTime=120;a.phase='executing';a.updateObjectives();
 assert.equal(camp.alive,false);assert.equal(camp.lastClearTeam,'red','Smite mais forte vence disputa no mesmo tick, não o primeiro ID');
 assert.equal(red.smiteCharges,1);
});
console.log('12 contratos de Smite tático v1.9 aprovados');
