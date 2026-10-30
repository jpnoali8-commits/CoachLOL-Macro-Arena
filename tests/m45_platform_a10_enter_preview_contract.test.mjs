/**
 * M45 PLATFORM-A10: exact legacy app.js input Enter/preview/confirm flow.
 * Simulated DOM and real commands.mjs/Arena; no browser certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(app)+String.fromCharCode(0)).update(app).digest('hex');
assert.equal(sha,'09ab1c0feaaf58dd48a94e72641a77358055f932');
const begin=app.indexOf('function clearCommandPreview(){'),end=app.indexOf('// Voice commands are opt-in, on-device only.',begin);
assert.ok(begin>=0&&end>begin,'preview source changed');
const snippet=app.slice(begin,end);
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let seed=9010;
function fixture(){
 const match=new Arena(map,mask,{mode:'pvp',seed:seed++});
 const counts={preview:0,apply:0,notice:[],draw:0,render:0},nodes={
  textOrders:{value:'',listeners:{},addEventListener(kind,fn){this.listeners[kind]=fn;},focus(){}},
  applyTextOrders:{disabled:true,click(){counts.apply++;this.onclick();}},
  commandPreview:{hidden:true,innerHTML:''},
  textOrderStatus:{textContent:''},
  previewOrders:{click(){counts.preview++;this.onclick();}}
 };
 const $=name=>{assert.ok(nodes[name],'missing '+name);return nodes[name];};
 const vars={commandPreview:null,commandPreviewSource:null,selected:null};
 const event=e=>({
  key:e.key||'Enter',shiftKey:!!e.shiftKey,ctrlKey:!!e.ctrlKey,altKey:!!e.altKey,
  metaKey:!!e.metaKey,isComposing:!!e.isComposing,repeat:!!e.repeat,
  prevented:false,preventDefault(){this.prevented=true;},stopPropagation(){}
 });
 const window={CoachCommands:{interpretCommands,applyCommands}};
 const user=Function('window','$','match','notify','escapeHTML','updateInspector','renderStatus','requestDraw',
  'let commandPreview=null,commandPreviewSource=null,selected=null;const cmds=window.CoachCommands;'+snippet+
  ';return {preview:()=>commandPreview,source:()=>commandPreviewSource};'
 )(window,$,match,text=>counts.notice.push(text),s=>String(s).replaceAll('<','&lt;'),()=>{},()=>{counts.render++;},()=>{counts.draw++;});
 function press(options={}){const e=event(options);nodes.textOrders.listeners.keydown(e);return e}
 return {match,nodes,counts,user,press};
}
let n=0;const check=(name,fn)=>{fn();n++;console.log('PASS A10 ENTER '+name);};
check('01 first Enter previews only, no game mutation',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';
 const before=f.match.units.find(u=>u.id==='blue_MID').policy;
 const e=f.press();
 assert.equal(e.prevented,true);assert.equal(f.counts.preview,1);assert.equal(f.counts.apply,0);
 assert.equal(f.user.preview().ok,true);
 assert.equal(f.match.units.find(u=>u.id==='blue_MID').policy,before);
});
check('02 second Enter applies previous preview exactly once',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';f.press();f.press();
 assert.equal(f.counts.preview,1);assert.equal(f.counts.apply,1);
 assert.equal(f.match.units.find(u=>u.id==='blue_MID').policy,'safe');
 assert.equal(f.nodes.textOrders.value,'');
});
check('03 Shift+Enter never previews or applies',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';
 assert.equal(f.press({shiftKey:true}).prevented,false);
 assert.equal(f.counts.preview,0);assert.equal(f.counts.apply,0);
});
check('04 IME composition and repeat do not apply',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';
 f.press({isComposing:true});f.press({repeat:true});
 assert.equal(f.counts.preview,0);assert.equal(f.counts.apply,0);
});
check('05 changed source without input event triggers new preview not old apply',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';f.press();
 f.nodes.textOrders.value='ADC kite com AA';f.press();
 assert.equal(f.counts.preview,2);assert.equal(f.counts.apply,0);
 assert.equal(f.match.units.find(u=>u.id==='blue_ADC').combatStyle,'auto');
});
check('06 input event clears previous preview and disarms apply button',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';f.press();
 f.nodes.textOrders.value='ADC kite com AA';f.nodes.textOrders.listeners.input();
 assert.equal(f.user.preview(),null);assert.equal(f.nodes.applyTextOrders.disabled,true);
 f.press();assert.equal(f.counts.preview,2);assert.equal(f.counts.apply,0);
});
check('07 invalid preview cannot be applied by second Enter',()=>{
 const f=fixture();f.nodes.textOrders.value='unknownfoobar impossible';f.press();f.press();
 assert.equal(f.user.preview().ok,false);
 assert.equal(f.counts.apply,0);
 assert.ok(f.counts.notice.some(s=>s.includes('erros na prévia')));
});
check('08 direct apply after stale modified preview refuses mutation',()=>{
 const f=fixture();f.nodes.textOrders.value='MID farmar safe';f.press();
 f.nodes.textOrders.value='ADC kite com AA';
 f.nodes.applyTextOrders.click();
 assert.equal(f.match.units.find(u=>u.id==='blue_ADC').combatStyle,'auto');
 assert.equal(f.user.preview(),null);
});
console.log('M45 A10 '+n+'/8 EXACT_APP_JS_ENTER_HANDLER_WITH_SIMULATED_DOM; BROWSER_NOT_RUN');
