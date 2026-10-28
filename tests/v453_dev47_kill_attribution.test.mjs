import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const make=()=>new Arena(map,mask,{seed:47});
let count=0;
function test(description,fn){fn();console.log('✓ DEV47 KILL '+description);count++;}
const units=a=>[a.units.find(u=>u.id==='blue_MID'),a.units.find(u=>u.id==='blue_TOP'),a.units.find(u=>u.id==='red_MID')];
function prepared(){const a=make();a.gameTime=100;const [b,ally,v]=units(a);v.hp=350;v.shield=0;v.armor=0;v.mr=0;return {a,b,ally,v};}
const melee={id:'m_blue_test',team:'blue',kind:'melee'};
const turret={id:'blue_mid_tower_test',team:'blue',type:'tower',name:'Torre aliada'};
test('minion finalizador transfere abate e ouro ao ultimo campeao que causou dano',()=>{
 const {a,b,v}=prepared();a.damage(v,25,b);const gold=b.gold;a.gameTime+=5;a.damage(v,500,melee);
 assert.equal(v.hp,0);assert.equal(v.deaths,1);assert.equal(b.kills,1);assert.equal(a.teams.blue.kills,1);assert.equal(b.gold,gold+300);
});
test('kill por torre favorece ultimo dano adversario, mesmo morto',()=>{
 const {a,b,v}=prepared();a.damage(v,10,b);b.hp=0;b.deadUntil=170;a.gameTime+=12;
 a.damage(v,500,turret);assert.equal(v.deaths,1);assert.equal(b.kills,1);assert.equal(a.teams.blue.kills,1);
});
test('kill ambiental de jungler sem atacante preserva autoria dos ultimos 15 s',()=>{
 const {a,b,v}=prepared();a.damage(v,10,b);a.gameTime+=15;a.damage(v,500,null,'physical','jungle_monster');
 assert.equal(b.kills,1);assert.equal(v.deaths,1);
});
test('apos 15 s nao concede kill nem gold, mas registra morte',()=>{
 const {a,b,v}=prepared();a.damage(v,10,b);const gold=b.gold;a.gameTime+=16;a.damage(v,500,null,'physical','jungle_monster');
 assert.equal(b.kills,0);assert.equal(v.deaths,1);assert.equal(b.gold,gold);assert.equal(a.teams.blue.kills,0);
});
test('quando nao existe dano adversario elegivel, minion nao inventa campeao',()=>{
 const {a,b,v}=prepared();a.damage(v,500,melee);assert.equal(v.deaths,1);assert.equal(b.kills,0);assert.equal(a.teams.blue.kills,0);
});
test('ultimo campeao, nao maior dano, recebe o abate',()=>{
 const {a,b,ally,v}=prepared();a.damage(v,125,b);a.gameTime+=3;a.damage(v,15,ally);a.gameTime+=2;a.damage(v,500,melee);
 assert.equal(ally.kills,1);assert.equal(b.kills,0);assert.equal(b.assists,1);
});
test('minion inimigo do campeao vitima nao impede credito ao atacante anterior',()=>{
 const {a,b,v}=prepared();a.damage(v,50,b);a.gameTime+=4;a.damage(v,500,{...melee,team:'red'});
 assert.equal(b.kills,1);
});
test('abate direto por champion continua sendo do finalizador',()=>{
 const {a,b,ally,v}=prepared();a.damage(v,20,b);a.gameTime+=1;a.damage(v,500,ally);
 assert.equal(ally.kills,1);assert.equal(b.kills,0);assert.equal(b.assists,1);
});
test('snapshot preserva contribuicoes e nao duplica morte no replay',()=>{
 const {a,b,v}=prepared();a.damage(v,20,b);const snap=a.snapshotV40(),s=checksumV40(snap);const restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(restored.snapshotV40()),s);restored.gameTime+=4;
 const rb=restored.units.find(u=>u.id===b.id),rv=restored.units.find(u=>u.id===v.id);
 restored.damage(rv,500,melee);restored.damage(rv,500,melee);assert.equal(rb.kills,1);assert.equal(rv.deaths,1);
});
console.log(`DEV47 KILL ${count}/${count} PASS`);
