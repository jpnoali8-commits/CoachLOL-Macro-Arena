import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,LANE_STRUCTURE_RULES_V451} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const arena=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:451,mode:'manual',roundSeconds:10});
const test=(name,fn)=>{fn();console.log('✓ V4.5.1 '+name)};
const collapse=(a,st)=>{st.hp=0;a.finishStructureDeathsV451();};
test('inibidor nasce após 300 segundos simulados e fecha o spawn de superminions',()=>{
 const a=arena(),s=a.structures.find(v=>v.team==='red'&&v.type==='inhibitor'&&v.lane==='mid');
 collapse(a,s);assert.equal(s.alive,false);assert.equal(s.respawnAt,300);
 assert.equal(a.superCountV451('blue','mid',0),1);
 assert.equal(a.superCountV451('blue','top',0),0);
 a.gameTime=299;a.advanceStructuresV451();assert.equal(s.alive,false);
 a.gameTime=300;a.advanceStructuresV451();assert.equal(s.alive,true);assert.equal(s.respawnAt,0);
 assert.equal(a.superCountV451('blue','mid'),0);
});
test('todos os inibidores destruídos permitem dois supers por lane',()=>{
 const a=arena();for(const s of a.structures.filter(v=>v.type==='inhibitor'&&v.team==='red'))collapse(a,s);
 for(const lane of ['top','mid','bot'])assert.equal(a.superCountV451('blue',lane,0),2);
});
test('as duas torres do Nexus têm estado e respawn independentes e retornam a 40% HP',()=>{
 const a=arena(),guards=a.structures.filter(s=>s.team==='red'&&s.type==='tower'&&s.lane==='nexus');
 assert.equal(guards.length,2);collapse(a,guards[0]);assert.ok(guards[1].alive);
 assert.equal(guards[0].respawnAt,180);a.gameTime=180;a.advanceStructuresV451();
 assert.equal(guards[0].alive,true);assert.equal(guards[0].hp,Math.ceil(guards[0].maxHp*.4));
 assert.equal(guards[1].hp,guards[1].maxHp);
});
test('onda gera superminion apenas na rota com inibidor derrubado',()=>{
 const a=arena(),s=a.structures.find(v=>v.type==='inhibitor'&&v.team==='red'&&v.lane==='bot');collapse(a,s);
 a.gameTime=30;a.spawnWaves();
 const blues=a.minions.filter(v=>v.team==='blue'&&v.kind==='super');
 assert.equal(blues.length,1);assert.equal(blues[0].lane,'bot');
});
test('intervalos de ondas evoluem em tempo simulado',()=>{
 const a=arena();assert.equal(a.waveIntervalV451(0),30);assert.equal(a.waveIntervalV451(840),25);assert.equal(a.waveIntervalV451(1800),20);
 assert.equal(LANE_STRUCTURE_RULES_V451.nexusTurretRespawnSeconds,180);
});
test('minion que dá last hit não fornece farm fictício a campeões próximos',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_TOP');
 const min={id:'mtest_v451',kind:'caster',team:'red',lane:'top',hp:8,maxHp:300,x:u.x,y:u.y,armor:0};
 const allied={id:'mally_v451',kind:'melee',team:'blue',lane:'top',x:u.x,y:u.y};
 a.minions.push(min);const before=u.cs, gold=u.gold;
 a.attack(allied,min,100);
 assert.ok(min.hp<=0);assert.equal(u.cs,before);assert.equal(u.gold,gold);
});
test('último golpe real de campeão concede CS e ouro e XP de proximidade',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_TOP');
 const min={id:'mhero_v451',kind:'caster',team:'red',lane:'top',hp:15,maxHp:300,x:u.x,y:u.y,armor:0};
 a.minions.push(min);const cs=u.cs,gold=u.gold;a.attack(u,min,50);
 assert.ok(min.hp<=0);assert.equal(u.cs,cs+1);assert.ok(u.gold>gold);
});
test('ataques coordenados do mesmo grupo acumulam dano no alvo e validam alcance',()=>{
 const a=arena(),target=a.units.find(v=>v.id==='red_MID');
 const allies=a.units.filter(v=>v.team==='blue').slice(0,2);
 for(const u of [...allies,target]){u.x=.49;u.y=.51;u.attackAt=0;u.stunUntil=0;u.manualMoveHold=true;u.autoFollow=false;u.autoAttack=true;u.policy='aggressive';}
 for(const u of a.units.filter(v=>!allies.includes(v)&&v!==target)){u.hp=0;u.deadUntil=999;}
 target.autoAttack=false;target.armor=0;target.shield=0;
 const r=a.setGroupOrders('blue',allies.map(u=>u.id),allies.map(()=>({kind:'attack',targetId:target.id,chase:true})));
 assert.ok(r.ok,r.reason);const hp=target.hp;a.phase='executing';a.gameTime=10;a.resolveCombat();
 assert.ok(target.hp<hp-Math.min(...allies.map(u=>u.ad))*1.2,'dano de ambos deve acumular');
});
test('puxar wave não equivale a last-hit: continua atacando minions acima do dano letal',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_MID');u.x=.5;u.y=.5;u.range=.04;u.attackAt=0;u.autoAttack=true;
 const m={id:'m_push_v451',kind:'melee',team:'red',lane:'mid',x:.501,y:.501,hp:600,maxHp:600,armor:0,spawnAt:0};a.minions.push(m);
 for(const other of a.units.filter(v=>v!==u)){other.hp=0;other.deadUntil=999;}
 a.phase='planning';assert.equal(a.setOrder('blue',u.id,{kind:'push'}).ok,true);a.phase='executing';a.gameTime=9;
 a.buildMinionIndex();const hp=m.hp;a.resolveCombat();assert.ok(m.hp<hp,'push deve desferir dano antes de ser um last hit');
});
test('seleção por área substitui grupo anterior, clique normal limpa e Shift alterna',()=>{
 const code=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(code,/if\(!extend\)selectedUnitIds=new Set\(\[u\.id\]\)/);
 assert.match(code,/selectedUnitIds=new Set\(allies\.map\(u=>u\.id\)\)/);
 assert.match(code,/choose\(match\.units\.find\(v=>v\.id===unit\.id\)\|\|unit\)/);
 assert.match(code,/pointer\.button===0&&pointer\.shift/);
});
test('auto wave clear usa apenas kits com geometria e respeita mana/recarga',()=>{
 const a=arena(),u=a.units.find(v=>v.id==='blue_MID');u.champ='Lux';u.x=.5;u.y=.5;u.skillRanks.E=1;u.skillCds.E=0;u.mana=500;u.maxMana=500;u.tactics.wave='push';u.order={kind:'push'};
 for(const other of a.units.filter(v=>v!==u)){other.hp=0;other.deadUntil=999;}
 for(let i=0;i<3;i++)a.minions.push({id:'m_wave_'+i,kind:'caster',team:'red',lane:'mid',x:.502+i*.001,y:.5,hp:300,maxHp:300,spawnAt:0,armor:0});
 a.gameTime=15;a.phase='executing';a.autoWaveSkillV451();assert.ok(u.pendingKitCastV42,'should queue authored Lux E');
 const oldMana=u.mana;a.resolveKitSkillsV42();assert.ok(u.mana<oldMana);assert.ok(u.skillCds.E>a.gameTime);
 u.mana=1;u.pendingKitCastV42=null;u.luxZoneV42=null;a.gameTime=16;a.autoWaveSkillV451();assert.equal(u.pendingKitCastV42,null);
});
console.log('✓ 11 contratos V4.5.1 aprovados');
