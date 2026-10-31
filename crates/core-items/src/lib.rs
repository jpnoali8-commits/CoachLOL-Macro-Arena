//! M45 B12A — authoritative item metadata and pure recipe primitives.
//! Partial port: not gameplay authority until shared contracts/core-combat exist.
mod catalog;
mod stats;
pub mod active_items;
pub use stats::{item_stats, ItemStatSpec, ITEM_STATS};
pub use catalog::{item, ItemSpec, CATALOG};

/// Mirrors the frozen JS recursive discount routine exactly: components
/// are consumed by individual inventory instance, depth-first, capped at 12.
pub fn consumed_components(item_id: &str, inventory: &[String]) -> Vec<String> {
    fn visit(id: &str, available: &mut Vec<String>, consumed: &mut Vec<String>, path: &mut Vec<String>) {
        if path.len() > 12 || path.iter().any(|part| part == id) { return; }
        if let Some(index) = available.iter().position(|part| part == id) {
            consumed.push(available.remove(index));
            return;
        }
        if let Some(spec) = item(id) {
            path.push(id.to_string());
            for child in spec.recipe { visit(child, available, consumed, path); }
            path.pop();
        }
    }
    let mut available = inventory.to_vec();
    let mut consumed = Vec::new();
    if let Some(spec) = item(item_id) {
        for part in spec.recipe {
            visit(part, &mut available, &mut consumed, &mut vec![item_id.to_string()]);
        }
    }
    consumed
}

/// Uses individual purchased-component catalog costs, not current sell values.
pub fn purchase_cost(item_id: &str, inventory: &[String]) -> Option<i64> {
    let spec = item(item_id)?;
    let mut discount = 0_i64;
    for id in consumed_components(item_id, inventory) {
        discount = discount.checked_add(item(&id)?.cost)?;
    }
    Some((spec.cost - discount).max(0))
}

#[cfg(test)]
mod tests {
    use super::*;
    fn inv(ids: &[&str]) -> Vec<String> { ids.iter().map(|s| (*s).to_string()).collect() }
    #[test]
    fn source_catalog_has_125_entries_and_122_sale_prices() {
        assert_eq!(CATALOG.len(), 125);
        assert_eq!(CATALOG.iter().filter(|x| x.sell.is_some()).count(), 122);
        assert_eq!(item("dorans_ring").unwrap().cost, 400);
        assert_eq!(item("dorans_ring").unwrap().sell, Some(160));
        assert_eq!(item("boots").unwrap().cost, 300);
        assert_eq!(item("boots").unwrap().sell, Some(210));
        assert_eq!(item("support_compass").unwrap().sell, None);
        assert!(item("support_compass").unwrap().not_purchasable);
        assert!(item("__missing__").is_none());
    }
    #[test]
    fn consumes_only_real_component_instances() {
        assert_eq!(
            consumed_components("serrated_dirk", &inv(&["long_sword", "long_sword", "dagger"])),
            inv(&["long_sword", "long_sword"])
        );
        assert_eq!(
            purchase_cost("serrated_dirk", &inv(&["long_sword", "long_sword"])),
            Some(item("serrated_dirk").unwrap().cost - 700)
        );
    }
    #[test]
    fn recursive_recipe_does_not_reuse_a_single_item() {
        let owned = inv(&["long_sword"]);
        let consumed = consumed_components("rabadon", &owned);
        assert!(consumed.is_empty());
        let ingredients = inv(&["needless_rod", "needless_rod"]);
        assert_eq!(consumed_components("rabadon", &ingredients), ingredients);
        assert_eq!(consumed_components("rabadon", &inv(&["needless_rod"])).len(), 1);
    }
    #[test]
    fn no_trinket_or_quest_purchase_eligibility_is_implied_by_catalog() {
        assert!(item("trinket_stealth").unwrap().has("trinket"));
        assert!(item("trinket_oracle").unwrap().has("trinket"));
        assert!(item("trinket_farsight").unwrap().has("trinket"));
        assert!(item("support_atlas").unwrap().has("quest"));
        assert_eq!(item("jungle_gustwalker").unwrap().role_lock, Some("JG"));
    }
}
