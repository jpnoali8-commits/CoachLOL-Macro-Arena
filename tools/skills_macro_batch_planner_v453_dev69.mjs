/**
 * M19 bulk Skills production planner (173 champions, P+QWER).
 *
 * Uses official Riot 16.21.1 champion files ALREADY in this repository,
 * plus the actual abilityRule() dispatcher. Strictly read-only toward engine.
 * Text keyword groups are planning hints only: not executable mechanics,
 * not official Riot behavior classifications, NOT champion certification.
 *
 * node tools/skills_macro_batch_planner_v453_dev69.mjs --out docs/skills_macro_batches_dev69
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {abilityRule,CHAMPION_BASE_ROSTER_V453_DEV69} from '../engine.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const championRoot=join(root,'data/riot_reference/source_16_21_1/riot/16.21.1/en_US/champion');
const batchSize=35;
// M20: release package identities are immutable after M19 planning. Rebalancing
// from new training counts could silently move unfinished champions between
// B01-B05, erasing the milestone's reproducible QA scope.
const MACRO_B01_B05_FIXED_V453=Object.freeze([
 'Corki,Cassiopeia,Karthus,Seraphine,Xerath,Zac,Zilean,Yunara,Alistar,Gragas,LeeSin,Lulu,Mel,Rell,Sejuani,Sett,TahmKench,Galio,Locke,Lucian,Milio,Quinn,Syndra,Urgot,Varus,Viktor,Fizz,JarvanIV,MasterYi,Shen,Vi,Braum,Heimerdinger,Kassadin,KogMaw'.split(','),
 'Lissandra,Pantheon,RekSai,Riven,Trundle,Diana,Naafiri,Nautilus,Rumble,Udyr,Velkoz,Hecarim,Karma,Kennen,Sion,Swain,Taliyah,Zyra,Aatrox,Ambessa,Lillia,Nocturne,Zaahen,Skarner,Smolder,Graves,Gwen,Volibear,Zeri,Anivia,Illaoi,Malzahar,Poppy,Bard,Ivern'.split(','),
 'Kayle,Ryze,Yorick,Belveth,Aurora,Ornn,KSante,Tryndamere,Rakan,Xayah,Draven,Nunu,Orianna,Vladimir,Fiddlesticks,Katarina,Nilah,Singed,Fiora,Samira,Renata,Zed,Kindred,Yone,Ekko,Gangplank,Thresh,Kled,Leblanc,Qiyana,Yasuo,Camille,Yuumi,Mordekaiser,Jayce'.split(','),
 'Briar,Kalista,Kayn,Gnar,Hwei,Azir,Sylas,AurelionSol,Aphelios,Caitlyn,Evelynn,Twitch,Senna,Pyke,Kaisa,Zoe,Akali,Maokai,MonkeyKing,Talon,Rengar,Khazix,Akshan,Neeko,Viego,Jhin,Teemo,Shaco,Nasus,Sivir,Rammus,Amumu,Annie,Chogath,Morgana'.split(','),
 'Soraka,TwistedFate,Jinx,Sona,Leona,Olaf,Warwick,Brand,Ezreal,Garen,Lux,MissFortune,Taric,Tristana,XinZhao,Blitzcrank,Jax,Malphite,Veigar,Darius,Ahri,DrMundo,Nami,Ziggs,Janna,Ashe,Irelia,Vayne,Nidalee,Vex,Renekton,Shyvana,Elise'.split(',')
]);

const slots=['Q','W','E','R'];
const regroups=[
 ['recast',/\brecast\b|cast again|cast a second|cast a third|three times|reactivat|reset (?:its|the|this)/i],
 ['transform',/transform|change form|different form|alternate form|evolve|possess|steals? (?:an? )?ultimate|switches? forms?/i],
 ['pet_clone',/clone|summon|pet\b|turret|soldier|spiderling|tentacle|plants?|shadow clone/i],
 ['stealth',/invisib|camouflag|stealth|conceal|disguis/i],
 ['terrain_realm',/terrain|wall|brush|portal|realm|dimensio|obstacle/i],
 ['movement',/dash|blink|leap|jump|teleport|charge toward|lunge/i],
 ['crowd_control',/stun|root|slow|silenc|charm|fear|knock|sleep|taunt|suppress|pulls? (?:the|an|enemies)/i],
 ['projectile',/projectile|throw|shot|launch|fires? |bolt|missile|arrow/i],
 ['defense',/heal|shield|invulnerab|untargetable|absorb|restore health/i],
 ['stacks_marks',/stack|mark|charge|empower|passive/i],
];
const clean=str=>String(str||'').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
const complexityWeight={transform:8,terrain_realm:7,pet_clone:6,recast:5,stealth:5,stacks_marks:3,movement:2,crowd_control:2,projectile:1,defense:1};
// Scheduling estimates only. Data Dragon tooltip text omits important mechanics
// (e.g. Hwei's 10 forms, Aphelios weapon cycling and Sylas spell theft).
// Do not let keyword heuristics put these high-risk kits into the "easy" batch.
const schedulingRiskOverrides=Object.freeze({
 Aphelios:100,Hwei:95,Sylas:90,Viego:90,Kalista:85,
 AurelionSol:80,Kayn:80,Azir:80,Gangplank:75,Gnar:75,
 Qiyana:75,Ekko:70,Jayce:70,Kled:70,Yuumi:70,
 Yasuo:65,Yone:65,Akshan:65,LeBlanc:65,Leblanc:65,
 Shaco:65,Neeko:65,Kindred:65,Samira:60,Nilah:60,
 Singed:60,Fiora:60,Katarina:60,Fiddlesticks:60,
 Nunu:55,Orianna:55,Zed:55,Vladimir:55,Draven:50,
 Rakan:50,Xayah:50,Tryndamere:50,Mordekaiser:75,
 Camille:65,Briar:70,Renata:55,Thresh:65,
});

const sourceFiles=new Map(readdirSync(championRoot).filter(f=>f.endsWith('.json'))
 .map(f=>[f.replace(/\.json$/,'').toLowerCase(),f]));
const refFor=name=>{
 const fname=sourceFiles.get(name.toLowerCase())||
  sourceFiles.get(({wukong:'monkeyking',renataglasc:'renata',nunuwillump:'nunu'})[name.toLowerCase()]||'');
 if(!fname)throw Error('Riot source missing for '+name);
 const json=JSON.parse(readFileSync(join(championRoot,fname),'utf8'));
 const data=json.data?.[Object.keys(json.data||{})[0]];
 if(!data||data.spells?.length!==4||!data.passive)throw Error('Incomplete Riot source '+name);
 return {id:data.id||name,source:fname,passive:data.passive,spells:data.spells};
};
export function buildMacroBatches(){
 const names=Object.keys(CHAMPION_BASE_ROSTER_V453_DEV69).sort();
 assert.equal(names.length,173,'Unexpected frozen roster; re-audit target size');
 const roster=names.map(name=>{
  const r=refFor(name);const abilities=[];
  const passive={slot:'P',name:r.passive.name,description:clean(r.passive.description)};
  let fallback=0;const mechanics=new Set();
  for(let i=0;i<4;i++){
   const slot=slots[i],official=r.spells[i],rule=abilityRule({champ:name,skillRanks:{Q:1,W:1,E:1,R:1}},slot);
   assert.ok(rule&&rule.kind,'No rule for '+name+' '+slot);
   const training=rule.kind==='training';
   if(training)fallback++;
   const description=clean(official.description);
   const hints=regroups.filter(([,regex])=>regex.test(description)).map(([k])=>k);
   for(const hint of hints)mechanics.add(hint);
   abilities.push({slot,riotId:official.id,name:official.name,description,
    referenceCooldown:official.cooldown,referenceRange:official.range,
    runtimeKind:rule.kind,runtimeShape:rule.shape||null,
    status:training?'TRAINING_FALLBACK':'ROUTED_UNVERIFIED',mechanicHints:hints});
  }
  for(const [,regex] of regroups)regex.lastIndex=0;
  const passiveHints=regroups.filter(([,regex])=>regex.test(passive.description)).map(([k])=>k);
  for(const hint of passiveHints)mechanics.add(hint);
  const weight=[...mechanics].reduce((s,k)=>s+(complexityWeight[k]||0),0)+(schedulingRiskOverrides[name]||0);
  return {champion:name,officialId:r.id,source:'data/riot_reference/source_16_21_1/riot/16.21.1/en_US/champion/'+r.source,
   trainingSlots:fallback,passive:{...passive,mechanicHints:passiveHints,status:'UNVERIFIED'},
   abilities,mechanicHints:[...mechanics].sort(),planningWeight:weight,
   certification:'UNVERIFIED',kitComplete:false};
 });
 // Keep all 173 spread across 5 big packs. Group missing slots together so
 // the Skills engineer can implement 35 complete kits in ONE batch, while
 // scheduling unusual form/recast/steal kits after primitive groundwork.
 const byName=new Map(roster.map(c=>[c.champion,c]));
 const scheduled=MACRO_B01_B05_FIXED_V453.flat();
 assert.equal(scheduled.length,173,'Fixed M19 schedule count');
 assert.equal(new Set(scheduled).size,173,'Fixed M19 schedule duplicates');
 assert.deepEqual([...scheduled].sort(),[...byName.keys()].sort(),'Fixed M19 roster drift');
 const batches=MACRO_B01_B05_FIXED_V453.map((names,index)=>{
  const champions=names.map(name=>byName.get(name));
  return {id:'B'+String(index+1).padStart(2,'0'),champions:names,
   count:names.length,trainingSlots:champions.reduce((s,c)=>s+c.trainingSlots,0),
   mechanicHints:[...new Set(champions.flatMap(c=>c.mechanicHints))].sort()};
 });
 const totals={champions:roster.length,passives:roster.length,qwerSlots:roster.length*4,
  fallback:roster.reduce((s,c)=>s+c.trainingSlots,0),
  routedUnverified:roster.reduce((s,c)=>s+4-c.trainingSlots,0),
  fullyTrainingChampions:roster.filter(c=>c.trainingSlots===4).length,
  zeroTrainingChampions:roster.filter(c=>c.trainingSlots===0).length,
  certifiedChampions:0,batches:batches.length,
  caution:'Riot descriptions/abilityRule do not prove engine behavior or certify a champion'};
 return {schema:'coachlol.skills.macro-batch.v1',patch:'16.21.1',
  baseline:'dev69/skills-batch2@b7676d57160ddbc2315e258d03f3c94dd5a81189',
  strategy:'35 champions per batch, 5 batches, high-fallback first, lower-complexity first within same fallback count',
  totals,batches,roster};
}
export function assertMacroCoverage(plan){
 const {totals,batches,roster}=plan;
 assert.equal(totals.champions,173);
 assert.equal(totals.qwerSlots,692);
 assert.equal(totals.passives,173);
 assert.equal(totals.routedUnverified+totals.fallback,692);
 assert.equal(batches.length,5,'Expected five large releases, not tiny packs');
 assert.ok(batches.every(x=>x.count>=33&&x.count<=35),'Reject tiny champion batches');
 assert.deepEqual(batches.map(x=>x.count),[35,35,35,35,33]);
 const names=batches.flatMap(b=>b.champions);
 assert.equal(new Set(names).size,173);
 assert.deepEqual([...names].sort(),roster.map(x=>x.champion).sort());
 assert.ok(roster.every(c=>c.abilities.length===4&&c.passive.name&&
  c.abilities.every((a,i)=>a.slot===slots[i]&&a.name&&a.description&&a.riotId)));
 assert.equal(totals.fallback,roster.reduce((n,c)=>n+c.abilities.filter(a=>a.status==='TRAINING_FALLBACK').length,0));
 const slotsByChampion=new Map(roster.map(c=>[c.champion,c.abilities]));
 assert.equal(slotsByChampion.size,173);
 // A false declaration of 'certified' is a critical error, even if routing exists.
 assert.ok(roster.every(c=>!c.kitComplete&&c.certification==='UNVERIFIED'));
 return true;
}
function markdown(plan){
 const {totals,batches,roster}=plan;
 const lines=[
  '# M19 — Macro-pacotes Skills P+QWER (Riot 16.21.1 + motor real)',
  '',
  '**Origem:** arquivo oficial de cada um dos 173 campeões (snapshot já presente no repositório), roteamento `abilityRule()` da branch atual. **Nenhum kit é certificado.**',
  '',
  '**Não confundir:** `TRAINING_FALLBACK` = retorno genérico atual; `ROUTED_UNVERIFIED` = existe roteamento, mas pode ser protótipo/parcial. Isso não representa progresso inventado.',
  '',
  '## Inventário do código atual',
  '',
  '| Métrica | Total |',
  '|---|---:|',
  '| Campeões | '+totals.champions+' |',
  '| Passivas ainda não certificadas | '+totals.passives+' |',
  '| QWER slots | '+totals.qwerSlots+' |',
  '| QWER em training | '+totals.fallback+' |',
  '| QWER não-training, ainda sem certificação | '+totals.routedUnverified+' |',
  '| Campeões com os quatro slots training | '+totals.fullyTrainingChampions+' |',
  '| Campeões sem training (kits NÃO certificados) | '+totals.zeroTrainingChampions+' |',
  '',
  '## Cinco marcos grandes, não marcos de dois campeões',
  '',
  '| Macro-pacote | Campeões | Slots em training no pacote | Conteúdo |',
  '|---|---:|---:|---|',
  ...batches.map(b=>`| ${b.id} | ${b.count} | ${b.trainingSlots} | ${b.champions.join(', ')} |`),
  '',
  '## Contrato de qualidade obrigatório por campeão',
  '',
  '- Uma entrada passiva **P**, quatro entradas **QWER**, com nomes oficiais e mecânicas comprovadas pela implementação do motor; fórmulas e timing só entram depois de QA e validação contra referência (textos não são código).',
  '- Para cada skill: geometria real de tabuleiro, alcance/visão/reino/brush/colisão, dano/CC/DoT e custo/cooldown; habilidade sem esses sistemas recebe pendência explícita.',
  '- Casos de recast, multiplicadores/4, clones, transformações, roubo de ult, pets, canais, armadilhas, AAs alterados, cancelamento e persistência são testados por PRIMITIVAS compartilhadas.',
  '- Testes 2 assentos PvP, simultaneidade, recibo idempotente, morte/respawn, snapshot/replay, fog, reação defensiva, regras de 5x5 e nenhum botão de bot prioritário.',
  '- **Gate estrito:** não declarar campeão COMPLETE enquanto houver slot training, passiva não validada, campo de funcionalidade missing/partial ou contrato sem teste. Um Roteamento `board_effect` genérico não certifica.',
  '- Integrador continua dono exclusivo do `engine.browser.js`, de `dev69/integration` e de release. Não criar PR paralelo competindo com Skills.',
  '',
  '## Entrada de dados por campeão (gerada do código, não manual)',
  '',
  'O arquivo `M19_RUNTIME_MANIFEST.json` gerado no CI inclui os 173 campeões, todas as passivas, os 692 slots, os nomes, descrições originais e parâmetros básicos de referência, `runtimeKind`, `runtimeShape` e pistas de mecânica. **Pistas por palavras-chave servem só para agrupar trabalho**, não para implementar habilidades automaticamente.',
  '',
  '## Primeira entrega operacional',
  '',
  'O **B01 contém 35 campeões** e deverá ser produzido como UM macro-marco de Skills: 35×(P+QWER), sem divisão em mini-pacotes para aprovação artificial. B02–B05 cobrem todo o restante. Execute o mesmo QA de 173 campeões após cada macro-pacote; a contagem de 509 deve diminuir somente quando lógica nova de fato entrar no motor.',
  ''
 ];
 return lines.join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const plan=buildMacroBatches();assertMacroCoverage(plan);
 const dir=resolve(root,process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'docs/skills_macro_batches_dev69');
 if(!existsSync(dir))mkdirSync(dir,{recursive:true});
 writeFileSync(join(dir,'M19_RUNTIME_MANIFEST.json'),JSON.stringify(plan,null,2)+'\n');
 writeFileSync(join(dir,'M19_MACRO_BATCH_PLAN.md'),markdown(plan));
 console.log('M19_COVERAGE '+JSON.stringify(plan.totals));
 for(const b of plan.batches)
  console.log('M19_BATCH '+JSON.stringify({id:b.id,champions:b.count,fallbackSlots:b.trainingSlots,
   list:b.champions,mechanicHints:b.mechanicHints}));
}
