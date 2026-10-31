//! Source-pinned tests for transactional numeric item stats. Native only.
//! No client authority / no item-passive claims.
use coachlol_core_items::{item_stats, CATALOG, ITEM_STATS};
use coachlol_core_economy::{Role, ShopContext, ShopUnit, Team};
use coachlol_core_economy::transaction::{AtomicShop, AtomicError, LiveItemStats};

#[test]
fn all_item_stats_source_rows_exist_and_remain_native() {
    assert_eq!(CATALOG.len(), 125);
    assert_eq!(ITEM_STATS.len(), 125);
    for entry in CATALOG {
        assert!(item_stats(entry.id).is_some());
    }
}
#[test]
fn atomic_side_effect_failure_restores_unchanged_gold_and_hp() {
    let context = ShopContext::planning(0);
    let owner = ShopUnit::new("blue_MID", Team::Blue, Role::Mid, 1000).unwrap();
    let live = LiveItemStats::new(1000.0, 1000.0, 500.0, 500.0).unwrap();
    let mut shop = AtomicShop::new(owner, live).unwrap();
    let before = shop.clone();
    assert_eq!(shop.buy_with(Team::Blue, &context, "dorans_ring",
      |state| { state.max_hp += 30.0; Err(AtomicError::EffectRejected) }),
      Err(AtomicError::EffectRejected));
    assert_eq!(shop, before);
}
