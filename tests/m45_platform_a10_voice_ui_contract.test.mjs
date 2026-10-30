/**
 * M45 A10: actual offline-only voice UI wiring with a deterministic fake Web Speech API.
 * This tests app.js handler ONLY; it cannot certify microphone, browser permissions,
 * native speech recognition, server or WASM.
 * Source pin: app.js blob 09ab1c0feaaf58dd48a94e72641a77358055f932.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(source)+String.fromCharCode(0)).update(source).digest('hex');
assert.equal(sha,'09ab1c0feaaf58dd48a94e72641a77358055f932');
const start=source.indexOf('let localVoice=null,voiceBusy=false,voiceSession=0;');
const end=source.indexOf('function renderAllStats(u){',start);
assert.ok(start>=0&&end>start,'voice handler source changed');
const original=source.slice(start,end);
function create({availability='available',api=true}={}){
 const state={available:[],installed:[],instances:[],starts:0,aborts:0,previews:0,applies:0,inputs:0};
 const nodes={
  voiceLocal:{disabled:false,textContent:''},
  voiceFeedback:{textContent:''},
  voiceHelp:{hidden:true,style:{},onclick:null},
  textOrders:{value:'',dispatchEvent(e){assert.equal(e.type,'input');state.inputs++;}},
  previewOrders:{click(){state.previews++;}},
  applyTextOrders:{click(){state.applies++;}}
 };
 const $=id=>{assert.ok(Object.hasOwn(nodes,id),'missing DOM '+id);return nodes[id]};
 class FakeEvent{constructor(type,{bubbles}={}){this.type=type;this.bubbles=bubbles;}}
 class Speech{
  static async available(options){state.available.push(options);if(availability==='throws')throw Error('local model error');return availability;}
  static async install(options){state.installed.push(options);return true;}
  constructor(){state.instances.push(this)}
  start(){state.starts++}
  abort(){state.aborts++}
  stop(){state.aborts++}
 }
 const window={SpeechRecognition:api?Speech:undefined};
 const controller=Function('window','$','Event',original+';return {stopLocalVoice,session:()=>voiceSession,busy:()=>voiceBusy,active:()=>!!localVoice};')(window,$,FakeEvent);
 return {state,nodes,Speech,controller};
}
let n=0;
async function check(label,fn){await fn();n++;console.log('PASS A10 VOICE '+label);}
await check('01 no supported local speech API means fail closed',async()=>{
 const {state,nodes}=create({api:false});
 await nodes.voiceLocal.onclick();
 assert.equal(state.instances.length,0);
 assert.equal(nodes.voiceHelp.hidden,false);
 assert.match(nodes.voiceFeedback.textContent,/indisponível/);
});
await check('02 local available and recognition processLocally true pt-BR only',async()=>{
 const {state,nodes}=create();
 await nodes.voiceLocal.onclick();
 assert.equal(state.instances.length,1);assert.equal(state.starts,1);
 assert.deepEqual(state.available[0],{langs:['pt-BR'],processLocally:true});
 const rec=state.instances[0];
 assert.equal(rec.lang,'pt-BR');assert.equal(rec.processLocally,true);
 assert.equal(rec.continuous,false);assert.equal(rec.interimResults,false);
});
await check('03 interim result ignored and final transcribed once into preview',async()=>{
 const {state,nodes}=create();await nodes.voiceLocal.onclick();
 const rec=state.instances[0];
 rec.onresult({results:[{isFinal:false,0:{transcript:'ignore interim'}}]});
 assert.equal(nodes.textOrders.value,'');assert.equal(state.previews,0);
 rec.onresult({results:[{isFinal:true,0:{transcript:'MID farmar safe'}}]});
 assert.equal(nodes.textOrders.value,'MID farmar safe');
 assert.equal(state.previews,1);assert.equal(state.inputs,1);assert.equal(state.applies,0);
});
await check('04 repeated final callback never appends or applies twice',async()=>{
 const {state,nodes}=create();await nodes.voiceLocal.onclick();
 const rec=state.instances[0];
 rec.onresult({results:[{isFinal:true,0:{transcript:'ADC kite com AA'}}]});
 rec.onresult({results:[{isFinal:true,0:{transcript:'duplicate'}}]});
 assert.equal(nodes.textOrders.value,'ADC kite com AA');
 assert.equal(state.previews,1);assert.equal(state.applies,0);
});
await check('05 voice appends to typed prompt with semicolon separator',async()=>{
 const {state,nodes}=create();nodes.textOrders.value='TOP freezar wave';
 await nodes.voiceLocal.onclick();
 state.instances[0].onresult({results:[{isFinal:true,0:{transcript:'JG guardar smite'}}]});
 assert.equal(nodes.textOrders.value,'TOP freezar wave; JG guardar smite');
 assert.equal(state.previews,1);
});
await check('06 manual stop aborts and ignores previous callback',async()=>{
 const {state,nodes,controller}=create();await nodes.voiceLocal.onclick();
 const prev=state.instances[0];
 await nodes.voiceLocal.onclick();
 assert.equal(state.aborts,1);assert.equal(controller.active(),false);
 prev.onresult({results:[{isFinal:true,0:{transcript:'stale'}}]});
 assert.equal(nodes.textOrders.value,'');
 assert.equal(state.previews,0);
});
await check('07 language download requires explicit user click',async()=>{
 const {state,nodes}=create({availability:'downloadable'});
 await nodes.voiceLocal.onclick();
 assert.equal(state.instances.length,0);assert.equal(state.installed.length,0);
 assert.equal(nodes.voiceHelp.hidden,false);
 let prevented=false;await nodes.voiceHelp.onclick({preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 assert.deepEqual(state.installed,[{langs:['pt-BR'],processLocally:true}]);
 assert.equal(state.instances.length,0);
});
await check('08 unavailable language never falls back to server recognition',async()=>{
 const {state,nodes}=create({availability:'unavailable'});
 await nodes.voiceLocal.onclick();
 assert.equal(state.starts,0);assert.equal(state.instances.length,0);
 assert.match(nodes.voiceFeedback.textContent,/offline indisponível/);
});
await check('09 availability error fails closed and no recording starts',async()=>{
 const {state,nodes,controller}=create({availability:'throws'});
 await nodes.voiceLocal.onclick();
 assert.equal(state.starts,0);assert.equal(controller.active(),false);
 assert.equal(controller.busy(),false);
 assert.match(nodes.voiceFeedback.textContent,/indisponível/);
});
console.log('M45 A10 '+n+'/9 ACTUAL_LEGACY_VOICE_HANDLER_WITH_FAKE_SPEECH_API; BROWSER_MIC_NOT_RUN');
