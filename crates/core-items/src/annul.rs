//! Source-locked Annul family, frozen M45 B12F (engine.mjs@e06cfe0c).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct AnnulSpec { pub id: &'static str, pub cooldown_seconds: i64 }
pub const ANNUL_FAMILY: [AnnulSpec; 3] = [
    AnnulSpec { id: "verdant_barrier", cooldown_seconds: 60 },
    AnnulSpec { id: "banshees_veil", cooldown_seconds: 40 },
    AnnulSpec { id: "edge_of_night", cooldown_seconds: 40 },
];
pub const ANNUL_KEY: &str = "item_annul_v453_dev69b2";
pub const SHIELD_FOREVER: f64 = 1_000_000_000_000.0;
pub fn annul_spec(id: &str) -> Option<AnnulSpec> {
    ANNUL_FAMILY.iter().copied().find(|spec| spec.id == id)
}
pub fn inventory_annul(items: &[String]) -> Option<AnnulSpec> {
    items.iter().find_map(|id| annul_spec(id))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn exact_source_annul_cooldowns() {
        assert_eq!(ANNUL_FAMILY.len(), 3);
        assert_eq!(annul_spec("verdant_barrier").unwrap().cooldown_seconds, 60);
        assert_eq!(annul_spec("banshees_veil").unwrap().cooldown_seconds, 40);
        assert_eq!(annul_spec("edge_of_night").unwrap().cooldown_seconds, 40);
        assert!(annul_spec("boots").is_none());
    }
}
