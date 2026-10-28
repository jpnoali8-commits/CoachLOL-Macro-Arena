/* Riot Data Dragon v16.21.1: cosmetics only, never gameplay authority.
   Always keep local fallbacks so the actual sandbox works without network. */
(()=>{'use strict';
const VERSION='16.21.1',BASE=`https://ddragon.leagueoflegends.com/cdn/${VERSION}`;
const ALIAS={"Kha'Zix":"Khazix","Cho'Gath":"Chogath","Kai'Sa":"Kaisa","Lee Sin":"LeeSin","Jarvan IV":"JarvanIV","Wukong":"MonkeyKing","Renata Glasc":"Renata"};
const id=name=>ALIAS[name]||String(name).replace(/[^A-Za-z0-9]/g,'');
const SPELL_NAMES={flash:'SummonerFlash',smite:'SummonerSmite',tp:'SummonerTeleport',exhaust:'SummonerExhaust',heal:'SummonerHeal',ignite:'SummonerDot'};
const details=new Map(),pending=new Map();
function championPortrait(name){return `${BASE}/img/champion/${id(name)}.png`}
function localPortrait(name){const ch=id(name);return `assets/portraits/${ch}.webp`}
function localFallback(img,name){if(!img)return;img.onerror=()=>{img.onerror=()=>{img.onerror=()=>{img.onerror=null;img.src=`assets/portraits/${id(name)}.svg`};img.src=localPortrait(name)};img.src=`assets/riot/${VERSION}/pt_BR/img/champion/${id(name)}.png`};}
function decoratePortrait(img,name){img.src=championPortrait(name);localFallback(img,name)}
function summonerIcon(type){return `${BASE}/img/spell/${SPELL_NAMES[type]||SPELL_NAMES.flash}.png`}
function spellIcon(full){return `${BASE}/img/spell/${encodeURIComponent(full)}`}
function cachedSpellIcon(full){return `assets/riot/${VERSION}/pt_BR/img/spell/${encodeURIComponent(full)}`}
async function champion(name){const key=id(name);if(details.has(key))return details.get(key);if(pending.has(key))return pending.get(key);
 const remote=`${BASE}/data/pt_BR/champion/${key}.json`;
 const local=`assets/riot/${VERSION}/pt_BR/data/champion/${key}.json`;
 const job=fetch(local).then(r=>{if(!r.ok)throw Error('Local not available');return r.json()}).catch(()=>fetch(remote,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Data Dragon unavailable');return r.json()})).then(j=>{const c=j.data?.[key];if(!c)throw Error('Champion missing');details.set(key,c);return c}).catch(()=>null).finally(()=>pending.delete(key));pending.set(key,job);return job;}
window.CoachDragon={VERSION,id,championPortrait,localFallback,decoratePortrait,summonerIcon,spellIcon,cachedSpellIcon,champion};
})();
