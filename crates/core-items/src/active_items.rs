//! B12E source-pinned QSS and Mercurial Scimitar active item rules.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MercurySpec { pub id: &'static str, pub cooldown: f64, pub sprint: f64, pub speed_fraction: f64 }
pub const MERCURY: [MercurySpec; 2] = [
    MercurySpec { id: "quicksilver_sash", cooldown: 90.0, sprint: 0.0, speed_fraction: 0.0 },
    MercurySpec { id: "mercurial_scimitar", cooldown: 90.0, sprint: 1.5, speed_fraction: 0.25 },
];
pub fn mercury_spec(id: &str) -> Option<MercurySpec> { MERCURY.iter().copied().find(|s| s.id == id) }
pub const CLEANSE: &[&str] = &["stun", "root", "slow", "silence", "blind", "disarm", "grounded", "fear", "charm", "taunt", "polymorph", "sleep", "suppression"];
pub const STUN_BLOCKERS: &[&str] = &["stun","knockup","suppression","fear","charm","sleep"];
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn cleanse_rules_do_not_remove_knockup() {
        assert_eq!(CLEANSE.len(),13);
        assert!(CLEANSE.contains(&"suppression"));
        assert!(!CLEANSE.contains(&"knockup"));
        assert_eq!(mercury_spec("mercurial_scimitar").unwrap().sprint,1.5);
        assert!(mercury_spec("boots").is_none());
    }
}
