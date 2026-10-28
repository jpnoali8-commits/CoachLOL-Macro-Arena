import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,checksumV40,canonicalStateV40} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const fresh=()=>new Arena(map,mask,{seed:314159,roundSeconds:10});
const test=(name,fn)=>{fn();console.log('✓ V4.0 '+name)};

test('commit atômico recusa mana/rank/alcance inválidos sem efeitos ou jornal',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_SUP'),v=a.units.find(x=>x.id==='red_MID');u.skillRanks.W=1;
 a.visible=()=>true;u.x=.4;u.y=.5;v.x=.85;v.y=.5;
 const before={mana:u.mana,cd:u.skillCds.W,count:a.actionJournalV40.length};
 const fail=a.performActionV40({actorId:u.id,kind:'skill',slot:'W',targetId:v.id});
 assert.equal(fail.ok,false);assert.equal(fail.reason,'fora_de_alcance');
 assert.equal(u.mana,before.mana);assert.equal(u.skillCds.W,before.cd);assert.equal(a.actionJournalV40.length,before.count);
 u.x=v.x-.001;u.y=v.y;u.mana=0;assert.equal(a.performActionV40({actorId:u.id,slot:'W',targetId:v.id}).reason,'mana');
 assert.equal(a.actionJournalV40.length,before.count);
});

test('mesmo segundo/slot não aplica mana nem cooldown em duplicidade',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_SUP');u.skillRanks.W=1;
 const initial=u.mana;
 const first=a.performActionV40({actorId:u.id,kind:'skill',slot:'W',source:'manual'});
 assert.ok(first.ok);assert.equal(initial-u.mana,70);
 const repeat=a.performActionV40({actorId:u.id,kind:'skill',slot:'W',source:'reaction'});
 assert.equal(repeat.ok,false);assert.equal(initial-u.mana,70);
 assert.equal(a.actionJournalV40.filter(x=>x.kind==='skill').length,1);
 a.gameTime=10;assert.ok(a.performActionV40({actorId:u.id,slot:'W'}).ok);
 assert.equal(a.actionJournalV40.filter(x=>x.kind==='skill').length,2);
});

test('AH modifica temporização de cooldown; 1x/2x não cria casts extras',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_SUP');u.skillRanks.W=1;u.abilityHaste=100;
 const result=a.performActionV40({actorId:u.id,slot:'W'});assert.ok(result.ok);
 assert.equal(result.cooldownEndsAt,5);
 a.gameTime=4;assert.equal(a.performActionV40({actorId:u.id,slot:'W'}).ok,false);
 a.gameTime=5;assert.ok(a.performActionV40({actorId:u.id,slot:'W'}).ok);
});

test('Gank e intenção de habilidade na fog só aparecem para equipe proprietária',()=>{
 const a=fresh(),jg=a.units.find(x=>x.id==='blue_JG'),enemy=a.units.find(x=>x.id==='red_MID');
 a.visible=(team,u)=>u.team===team;
 a.recordIntentV40('blue',jg.id,'gank',{point:{x:.5,y:.5},targetId:enemy.id});
 assert.ok(a.journalForV40('blue')[0]?.payload?.point);
 assert.equal(a.journalForV40('red').length,0);
 const cast=a.performActionV40({actorId:jg.id,kind:'tactical',type:'sustain',source:'hidden',cooldownOverride:12});assert.ok(cast.ok);
 assert.equal(a.journalForV40('red').length,0);
 a.canSeePoint=()=>true;a.gameTime=20;
 assert.ok(a.performActionV40({actorId:jg.id,kind:'tactical',type:'shield',cooldownOverride:1}).ok);
 const log=a.journalForV40('red');assert.equal(log.length,1);
 assert.deepEqual(Object.keys(log[0]).sort(),['actorId','kind','round','seq','team','time','type','slot'].sort());
 assert.ok(!JSON.stringify(log).includes('targetId'));
 assert.ok(!JSON.stringify(log).includes('point'));
});

test('feitiços compartilhados: valida equipamento, alcance, recarga e não gasta com erro',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_SUP'),enemy=a.units.find(x=>x.id==='red_ADC');
 a.visible=()=>true;u.summonerSpell='ignite';u.x=.4;u.y=.5;enemy.x=.65;enemy.y=.5;
 assert.equal(a.performActionV40({actorId:u.id,kind:'summoner',type:'ignite',targetId:enemy.id}).reason,'fora_de_alcance');
 assert.equal(u.igniteCd,0);
 enemy.x=.403;enemy.y=.5;
 assert.equal(a.performActionV40({actorId:u.id,kind:'summoner',type:'barrier'}).reason,'feitiço_não_equipado');
 assert.ok(a.performActionV40({actorId:u.id,kind:'summoner',type:'ignite',targetId:enemy.id}).ok);
 assert.equal(u.igniteCd,180);
 assert.equal(a.performActionV40({actorId:u.id,kind:'summoner',type:'ignite',targetId:enemy.id}).ok,false);
});

test('save/resume preserva estado da RNG, ações, journal e estado de mundo',()=>{
 const a=fresh();a.phase='executing';a.gameTime=20;
 const u=a.units.find(x=>x.id==='blue_SUP');u.skillRanks.W=1;
 a.performActionV40({actorId:u.id,slot:'W'});
 // Advance RNG once before snapshot; a new instance must reproduce its NEXT values.
 a.rng();const snap=a.snapshotV40();
 const restored=Arena.fromSnapshotV40(map,mask,JSON.parse(JSON.stringify(snap)));
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
 assert.equal(a.rng(),restored.rng());
 for(let step=0;step<6;step++){a.gameTime++;restored.gameTime++;a.tick();restored.tick();}
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(restored.snapshotV40()));
 assert.deepEqual(a.validateInvariants(),restored.validateInvariants());
});

test('Vex R2 tem registro próprio sem descontar mana nem resetar R',()=>{
 const a=fresh(),vex=a.units.find(x=>x.id==='red_MID'),foe=a.units.find(x=>x.id==='blue_MID');
 vex.champ='Vex';vex.skillRanks.R=1;vex.mana=500;vex.vexMark={targetId:foe.id,until:20};foe.x=.5;foe.y=.5;vex.x=.49;vex.y=.49;
 vex.skillCds.R=100;const cd=vex.skillCds.R,mana=vex.mana;
 vex.queuedVexRecast=true;a.resolveDirectionalSkills();
 assert.equal(vex.mana,mana);assert.equal(vex.skillCds.R,cd);
 assert.ok(a.actionJournalV40.some(e=>e.kind==='recast'&&e.actorId===vex.id));
 assert.equal(vex.vexMark,null);
});

test('navegador e Node usam a MESMA implementação do core e checksum',()=>{
 const browser=readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');
 const context={window:{}};vm.runInNewContext(browser,context,{timeout:5000});
 const browserEngine=context.window.CoachArena;
 const a=fresh(),b=new browserEngine.Arena(map,mask,{seed:314159,roundSeconds:10});
 assert.equal(checksumV40(a.snapshotV40()),browserEngine.checksumV40(b.snapshotV40()));
 const aj=a.units.find(x=>x.id==='blue_SUP');aj.skillRanks.W=1;
 const bj=b.units.find(x=>x.id==='blue_SUP');bj.skillRanks.W=1;
 a.performActionV40({actorId:aj.id,slot:'W'});b.performActionV40({actorId:bj.id,slot:'W'});
 assert.equal(checksumV40(a.snapshotV40()),browserEngine.checksumV40(b.snapshotV40()));
 assert.equal(canonicalStateV40({b:2,a:1}),canonicalStateV40({a:1,b:2}));
});
