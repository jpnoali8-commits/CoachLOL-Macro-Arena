#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const src=readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(src)+String.fromCharCode(0)).update(src).digest('hex');
assert.equal(sha,'1737f4f675bd9cc5ed0a48defc68b2fddc124d71','Source drift detected');
function argsAt(ix){
 let p=ix+11,depth=0,q='',esc=false,st=p,args=[];
 for(;p<src.length;p++){
  const c=src[p];
  if(q){if(esc){esc=false;continue;}if(c.charCodeAt(0)===92){esc=true;continue;}if(c===q)q='';continue;}
  if(c.charCodeAt(0)===39||c.charCodeAt(0)===34||c.charCodeAt(0)===96){q=c;continue;}
  if(c==='('||c==='['||c==='{'){depth++;continue;}
  if(c===')'||c===']'||c==='}'){
   if(c===')'&&depth===0){args.push(src.slice(st,p).trim());return args;}
   depth--;continue;
  }
  if(c===','&&depth===0){args.push(src.slice(st,p).trim());st=p+1;}
 }
 throw Error('unbalanced event');
}
const calls=[...src.matchAll(/\bthis\.event\(/g)].map(m=>{
 const a=argsAt(m.index);
 return {line:src.slice(0,m.index).split('\n').length,arity:a.length,
  scope:a.length===1?'NO_TEAM_ARGUMENT':a[1]==='null'?'EXPLICIT_NULL_TEAM':'TEAM_ARG_PRESENT',
  explicit_public:a.some(v=>v.includes('public:true'))};
});
const unowned=calls.filter(x=>x.scope!=='TEAM_ARG_PRESENT');
const counts={total:calls.length,unowned:unowned.length,no_team:calls.filter(x=>x.scope==='NO_TEAM_ARGUMENT').length,
 team_null:calls.filter(x=>x.scope==='EXPLICIT_NULL_TEAM').length,explicit_public:unowned.filter(x=>x.explicit_public).length};
assert.deepEqual(counts,{total:132,unowned:20,no_team:13,team_null:7,explicit_public:2});
console.log(JSON.stringify({source_commit:'374d87d5f49b52514ec68bbe666df086363c1ec5',engine_blob:sha,counts,unowned},null,2));
