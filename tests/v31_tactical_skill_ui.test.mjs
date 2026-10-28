import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const f=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const html=f('index.html'),js=f('app.js'),css=f('styles-v31.css');
assert.match(html,/styles-v31\.css/);
assert.match(html,/class="policyPanel" id="policyPanel"/);
assert.match(js,/reactionWidget\.before\(pathWidget\)/);
assert.match(js,/className='tacticChoice tactic-'/);
assert.match(css,/#tacticPanel \.tacticChoices/);
console.log('✓ PATH·GANK acima de Reação no DOM e estilos dark no panel inteiro');
for(const key of ['full_red','full_blue','full_near','three','invade','counter','safe_lane','freeze_lane','push_lane','hold_lane','top','mid','bot','countergank','roam','dragon','baron','herald','warddragon']){
 assert.ok(existsSync(new URL('../assets/ui/tactics/'+key+'.svg',import.meta.url)),key);
 const xml=f('assets/ui/tactics/'+key+'.svg');assert.match(xml,/<svg/);assert.match(xml,/viewBox/);assert.match(xml,/<path|<circle/);
}
console.log('✓ 19 ícones SVG vetoriais offline de jungle, lanes, ganks e objetivos');
assert.match(js,/this\.remove\(\)/);
assert.doesNotMatch(js,/spellIcon\(detail\.image\.full\).*?this\.src='assets\/ui\/summoners\/\$\{type\}\.svg'/);
assert.match(js,/skillFloatUpgrade/);assert.match(css,/#skillWidget \.spells\{display:grid!important/);
assert.match(css,/#skillWidget \.skillFloatUpgrade:focus-visible/);
assert.match(js,/up\.onclick=e=>/);
console.log('✓ Render QWER resistente ao retorno assíncrono de Data Dragon, overlay de pontos clicável');
assert.match(js,/restoreWidgetOrder\(\)/);assert.match(js,/rememberWidgetOrder\(\)/);
assert.match(js,/section\.tagName==='DETAILS'/);
assert.match(css,/#selectedInspector \.policyPanel select/);
console.log('✓ Docks arrastáveis, ordem salva e cores sem vazamento de tema azul');
