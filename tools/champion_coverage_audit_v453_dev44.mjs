/** Conservative gameplay coverage derived from archived Riot roster + existing engine.
 * Listed in engine is not equivalent to a complete, PvP-certified champion.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {CHAMPION_KITS_V42,kitSpellV42} from '../engine.mjs';
const ref=JSON.parse(readFileSync(new URL('../data/riot_reference/champions_26_21_dev36.json',import.meta.url)));
const verified={Ezreal:{Q:'dev41+dev42+dev43: projétil, colisão, on-hit'},Irelia:{Q:'dev41+dev42: avanço/marcas',E:'dev43: duas lâminas/convergência'}};
const special={Sylas:['R: roubo e execução de ultimate inimiga'],Neeko:['P: disfarces de campeão/minion/ward e revelação'],Viego:['P: possessão, habilidades e retorno'],Mordekaiser:['R: arena espacial quadrada com limite circular e geometrias elementais'],Aphelios:['P/Q: arsenal e combinações'],Hwei:['Q/W/E/R: combinações de múltiplos feitiços'],Nidalee:['R: alternância humano/puma e spells'],Elise:['R: alternância humano/aranha e spells'],Shyvana:['R: dragão e habilidades transformadas']};
const champions=Object.keys(ref.champions).sort().map(id=>{
 const slots=Object.fromEntries(['P','Q','W','E','R'].map(slot=>{
  const proof=verified[id]?.[slot];const declared=slot==='P'?false:!!kitSpellV42(id,slot);
  return [slot,{status:proof?'partial_tested':declared?'engine_rule_unverified':'unimplemented_or_unverified',evidence:proof||null}];
 }));
 return {id,name:ref.champions[id].namePt||ref.champions[id].name,source:'Riot champion reference 26.21',slots,fullyCertified:false,missingSpecialSystems:special[id]||[]};
});
const report={schema:'coachlol.champion.coverage.v1',projectVersion:'4.5.3-dev44',patch:'26.21',note:'Não confundir ficha oficial, regra genérica, mecânica parcial e campeão PvP 100% certificado.',championCount:champions.length,fullyCertifiedCount:0,progressEvidence:verified,champions,systemMilestones:[
 {id:'pvp_authority',status:'gateway_input_only',next:'transport/auth, sala, sincronização, reconnect, testes de dois clientes reais'},
 {id:'global_actions',status:'partial',next:'formas, clones, alvos, colisão, on-hit, exclusões por habilidade'},
 {id:'sylas_ultimate_theft',status:'not_certified'}, {id:'neeko_disguises',status:'not_certified'},
 {id:'viego_possession',status:'not_certified'}, {id:'mordekaiser_death_realm',status:'not_certified'},
 {id:'advanced_bot_ai',status:'deferred_until_functional_pvp_catalog'}]};
if(champions.length!==ref.count)throw Error('Referência de campeões inconsistente');
mkdirSync(new URL('../docs/QA_EVIDENCE_V453_DEV44/',import.meta.url),{recursive:true});
writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV44/champion_coverage_26_21.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const totals={};for(const c of champions)for(const slot of Object.values(c.slots))totals[slot.status]=(totals[slot.status]||0)+1;
const markdown=`# Auditoria de certificação dos campeões — dev44\n\nFonte de nomes: fichas do patch 26.21 arquivadas na dev36.\n\n- Referências catalogadas: **${champions.length}**.\n- Campeões 100% certificados em PvP: **0** (nenhuma evidência end-to-end suficiente).\n- Cobertura de slots (P/Q/W/E/R): **${JSON.stringify(totals)}**.\n- Apenas Q de Ezreal e Q/E de Irelia têm evidências parciais individualizadas nas dev41–dev43; isso **não** certifica kits completos.\n- Sylas R, Neeko P, Viego P, Mordekaiser R: **pendentes**, sem marcar falsamente como concluídos.\n- O gateway dev44 valida entrada/posse e usa Arena; **não** constitui servidor PvP com rede, matchmaking ou autenticação.\n\nVer matriz completa em \`champion_coverage_26_21.json\`.\n`;
writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV44/COBERTURA_CAMPEOES.md',import.meta.url),markdown);
console.log(`Audit ${champions.length} champions; ${JSON.stringify(totals)}; 0 PvP-certified`);
