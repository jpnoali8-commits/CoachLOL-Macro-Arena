/** CoachLOL cinematic core v3.7: pure, deterministic selection/policy helpers.
 *  The engine is authoritative; this module never mutates match state. */
export const PUBLIC_KINDS = Object.freeze(['death','objective']);
export const MEDIA_TYPES = Object.freeze(['glb','gltf','webm','mp4','png-sequence']);
const clip=(value,lower,upper)=>Math.max(lower,Math.min(upper,Number(value)||0));
export function safeLocalAsset(path){
 if(typeof path!=='string'||!path||path.startsWith('/')||path.startsWith('\\')||path.includes('\\')||path.includes('?')||path.includes('#'))return false;
 if(path.split('/').some(part=>part==='..'||part==='.'||!part))return false;
 return /^assets\/(cinematics|ui)\/[A-Za-z0-9_\-./]+\.(?:glb|gltf|webm|mp4|png|webp|svg|ogg|wav)$/.test(path);
}
export function normalizeCinematicConfig(template={}){
 const media=template.media;
 const mediaOk=media && typeof media==='object'&&MEDIA_TYPES.includes(media.type)&&safeLocalAsset(media.src);
 return {label:String(template.label||'EVENTO').slice(0,60),icon:String(template.icon||'✦').slice(0,4),durationMs:clip(template.durationMs||1500,400,6000),priority:clip(template.priority||30,0,100),fogPolicy:template.fogPolicy||'own_team',camera:template.camera||'none',vfx:template.vfx||'fade',interruptPolicy:template.interruptPolicy||'none',media:mediaOk?{type:media.type,src:media.src}:null};
}
export function normalizeManifest(raw){
 if(!raw||raw.schemaVersion!=='1.0.0'||!raw.events||typeof raw.events!=='object')throw new Error('Manifesto cinematográfico inválido');
 const out={};for(const [id,entry] of Object.entries(raw.events))if(/^[a-z_]{2,40}$/.test(id))out[id]=normalizeCinematicConfig(entry);
 return out;
}
// Team-private effects are only shown to own team, OR if visibility at the
// *time of the event* was explicitly established by the authoritative engine.
// The current visibility cannot be retroactively used for past casts.
export function visibleToViewer(raw,viewer){
 if(!raw||!['blue','red'].includes(viewer))return false;
 if(raw.team===viewer)return true;
 if(Array.isArray(raw.observedBy)&&raw.observedBy.includes(viewer))return true;
 if(raw.public===true)return true;
 if(raw.kind==='death')return true; // public kill announcement, no coordinates exposed
 if(raw.kind==='objective'&&/drag[aã]o|bar[aã]o|nashor/i.test(String(raw.text||'')) && /derrot|conquist|eliminad|abatid|morto/i.test(String(raw.text||'')))return true;
 return false;
}
export function classifyEngineEvent(raw,viewer='blue'){
 if(!raw||typeof raw.kind!=='string')return null;
 if(raw.kind==='death')return raw.team===viewer?'ally_eliminated':'champion_eliminated';
 if(raw.kind==='objective'){
  const title=String(raw.text||'');
  if(/drag[aã]o/i.test(title)&&/derrot|conquist|eliminad|abatid|morto/i.test(title))return 'dragon_slay';
  if(/bar[aã]o|nashor/i.test(title)&&/derrot|conquist|eliminad|abatid|morto/i.test(title))return 'baron_slay';
 }
 if(raw.kind==='ultimate_cast')return 'ultimate_cast';
 if(raw.kind==='ultimate')return 'ultimate_impact';
 if(raw.kind==='respawn')return 'respawn';
 if(raw.kind==='skill_up')return 'level_up';
 if(raw.kind==='stasis')return 'stasis';
 return null;
}
export function presentationEvent(raw,viewer,registry){
 if(!visibleToViewer(raw,viewer))return null;
 const type=classifyEngineEvent(raw,viewer);
 if(!type||!registry[type])return null;
 const cfg=registry[type];
 const caption=String(raw.text||cfg.label).replace(/[<>]/g,'').slice(0,140);
 return {type,caption,team:raw.team||null,unitId:raw.unitId||null,time:Number(raw.time)||0,round:Number(raw.round)||0,...cfg};
}
export function eventSort(a,b){return b.priority-a.priority||a.round-b.round||a.time-b.time;}
