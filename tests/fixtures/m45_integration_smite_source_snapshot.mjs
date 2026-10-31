// Frozen exact functions extracted from engine.mjs in dev69/integration
// Commit 374d87d5f49b52514ec68bbe666df086363c1ec5
// Git blob 1737f4f675bd9cc5ed0a48defc68b2fddc124d71
// This fixture is an isolated source oracle; it does not execute a complete match.
export function resolveSimultaneousSmiteV452d4Dev9(openingHP,impacts){
 const valid=(Array.isArray(impacts)?impacts:[]).filter(x=>Number.isFinite(x.hit)&&x.hit>0&&typeof x.actorId==='string');
 const total=valid.reduce((a,x)=>a+x.hit,0);
 const lethal=valid.filter(x=>x.hit>=openingHP);
 const sorted=[...(lethal.length?lethal:valid)].sort((a,b)=>b.hit-a.hit||a.actorId.localeCompare(b.actorId));
 return {total,winner:total>=openingHP?sorted[0]||null:null,remaining:Math.max(0,openingHP-total)};
}
export function resolveNoSmiteObjectiveV452d4Dev9(seed,campId,spawnCycle,tick,blueCount,redCount){
 const blue=Math.max(0,Math.min(5,Math.trunc(Number(blueCount)||0))),red=Math.max(0,Math.min(5,Math.trunc(Number(redCount)||0)));
 if(!blue||!red)return {winner:null,blue,red,blueProbability:blue/(blue+red||1),roll:null};
 const str=`${seed}|${campId}|${spawnCycle}|${tick}`;
 let hash=2166136261>>>0;
 for(let i=0;i<str.length;i++)hash=Math.imul(hash^str.charCodeAt(i),16777619)>>>0;
 const roll=hash/4294967296;
 return {winner:roll<blue/(blue+red)?'blue':'red',blue,red,blueProbability:blue/(blue+red),roll};
}
