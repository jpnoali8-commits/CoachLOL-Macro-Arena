import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,movementSpeed,DEFAULT_WORLD_BOUNDS} from '../engine.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const mask=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const fresh=(opts={})=>new Arena(map,mask,{roundSeconds:30,decisionSeconds:30,seed:26,...opts});
let count=0;function test(label,fn){fn();console.log('✓',label);count++}
const round=s=>{s.lock('blue');s.botPlan();s.resolve()};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function emptyPatch(){const clone=structuredClone(mask);clone.wall='0'.repeat(mask.wall.length);clone.brush='0'.repeat(mask.brush.length);return clone;}

test('atlas mantém 22 torres, 2 nexus e cinco campeões por equipe',()=>{
 const s=fresh();assert.equal(s.structures.filter(x=>x.type==='tower').length,22);assert.equal(s.units.length,10);assert.equal(s.structures.filter(x=>x.type==='nexus').length,2);
});
test('ordem de cada um dos 5 campeões é independente e simultânea',()=>{
 const s=fresh(), team=s.units.filter(x=>x.team==='blue');for(const u of team)assert.equal(s.setPolicy('blue',u.id,'balanced'),true);
 for(const u of team){const target=s.findPath(u,{x:.4,y:.75});assert.ok(target,'pathfinding '+u.id);assert.equal(s.setOrder('blue',u.id,{kind:'move',destination:{x:.4,y:.75}}).ok,true);}
 assert.equal(team.filter(x=>x.plan&&!x.plan.completed).length,5);
 round(s);assert.equal(s.round,2);assert.equal(s.roundHistory.at(-1).seconds,30);assert.equal(team.filter(x=>x.plan!==null).length,5);
});
test('movimento persiste após resolução, com orçamento por rodada',()=>{
 const s=fresh();const u=s.units.find(x=>x.id==='blue_ADC');assert.equal(s.setOrder('blue',u.id,{kind:'move',destination:{x:.7,y:.7}}).ok,true);
 s.lock('blue');s.botPlan();s.resolve(3);assert.ok(u.plan);const pos={x:u.x,y:u.y};s.lock('blue');s.botPlan();s.resolve(4);assert.ok(distance(pos,u)>0.00001,'continua em movimento');
 assert.ok(u.spentMove<=s.effectiveMS(u)*4+.001);
});
test('parar rota limpa somente o plano do campeão escolhido',()=>{
 const s=fresh();const a=s.units.find(x=>x.id==='blue_ADC');const b=s.units.find(x=>x.id==='blue_SUP');
 s.setOrder('blue',a.id,{kind:'move',destination:{x:.4,y:.75}});s.setOrder('blue',b.id,{kind:'move',destination:{x:.4,y:.75}});
 assert.ok(s.setOrder('blue',a.id,{kind:'stop'}).ok);assert.equal(a.plan,null);assert.ok(b.plan);
});
test('plano de ações multi-etapas mantém duração e ordem',()=>{
 const s=fresh();const u=s.units.find(x=>x.id==='blue_MID');const p={x:.4,y:.75};const q={x:.55,y:.78};
 assert.equal(s.setPlan('blue',u.id,[{point:p,action:'gank',duration:30},{point:q,action:'farm',duration:90}],'safe').ok,true);
 assert.equal(u.plan.steps.length,2);assert.equal(u.plan.steps[0].duration,30);assert.equal(u.policy,'safe');
});
test('bot vermelho cria ordens pela sua própria visão e compra itens',()=>{
 const s=fresh();s.botPlan();assert.equal(s.teams.red.ready,true);assert.equal(s.units.filter(u=>u.team==='red'&&u.items.length>0).length,5);
});
test('ações não permitem marcar alvo oculto',()=>{
 const s=fresh(),u=s.units.find(u=>u.id==='blue_ADC'),target=s.units.find(u=>u.id==='red_ADC');
 assert.equal(s.visible('blue',target),false);assert.equal(s.setOrder('blue',u.id,{kind:'attack',targetId:target.id}).ok,false);
});
test('fonte de visão inclui aliados, minions, wards e estruturas',()=>{
 const s=fresh();let src=s.visionSources('blue');assert.ok(src.some(x=>x.kind==='champion'));assert.ok(src.some(x=>x.kind==='structure'));
 s.wards.push({x:.51,y:.49,team:'blue',until:95});src=s.visionSources('blue');assert.ok(src.some(x=>x.kind==='ward'));
 const u=s.units.find(x=>x.id==='blue_TOP');assert.equal(s.visible('blue',u),true);
});
test('campeão aliado permanece visível quando atravessa a jungle inimiga',()=>{
 const s=fresh(),u=s.units.find(x=>x.id==='blue_TOP');u.x=.82;u.y=.20;
 assert.equal(s.visible('blue',u),true);assert.ok(s.perspective('blue').units.some(x=>x.id===u.id));
 assert.equal(s.canSeePoint('blue',{x:u.x,y:u.y}),true);
});
test('visão de minion aliado revela ponto próximo',()=>{
 const s=new Arena(map,emptyPatch());s.minions.push({id:'mtest',team:'blue',lane:'bot',x:.73,y:.37,hp:100,spawnAt:0});
 assert.ok(s.visionSources('blue').some(x=>x.kind==='minion'));
 assert.equal(s.canSeePoint('blue',{x:.735,y:.37}),true);
});
test('parede bloqueia linha de visão e fog não revela atrás dela',()=>{
 const s=fresh();const size=mask.size;const m=emptyPatch();const wall=m.wall.split('');
 for(let y=20;y<100;y++)wall[y*size+64]='1';m.wall=wall.join('');s.mask=m;
 s.units.forEach(u=>{u.x=.1;u.y=.4;});s.structures=[];
 assert.equal(s.lineOfSight({x:.35,y:.4},{x:.66,y:.4}),false);
});
test('fog filtra campeão inimigo e oculta plano/ordens',()=>{
 const s=fresh(),enemy=s.units.find(x=>x.id==='red_MID');enemy.x=.92;enemy.y=.17;
 assert.equal(s.perspective('blue').units.some(x=>x.id===enemy.id),false);
 const blue=s.units.find(x=>x.id==='blue_TOP');enemy.x=blue.x+.001;enemy.y=blue.y+.001;
 assert.equal(s.perspective('blue').units.some(x=>x.id===enemy.id),true);
 const serialized=s.perspective('blue').units.find(x=>x.id===enemy.id);
 assert.equal('plan' in serialized,false);assert.equal('order' in serialized,false);
});
test('waves azul/vermelha nascem nas três lanes e têm progressão automática',()=>{
 const s=fresh();round(s);assert.ok(s.waveIndex>=1);assert.equal(new Set(s.minions.map(x=>x.lane)).size,3);assert.equal(new Set(s.minions.map(x=>x.team)).size,2);
 const alive=s.minions.find(m=>m.team==='blue'&&m.lane==='top');const old=alive.progress;round(s);assert.ok(alive.progress>=old);
});
test('tropas inimigas entram em confronto',()=>{
 const s=fresh();const m={id:'mteam',team:'blue',lane:'mid',kind:'melee',progress:.5,x:.5,y:.5,hp:330,maxHp:330,damage:34,range:.03,speed:.004,attackAt:0,interval:1,spawnAt:0};
 const n={...m,id:'menemy',team:'red',x:.505,y:.5,progress:.51};s.minions=[m,n];s.buildMinionIndex();s.resolveCombat();assert.ok(m.hp<330||n.hp<330);
});
test('torre prioriza minion e responde a dive de campeão',()=>{
 const s=fresh(),tower=s.structures.find(x=>x.type==='tower'&&x.team==='red');tower.lastShot=-10;
 const blue=s.units.find(x=>x.id==='blue_TOP'),red=s.units.find(x=>x.id==='red_TOP');blue.x=tower.x+.001;blue.y=tower.y+.001;red.x=tower.x+.002;red.y=tower.y+.002;
 const tHp=red.hp;s.attack(blue,red,100);assert.equal(tower.aggro,blue.id);assert.ok(red.hp<tHp);
 const hp=blue.hp;s.resolveCombat();assert.ok(blue.hp<hp);
});
test('kill por torre não corrompe ouro e kills',()=>{
 const s=fresh(),tower=s.structures.find(x=>x.type==='tower'&&x.team==='red'),blue=s.units.find(x=>x.id==='blue_TOP');
 blue.hp=10;const before=s.teams.red.kills;s.attack(tower,blue,99);assert.equal(blue.hp,0);assert.ok(Number.isFinite(tower.gold??0));assert.equal(s.teams.red.kills,before);
});
test('bot com mesma seed e mesmo estado é determinístico',()=>{
 const a=fresh(),b=fresh();for(let i=0;i<4;i++){round(a);round(b);}const snapshot=s=>JSON.stringify({units:s.units,minions:s.minions,teams:s.teams,round:s.round});assert.equal(snapshot(a),snapshot(b));
});
test('cooldowns e boots afetam o deslocamento sem teleportar pelo mapa',()=>{
 const s=fresh();const u=s.units.find(x=>x.id==='blue_ADC');let speed=s.effectiveMS(u);assert.ok(s.buy('blue',u.id,'boots'));assert.ok(s.effectiveMS(u)>speed);s.setOrder('blue',u.id,{kind:'move',destination:{x:.80,y:.7}});round(s);const pos={x:u.x,y:u.y};round(s);assert.ok(distance(pos,u)<.4);
});
test('marcação visual não cria informação inimiga escondida',()=>{
 const s=fresh();const red=s.units.find(x=>x.id==='red_JG');red.x=.82;red.y=.12;
 const perspective=s.perspective('blue');assert.ok(!perspective.units.find(u=>u.id===red.id));
});
test('jungle com plano de limpeza gera dano e não exige ordem repetida',()=>{
 const s=fresh(),u=s.units.find(x=>x.id==='blue_JG');const c=s.camps.find(x=>x.team==='neutral');assert.ok(c&&Number.isFinite(c.x));
 u.x=c.x+.01;u.y=c.y+.01;c.alive=true;c.health=350;let target={x:u.x,y:u.y};
 assert.ok(s.setPlan('blue',u.id,[{point:target,action:'jungle',duration:45}]).ok);s.advancePlan(u);s.updateObjectives();assert.ok(c.health<350);
});
test('sem exceções ao processar 15 rodadas contra bot',()=>{
 const s=fresh();for(let i=0;i<15&&!s.ended;i++)round(s);assert.ok(s.round>5);assert.ok(s.minions.length<1500);
});
console.log(`\n${count} testes de regressão concluídos`);

// v0.9 — runtime-length turns and world-space movement regression tests
function setSimpleRoute(s){
 const u=s.units.find(x=>x.id==='blue_MID');
 // direct test movement in an isolated empty wall atlas (no accidental detours)
 s.mask=emptyPatch();u.x=.30;u.y=.40;
 u.plan={index:0,completed:false,steps:[{point:{x:.95,y:.40},action:'move',duration:0,startedAt:null,path:[{x:.95,y:.40}]}]};
 u.order={kind:'route'};
 s.round=2; // avoid the one-time first-round deploy
 return u;
}
test('sem dois locks nenhuma ordem é executada',()=>{
 const s=fresh();const t=s.gameTime;s.lock('blue');assert.equal(s.resolve(10),null);assert.equal(s.gameTime,t);assert.equal(s.round,1);
 s.lock('red');assert.ok(s.resolve(10));assert.equal(s.gameTime,t+10);
});
test('ambos confirmam aos 10s: 10s simulados, sem andar durante a escolha',()=>{
 const s=fresh();const u=setSimpleRoute(s);const x=u.x;
 s.lock('blue');assert.equal(u.x,x);s.lock('red');assert.equal(u.x,x);
 s.resolve(10);assert.equal(s.gameTime,10);assert.equal(s.lastResolvedSeconds,10);assert.equal(s.roundHistory.at(-1).seconds,10);
 const walked=s.mapDistance({x:.30,y:.40},u);assert.ok(walked>0);assert.ok(walked<=s.effectiveMS(u)*10+1);
});
test('primeiro lock 10s, segundo 30s: resolve 30s e distância ~3x maior',()=>{
 const a=fresh(),b=fresh();let ua=setSimpleRoute(a),ub=setSimpleRoute(b);
 for(const s of [a,b]){s.lock('blue');s.lock('red')}
 a.resolve(10);b.resolve(30);
 const travelA=a.mapDistance({x:.30,y:.40},ua),travelB=b.mapDistance({x:.30,y:.40},ub);
 assert.ok(travelA>0);assert.ok(travelB>travelA*2.0);
 assert.equal(a.roundHistory[0].seconds,10);assert.equal(b.roundHistory[0].seconds,30);
 assert.equal(b.gameTime,30);assert.equal(a.gameTime,10);
});
test('move speed aplica soft caps e botas +25 reais',()=>{
 assert.equal(movementSpeed(325),325);
 assert.equal(movementSpeed(325,25),350);
 assert.ok(movementSpeed(500)>415 && movementSpeed(500)<500);
 assert.ok(DEFAULT_WORLD_BOUNDS.maxX-DEFAULT_WORLD_BOUNDS.minX>14000);
});
test('timeout aplica limite e grava frame reproduzível',()=>{
 const s=fresh({decisionSeconds:30});s.resolve(999,{timeout:true});
 assert.equal(s.lastResolvedSeconds,30);assert.equal(s.roundHistory.length,1);
 assert.equal(s.roundHistory[0].endGameTime,30);
});

// v1.2: regression coverage for the 6-minute zero-CS/zero-XP failure.
test('idle lane AI advances with waves and earns actual last hits, not fake CS',()=>{
 const s=fresh();const mid=s.units.find(u=>u.id==='blue_MID');const adc=s.units.find(u=>u.id==='blue_ADC');
 for(let i=0;i<12;i++)round(s);
 assert.ok(mid.cs>0,'mid earned real CS');
 assert.ok(adc.cs>0,'adc earned real CS');
 assert.ok(mid.xp>0&&adc.xp>0,'lane deaths award proximity XP');
 assert.ok(mid.level>1&&adc.level>1,'champions level up from XP');
 assert.ok(s.minions.length<350,'waves are not stuck forever');
});
test('XP arrives even when allied minions secure kills; CS does not',()=>{
 const s=fresh(),champ=s.units.find(u=>u.id==='blue_TOP');s.units.filter(u=>u.team==='blue'&&u.id!==champ.id).forEach(u=>{u.x=0;u.y=0});
 champ.x=.50;champ.y=.5;const before=champ.xp;
 const m={id:'mXp',team:'red',lane:'top',kind:'melee',x:.50,y:.50,hp:4,maxHp:465,armor:0};
 const attacker={id:'mAllied',team:'blue',kind:'caster',damage:20};
 s.damage(m,30,attacker);
 assert.equal(champ.cs,0);assert.ok(champ.xp>before);
});
test('automation toggles remain independent of a persistent movement route',()=>{
 const s=fresh(),u=s.units.find(u=>u.id==='blue_ADC');
 assert.ok(s.setOrder('blue',u.id,{kind:'move',destination:{x:.4,y:.75}}).ok);
 const plan=u.plan;
 assert.equal(s.setAutomation('blue',u.id,{autoFarm:false,autoAttack:false}),true);
 assert.equal(u.plan,plan);assert.equal(u.autoFarm,false);assert.equal(u.autoAttack,false);
 assert.equal(s.setAutomation('blue',u.id,{autoFarm:true}),true);assert.equal(u.autoAttack,false);
});
test('losing champion HP creates visible danger alert and death suppresses orders',()=>{
 const s=fresh(),u=s.units.find(u=>u.id==='blue_TOP'),enemy=s.units.find(u=>u.id==='red_TOP');
 s.damage(u,120,enemy);assert.ok(s.lastTacticalAlerts.some(e=>e.kind==='danger'&&e.team==='blue'));
 s.damage(u,5000,enemy);assert.ok(s.lastTacticalAlerts.some(e=>e.kind==='death'&&e.unitId===u.id));
 assert.equal(s.setOrder('blue',u.id,{kind:'move',destination:{x:.2,y:.5}}).ok,false);
});
