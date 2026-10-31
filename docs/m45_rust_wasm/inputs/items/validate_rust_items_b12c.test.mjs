// B12C reproducible read-only source guard. Runs locally with Node, no Actions.
// node docs/m45_rust_wasm/inputs/items/validate_rust_items_b12c.test.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalog,ITEM_RECIPES,ITEM_SELL_VALUES_V453_DEV60,
 recipePurchasePartsV453Dev30} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {validateItemsStaticB12C} from './static_rust_items_b12c.mjs';
assertFrozenSourcesB03({shop:true});
const file=p=>readFileSync(new URL('../../../../'+p,import.meta.url),'utf8');
const report=validateItemsStaticB12C({
 catalog,ITEM_RECIPES,ITEM_SELL_VALUES_V453_DEV60,recipePurchasePartsV453Dev30,
 rustCatalog:file('crates/core-items/src/catalog.rs'),
 recipeFixture:file('crates/core-items/tests/fixtures/m45_b12b_recipes.tsv'),
 shopFixture:file('crates/core-economy/tests/fixtures/m45_b12b_shop.tsv'),
});
assert.equal(report.status,'PASS',JSON.stringify(report));
assert.deepEqual([report.catalog_matches,report.recipe_matches,report.shop_rows,report.shop_scenarios],
 [125,1000,258,44]);
console.log(JSON.stringify({stage:'M45_B12C',execution:'NODE_ESM_GUARD',...report}));
