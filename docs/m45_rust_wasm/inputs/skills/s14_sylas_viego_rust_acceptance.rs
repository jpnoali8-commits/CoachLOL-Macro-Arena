//! CoachLOL M45 B02 Skills S14 — Rust-native *future* acceptance contract.
//! Audits M44 B14C/B14D/B17 original legacy identity-copy goldens.
//! ISOLATED source-only: not a crate, not compiled, no game engine implementation.
//! Implementation MUST invoke real server-authoritative Rust champion executors;
//! no canned expected data may be returned by the runner.
//! Pins: skills-batch2 f0b1147ac46e585a1d5374a178b1ea462f5dc278
//! Legacy V8 rerun: 4/4 source suites, 154/154 cases, 1894/1894 assertions.
//! The original B14D suite (78 cases) is also included in S10's 22 V8_PASS;
//! do NOT double-count it as newly implemented or full-kit certified.

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Seat { Blue, Red }
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BorrowType { StealUltimateR, PossessPassiveQweAndNativeR }
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Case {
    pub action: BorrowType,
    pub source_champion: &'static str,
}
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Witness {
    /// The underlying actor remains exactly the original owner and MID ID.
    pub authenticated_owner: Seat,
    pub actor_id: String,
    /// Sylas always stays Sylas; Viego returns to Viego after native R.
    pub final_real_champion: String,
    /// Must bind to original donor R, never borrowed form or generic substitute.
    pub original_ultimate_executor: String,
    /// True only after the original authored executor has actually resolved.
    pub original_executor_executed: bool,
    /// Sylas hijack uses 75 mana to acquire; stolen R uses zero extra mana.
    pub extra_mana_for_stolen_r: i32,
    pub stolen_cast_consumed_once: bool,
    /// Sylas never copies Viego P; Viego uses a valid owned corpse soul.
    pub donor_passive_leaked_to_sylas: bool,
    pub forged_or_expired_soul_accepted: bool,
    /// Viego while possessed uses source P/Q/W/E identities, never donor R.
    pub borrowed_p_qwe_source: Option<String>,
    pub native_viego_r_retained: bool,
    pub restored_identity_after_native_r: bool,
    /// True if this source fixture's state survives legacy-style snapshot restore;
    /// Rust must prove its OWN replay parity independently.
    pub replay_state_equivalent: bool,
}

pub trait AuthoritativeBorrowRunner {
    fn run_real_champion_case(&mut self, seat: Seat, case: Case)
        -> Result<Witness, String>;
}
pub const SYLAS_ORIGINAL_R: [&str; 15] = [
    "Bard","Malzahar","Volibear","Nocturne","Diana",
    "Lissandra","Ryze","Skarner","Ekko","Yorick",
    "Viego","Anivia","Talon","Rengar","Kalista",
];
pub const VIEGO_BORROW_P_QWE: [&str; 12] = [
    "Hwei","Azir","Bard","Twitch","Teemo","Ekko",
    "Zed","Skarner","Yorick","Annie","Caitlyn","Nidalee",
];
pub fn tasks() -> Vec<Case> {
    let mut out = Vec::with_capacity(27);
    out.extend(SYLAS_ORIGINAL_R.iter().map(|x| Case{
        action:BorrowType::StealUltimateR,source_champion:x,
    }));
    out.extend(VIEGO_BORROW_P_QWE.iter().map(|x| Case{
        action:BorrowType::PossessPassiveQweAndNativeR,source_champion:x,
    }));
    out
}
/// Critical: only the future REAL Rust server implementation may implement
/// AuthoritativeBorrowRunner. Faking these observations does not grant parity.
/// Tests also need explicit invalid soul/fog/ownership and cloned donor cases.
pub fn validate_against_actual_rust<R: AuthoritativeBorrowRunner>(
    runner: &mut R,
) -> Result<usize, String> {
    let mut passed=0;
    for seat in [Seat::Blue,Seat::Red] {
        for case in tasks() {
            let w=runner.run_real_champion_case(seat,case)
                .map_err(|error| format!("{:?}/{:?}: {}",seat,case,error))?;
            let actor = match case.action {
                BorrowType::StealUltimateR => "Sylas",
                BorrowType::PossessPassiveQweAndNativeR => "Viego",
            };
            let expected_id = match seat { Seat::Blue=>"blue_MID",Seat::Red=>"red_MID" };
            let expected_r = match case.action {
                BorrowType::StealUltimateR => case.source_champion,
                BorrowType::PossessPassiveQweAndNativeR => "Viego",
            };
            if w.authenticated_owner != seat ||
               w.actor_id != expected_id ||
               w.final_real_champion != actor ||
               w.original_ultimate_executor != expected_r ||
               !w.original_executor_executed ||
               w.forged_or_expired_soul_accepted ||
               w.donor_passive_leaked_to_sylas ||
               !w.replay_state_equivalent {
                return Err(format!("ownership/executor/replay mismatch: {:?}/{:?}/{:?}",seat,case,w));
            }
            match case.action {
                BorrowType::StealUltimateR => {
                    if w.extra_mana_for_stolen_r!=0 ||
                       !w.stolen_cast_consumed_once ||
                       w.borrowed_p_qwe_source.is_some() {
                        return Err(format!("Sylas spent extra R or illegally borrowed P/QWE: {:?}/{:?}",case,w));
                    }
                }
                BorrowType::PossessPassiveQweAndNativeR => {
                    if w.borrowed_p_qwe_source.as_deref()!=Some(case.source_champion) ||
                       !w.native_viego_r_retained || !w.restored_identity_after_native_r {
                        return Err(format!("Viego copied donor R, failed QWE source or failed restore: {:?}/{:?}",case,w));
                    }
                }
            }
            passed+=1;
        }
    }
    Ok(passed)
}

/// Additional negative acceptance cases, NOT implied by the 54 positives:
pub const REQUIRED_NEGATIVE_CASES: [&str; 10] = [
    "sylas_hidden_donor_reject",
    "sylas_wrong_seat_reject",
    "sylas_unsupported_ultimate_fails_closed",
    "sylas_cannot_steal_viego_borrowed_r_from_appearance",
    "sylas_stolen_viego_r_never_mints_viego_passive_souls",
    "viego_forged_soul_reject",
    "viego_expired_soul_reject",
    "viego_fog_lost_between_queue_and_commit_reject",
    "viego_same_soul_double_claim_reject",
    "viego_expiry_death_or_native_r_cleans_borrowed_form",
];

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeSet;
    #[test]
    fn exact_original_b14d_sylas_r_corpus() {
        let champions: BTreeSet<_> = SYLAS_ORIGINAL_R.iter().copied().collect();
        assert_eq!(champions.len(),15);
        assert!(champions.contains("Viego"));
        assert!(champions.contains("Kalista"));
    }
    #[test]
    fn exact_original_b14d_viego_pqwe_corpus() {
        let champions: BTreeSet<_> = VIEGO_BORROW_P_QWE.iter().copied().collect();
        assert_eq!(champions.len(),12);
        assert!(champions.contains("Nidalee"));
        assert!(champions.contains("Hwei"));
    }
    #[test]
    fn typed_positive_cases_cover_both_seats_without_fake_implementation() {
        let cases=tasks();
        assert_eq!(cases.len(),27);
        assert_eq!(cases.iter().filter(|x|x.action==BorrowType::StealUltimateR).count(),15);
        assert_eq!(cases.iter().filter(|x|x.action==BorrowType::PossessPassiveQweAndNativeR).count(),12);
        // The 54 proposed match runs require the actual server runner to exist.
    }
    #[test]
    fn explicit_negative_requirements_are_unique_and_not_inferred_as_passes() {
        let names: BTreeSet<_> = REQUIRED_NEGATIVE_CASES.iter().copied().collect();
        assert_eq!(names.len(),10);
    }
}
