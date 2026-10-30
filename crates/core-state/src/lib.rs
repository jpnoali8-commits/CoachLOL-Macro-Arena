//! CoachLOL M45: isolated, versioned deterministic contracts.
//! JS Arena is still authoritative. These functions cannot see a match, map or fog.
//! The native server may eventually consume private inputs; WASM exports only a
//! public standalone hash primitive, never the hidden objective arbitration.

pub mod skill_admission;
pub mod skill_wire;
pub mod skill_authority;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Team {
    Blue,
    Red,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TurnPhase {
    Planning,
    ReadyToResolve,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TurnError {
    AlreadyConfirmed,
    WrongPhase,
    RoundOverflow,
}

/// Exactly two humans, each controlling their own five champions upstream.
/// Intents are team-private and intentionally NOT stored in this gate.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TurnGate {
    round: u32,
    phase: TurnPhase,
    blue_ready: bool,
    red_ready: bool,
}

impl TurnGate {
    pub const fn new() -> Self {
        Self {
            round: 1,
            phase: TurnPhase::Planning,
            blue_ready: false,
            red_ready: false,
        }
    }
    pub const fn round(&self) -> u32 {
        self.round
    }
    pub const fn phase(&self) -> TurnPhase {
        self.phase
    }
    pub const fn is_confirmed(&self, team: Team) -> bool {
        match team {
            Team::Blue => self.blue_ready,
            Team::Red => self.red_ready,
        }
    }
    pub fn confirm(&mut self, team: Team) -> Result<TurnPhase, TurnError> {
        if self.phase != TurnPhase::Planning {
            return Err(TurnError::WrongPhase);
        }
        let ready = match team {
            Team::Blue => &mut self.blue_ready,
            Team::Red => &mut self.red_ready,
        };
        if *ready {
            return Err(TurnError::AlreadyConfirmed);
        }
        *ready = true;
        if self.blue_ready && self.red_ready {
            self.phase = TurnPhase::ReadyToResolve;
        }
        Ok(self.phase)
    }
    /// Called only by a future authoritative server AFTER fully resolving both
    /// teams' frozen orders. This prototype resolves no combat or economy.
    pub fn start_next_round(&mut self) -> Result<u32, TurnError> {
        if self.phase != TurnPhase::ReadyToResolve {
            return Err(TurnError::WrongPhase);
        }
        let next = self.round.checked_add(1).ok_or(TurnError::RoundOverflow)?;
        self.round = next;
        self.blue_ready = false;
        self.red_ready = false;
        self.phase = TurnPhase::Planning;
        Ok(self.round)
    }
}
impl Default for TurnGate {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SmiteImpact<'a> {
    pub actor_id: &'a str,
    pub hit: f64,
}
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SmiteOutcome<'a> {
    pub total: f64,
    pub winner: Option<SmiteImpact<'a>>,
    pub remaining: f64,
}
/// Exact JS ordering for supported canonical ASCII champion actor IDs.
/// Excludes NaN/infinite/nonpositive hits, as resolveSimultaneousSmiteV452d4Dev9.
/// Assumes finite positive opening HP and IDs with ASCII digits/letters/underscore.
pub fn resolve_simultaneous_smite<'a>(
    opening_hp: f64,
    impacts: &'a [SmiteImpact<'a>],
) -> SmiteOutcome<'a> {
    let valid: Vec<_> = impacts
        .iter()
        .copied()
        .filter(|x| x.hit.is_finite() && x.hit > 0.0)
        .collect();
    let total: f64 = valid.iter().map(|x| x.hit).sum();
    let has_individual_lethal = valid.iter().any(|x| x.hit >= opening_hp);
    let winner = if total >= opening_hp {
        valid
            .iter()
            .filter(|x| !has_individual_lethal || x.hit >= opening_hp)
            .min_by(|a, b| {
                b.hit
                    .total_cmp(&a.hit)
                    .then_with(|| a.actor_id.cmp(b.actor_id))
            })
            .copied()
    } else {
        None
    };
    SmiteOutcome {
        total,
        winner,
        remaining: (opening_hp - total).max(0.0),
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct NoSmiteOutcome {
    pub winner: Option<Team>,
    pub blue: u8,
    pub red: u8,
    pub blue_probability: f64,
    pub hash: Option<u32>,
    pub roll: Option<f64>,
}
pub const fn fnv1a_utf16(code_units: &[u16]) -> u32 {
    let mut hash = 2_166_136_261u32;
    let mut i = 0;
    while i < code_units.len() {
        hash ^= code_units[i] as u32;
        hash = hash.wrapping_mul(16_777_619);
        i += 1;
    }
    hash
}
/// Mirrors JS charCodeAt (UTF-16), NOT UTF-8 byte hashing.
/// Inputs are integral (matching current seed, spawnCycle and tick contracts).
pub fn resolve_no_smite(
    seed: i64,
    camp_id: &str,
    spawn_cycle: i64,
    tick: i64,
    blue_count: i32,
    red_count: i32,
) -> NoSmiteOutcome {
    let blue = blue_count.clamp(0, 5) as u8;
    let red = red_count.clamp(0, 5) as u8;
    let p = blue as f64 / ((blue as u16 + red as u16).max(1) as f64);
    if blue == 0 || red == 0 {
        return NoSmiteOutcome {
            winner: None,
            blue,
            red,
            blue_probability: p,
            hash: None,
            roll: None,
        };
    }
    let key = format!("{seed}|{camp_id}|{spawn_cycle}|{tick}");
    let hash = fnv1a_utf16(&key.encode_utf16().collect::<Vec<u16>>());
    let roll = hash as f64 / 4_294_967_296.0;
    let winner = if roll < p {
        Some(Team::Blue)
    } else {
        Some(Team::Red)
    };
    NoSmiteOutcome {
        winner,
        blue,
        red,
        blue_probability: p,
        hash: Some(hash),
        roll: Some(roll),
    }
}

// C ABI for WASM: public FNV hashing only. NO private game state or decisions
// may ever cross this client boundary. No wasm-bindgen dependency yet.
#[cfg(target_arch = "wasm32")]
const MAX_PUBLIC_CODE_UNITS: u32 = 1_048_576;

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub extern "C" fn coachlol_m45_version() -> u32 {
    45
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub extern "C" fn coachlol_m45_alloc_utf16(len: u32) -> *mut u16 {
    if len == 0 || len > MAX_PUBLIC_CODE_UNITS {
        return core::ptr::null_mut();
    }
    let mut buffer = vec![0u16; len as usize].into_boxed_slice();
    let ptr = buffer.as_mut_ptr();
    core::mem::forget(buffer);
    ptr
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub unsafe extern "C" fn coachlol_m45_free_utf16(ptr: *mut u16, len: u32) {
    if ptr.is_null() || len == 0 || len > MAX_PUBLIC_CODE_UNITS {
        return;
    }
    let slice = core::ptr::slice_from_raw_parts_mut(ptr, len as usize);
    unsafe {
        drop(Box::from_raw(slice));
    }
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub unsafe extern "C" fn coachlol_m45_fnv1a_utf16(ptr: *const u16, len: u32) -> u32 {
    if ptr.is_null() || len == 0 || len > MAX_PUBLIC_CODE_UNITS {
        return 0;
    }
    let units = unsafe { core::slice::from_raw_parts(ptr, len as usize) };
    fnv1a_utf16(units)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn two_team_confirmations_are_atomic_and_symmetric() {
        for first in [Team::Blue, Team::Red] {
            let mut gate = TurnGate::new();
            assert_eq!(gate.start_next_round(), Err(TurnError::WrongPhase));
            assert_eq!(gate.confirm(first), Ok(TurnPhase::Planning));
            assert_eq!(gate.confirm(first), Err(TurnError::AlreadyConfirmed));
            let other = if first == Team::Blue {
                Team::Red
            } else {
                Team::Blue
            };
            assert_eq!(gate.confirm(other), Ok(TurnPhase::ReadyToResolve));
            assert_eq!(gate.confirm(first), Err(TurnError::WrongPhase));
            assert_eq!(gate.start_next_round(), Ok(2));
            assert!(!gate.is_confirmed(first));
            assert!(!gate.is_confirmed(other));
            assert_eq!(gate.phase(), TurnPhase::Planning);
        }
    }

    #[test]
    fn no_smite_js_golden_corpus() {
        let data = include_str!("../../../tests/fixtures/m45_no_smite.tsv");
        for line in data
            .lines()
            .filter(|line| !line.starts_with('#') && !line.is_empty())
        {
            let c: Vec<&str> = line.split('\t').collect();
            assert_eq!(c.len(), 8, "{line}");
            let outcome = resolve_no_smite(
                c[0].parse().unwrap(),
                c[1],
                c[2].parse().unwrap(),
                c[3].parse().unwrap(),
                c[4].parse().unwrap(),
                c[5].parse().unwrap(),
            );
            let expected_hash = if c[6] == "-" {
                None
            } else {
                Some(c[6].parse::<u32>().unwrap())
            };
            let expected_winner = match c[7] {
                "blue" => Some(Team::Blue),
                "red" => Some(Team::Red),
                "-" => None,
                _ => panic!("bad golden winner"),
            };
            assert_eq!(outcome.hash, expected_hash, "{line}");
            assert_eq!(outcome.winner, expected_winner, "{line}");
            assert_eq!(
                outcome.roll,
                expected_hash.map(|h| h as f64 / 4_294_967_296.0),
                "{line}"
            );
        }
    }

    #[test]
    fn simultaneous_smite_preserves_deterministic_lethality_and_tie_breaks() {
        let a = [
            SmiteImpact {
                actor_id: "blue_JG",
                hit: 1200.0,
            },
            SmiteImpact {
                actor_id: "red_JG",
                hit: 900.0,
            },
        ];
        let r = resolve_simultaneous_smite(1500.0, &a);
        assert_eq!(r.winner.unwrap().actor_id, "blue_JG");
        assert_eq!(r.total, 2100.0);
        let b = [
            SmiteImpact {
                actor_id: "red_JG",
                hit: 1200.0,
            },
            SmiteImpact {
                actor_id: "blue_JG",
                hit: 1200.0,
            },
        ];
        assert_eq!(
            resolve_simultaneous_smite(1100.0, &b)
                .winner
                .unwrap()
                .actor_id,
            "blue_JG"
        );
        let c = [
            SmiteImpact {
                actor_id: "red_JG",
                hit: f64::NAN,
            },
            SmiteImpact {
                actor_id: "blue_JG",
                hit: 0.0,
            },
        ];
        let r = resolve_simultaneous_smite(100.0, &c);
        assert_eq!(r.winner, None);
        assert_eq!(r.remaining, 100.0);
    }
}
