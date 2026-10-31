// Offline Node source audit. This is NOT cargo test, rustfmt, Node gameplay,
// real HTTP/SSE, or WASM QA; it only catches obvious contract drift.
import {readFileSync} from 'node:fs';
import {auditM45I13RustSources} from './m45_b02b_i13_source_audit.mjs';
const modules=['lib','skill_admission','skill_wire','skill_authority',
  'pvp_projection','pvp_session'];
const s=Object.fromEntries(modules.map(name=>[
  name,readFileSync(new URL('../crates/core-state/src/'+name+'.rs',import.meta.url),'utf8'),
]));
const receipt=auditM45I13RustSources(s);
console.log(JSON.stringify(receipt,null,2));
