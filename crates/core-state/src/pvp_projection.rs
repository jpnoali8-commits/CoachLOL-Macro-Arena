//! M45 B02B-I10: allowlisted per-seat PvP projection and public SSE envelope.
//! NOT a network handler. A server MUST obtain the seat from its authenticated
//! session, never from a client query, and must never serialize raw match state.
//! Events are conservative: impacts are visible only when BOTH units are
//! currently visible to the same seat. This may suppress past legitimate events.
//! Event-time fog, spectator policy, terrain, realm and authoritative replay
//! are NOT implemented by this standalone projection.
use crate::skill_authority::{BoardPoint, ServerSkillWorld};
use crate::Team;
use std::fmt::Write;

const PUBLIC_SCHEMA: &str = "coachlol.m45.public-seat-prototype.v1";

fn team_label(team: Team) -> &'static str {
    match team {
        Team::Blue => "blue",
        Team::Red => "red",
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VisibleUnit {
    pub id: String,
    pub champion: String,
    pub team: Team,
    pub pos: BoardPoint,
    pub alive: bool,
    /// Never present for enemies. No private enemy skill ranks, cooldown, or
    /// authoritative random state is included anywhere in this public DTO.
    pub own_mana: Option<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PublicPvPEvent {
    VisibleImpact {
        source_id: String,
        target_id: String,
    },
}

/// Opaque transport-neutral server event. Its private raw fields cannot be
/// accessed through the public DTO or the public serializer. Do not derive
/// serde::Serialize on this server-only type or pass it to JSON/SSE directly.
pub struct PrivatePvPEvent {
    kind: PrivatePvPEventKind,
}
enum PrivatePvPEventKind {
    SubmittedOrder {
        _owner: Team,
        _actor_id: String,
        _target_id: Option<String>,
        _request_id: String,
        _nonce: u64,
    },
    CombatImpact {
        source_id: String,
        target_id: String,
        _raw_damage: i64,
        _internal_seed: u64,
    },
    HiddenObjective {
        _objective_id: String,
        _private_roll: u64,
    },
}

impl PrivatePvPEvent {
    pub fn submitted_order(
        owner: Team, actor_id: String, target_id: Option<String>,
        request_id: String, nonce: u64,
    ) -> Self {
        Self { kind: PrivatePvPEventKind::SubmittedOrder {
            _owner: owner, _actor_id: actor_id, _target_id: target_id,
            _request_id: request_id, _nonce: nonce,
        }}
    }

    pub fn combat_impact(
        source_id: String, target_id: String,
        raw_damage: i64, internal_seed: u64,
    ) -> Self {
        Self { kind: PrivatePvPEventKind::CombatImpact {
            source_id, target_id, _raw_damage: raw_damage,
            _internal_seed: internal_seed,
        }}
    }

    pub fn hidden_objective(objective_id: String, private_roll: u64) -> Self {
        Self { kind: PrivatePvPEventKind::HiddenObjective {
            _objective_id: objective_id, _private_roll: private_roll,
        }}
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct SeatPublicProjection {
    pub tick: u64,
    pub seat: Team,
    pub units: Vec<VisibleUnit>,
    pub events: Vec<PublicPvPEvent>,
}

impl SeatPublicProjection {
    /// Server-only projection, NEVER a dump of arbitrary struct fields.
    /// The seat argument is trusted only if mapped from the request session.
    pub(crate) fn from_private(
        world: &ServerSkillWorld,
        authenticated_seat: Team,
        private_events: &[PrivatePvPEvent],
    ) -> Self {
        let units = world.seat_visible_units(authenticated_seat).into_iter()
            .map(|unit| VisibleUnit {
                id: unit.id.clone(),
                champion: unit.champion.clone(),
                team: unit.team,
                pos: unit.pos,
                alive: unit.alive,
                own_mana: (unit.team == authenticated_seat).then_some(unit.mana),
            })
            .collect();
        let events = private_events.iter().filter_map(|event| {
            match &event.kind {
                PrivatePvPEventKind::SubmittedOrder { .. } |
                PrivatePvPEventKind::HiddenObjective { .. } => None,
                PrivatePvPEventKind::CombatImpact {
                    source_id, target_id, ..
                } if world.unit_visible_to(source_id, authenticated_seat)
                  && world.unit_visible_to(target_id, authenticated_seat) =>
                    Some(PublicPvPEvent::VisibleImpact {
                        source_id: source_id.clone(),
                        target_id: target_id.clone(),
                    }),
                _ => None,
            }
        }).collect();
        Self {
            tick: world.snapshot_tick(),
            seat: authenticated_seat, units, events,
        }
    }

    /// A hand-written allowlist serializer avoids accidental exposure via
    /// Serialize/Debug of private records and uses proper JSON escaping.
    pub fn to_public_json(&self) -> String {
        let mut out = String::from("{\"schema\":");
        json_string(&mut out, PUBLIC_SCHEMA);
        out.push_str(",\"tick\":");
        write!(&mut out, "{}", self.tick).expect("string buffer");
        out.push_str(",\"seat\":");
        json_string(&mut out, team_label(self.seat));
        out.push_str(",\"units\":[");
        for (index, unit) in self.units.iter().enumerate() {
            if index != 0 { out.push(','); }
            out.push_str("{\"id\":");
            json_string(&mut out, &unit.id);
            out.push_str(",\"champion\":");
            json_string(&mut out, &unit.champion);
            out.push_str(",\"team\":");
            json_string(&mut out, team_label(unit.team));
            out.push_str(",\"x\":");
            write!(&mut out, "{}", unit.pos.x).expect("string buffer");
            out.push_str(",\"y\":");
            write!(&mut out, "{}", unit.pos.y).expect("string buffer");
            out.push_str(",\"alive\":");
            out.push_str(if unit.alive { "true" } else { "false" });
            if let Some(mana) = unit.own_mana {
                out.push_str(",\"ownMana\":");
                write!(&mut out, "{}", mana).expect("string buffer");
            }
            out.push('}');
        }
        out.push_str("],\"events\":[");
        for (index, event) in self.events.iter().enumerate() {
            if index != 0 { out.push(','); }
            match event {
                PublicPvPEvent::VisibleImpact { source_id, target_id } => {
                    out.push_str("{\"kind\":\"visible_impact\",\"sourceId\":");
                    json_string(&mut out, source_id);
                    out.push_str(",\"targetId\":");
                    json_string(&mut out, target_id);
                    out.push('}');
                }
            }
        }
        out.push_str("]}");
        out
    }

    /// SSE data is ONE single JSON line, with no raw private payload.
    /// Newlines in user-influenced IDs/champion strings are JSON escaped.
    pub fn to_sse_frame(&self) -> String {
        format!("event: public_state\ndata: {}\n\n", self.to_public_json())
    }
}

fn json_string(out: &mut String, value: &str) {
    out.push('"');
    for ch in value.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            '\u{0000}'..='\u{001f}' => {
                write!(out, "\\u{:04x}", ch as u32).expect("string buffer");
            }
            _ => out.push(ch),
        }
    }
    out.push('"');
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::skill_authority::{
        ServerSkillSnapshot, ServerUnitSnapshot, ServerSkillWorld,
    };

    fn unit(id: &str, team: Team, x: i32) -> ServerUnitSnapshot {
        ServerUnitSnapshot {
            id: id.into(), champion: "TestChamp".into(), team,
            pos: BoardPoint { x, y: 42 }, alive: true,
            visible_to_blue: false, visible_to_red: false,
            mana: 7777,
            skill: [ServerSkillSnapshot {
                rank: 5, ready_at_tick: 9999, mana_cost: 432,
                max_range: 800,
            }; 4],
        }
    }

    fn world(units: Vec<ServerUnitSnapshot>) -> ServerSkillWorld {
        ServerSkillWorld::from_authoritative_units(50, units).unwrap()
    }

    #[test]
    fn blue_cannot_see_hidden_red_or_private_stats() {
        let w = world(vec![unit("blue", Team::Blue, 1), unit("hidden-red", Team::Red, 2)]);
        let projection = SeatPublicProjection::from_private(&w, Team::Blue, &[]);
        let json = projection.to_public_json();
        assert_eq!(projection.units.len(), 1);
        assert!(json.contains("\"id\":\"blue\""));
        assert!(!json.contains("hidden-red"));
        assert!(json.contains("\"ownMana\":7777"));
        assert!(!json.contains("ready_at_tick"));
        assert!(!json.contains("mana_cost"));
        assert!(!json.contains("visible_to_red"));
    }

    #[test]
    fn red_cannot_see_hidden_blue_and_only_own_mana_is_sent() {
        let mut blue = unit("hidden-blue", Team::Blue, 1);
        blue.visible_to_red = false;
        let mut red = unit("red", Team::Red, 2);
        red.visible_to_blue = true;
        let w = world(vec![blue, red]);
        let red_view = SeatPublicProjection::from_private(&w, Team::Red, &[]);
        let blue_view = SeatPublicProjection::from_private(&w, Team::Blue, &[]);
        assert!(!red_view.to_public_json().contains("hidden-blue"));
        assert_eq!(red_view.units.len(), 1);
        assert_eq!(blue_view.units.len(), 2);
        assert_eq!(blue_view.units.iter().find(|u| u.id == "red").unwrap().own_mana, None);
        assert_eq!(red_view.units[0].own_mana, Some(7777));
    }

    #[test]
    fn concealed_orders_and_objective_rng_are_never_projected() {
        let w = world(vec![unit("blue", Team::Blue, 1)]);
        let events = vec![
            PrivatePvPEvent::submitted_order(Team::Red,
                "hidden-red".into(), Some("secret-target".into()),
                "PRIVATE-REQUEST-NONCE".into(), 123456),
            PrivatePvPEvent::hidden_objective("baron_private".into(), 999999),
        ];
        for seat in [Team::Blue, Team::Red] {
            let view = SeatPublicProjection::from_private(&w, seat, &events);
            let frame = view.to_sse_frame();
            assert!(view.events.is_empty());
            for leak in ["secret-target", "PRIVATE-REQUEST-NONCE",
                "baron_private", "999999", "123456"] {
                assert!(!frame.contains(leak));
            }
        }
    }

    #[test]
    fn combat_event_requires_both_units_visible_to_the_same_seat() {
        let blue = unit("attacker", Team::Blue, 1);
        let mut red = unit("target", Team::Red, 2);
        red.visible_to_blue = false;
        let w = world(vec![blue, red]);
        let events = vec![PrivatePvPEvent::combat_impact(
            "attacker".into(), "target".into(), 12345, 67890,
        )];
        assert!(SeatPublicProjection::from_private(&w, Team::Blue, &events).events.is_empty());
        assert!(SeatPublicProjection::from_private(&w, Team::Red, &events).events.is_empty());
    }

    #[test]
    fn visible_impacts_hide_raw_damage_and_rng() {
        let mut blue = unit("attacker", Team::Blue, 1);
        let mut red = unit("target", Team::Red, 2);
        blue.visible_to_red = true;
        red.visible_to_blue = true;
        let w = world(vec![blue, red]);
        let events = vec![PrivatePvPEvent::combat_impact(
            "attacker".into(), "target".into(), 12345, 67890,
        )];
        for seat in [Team::Blue, Team::Red] {
            let projection = SeatPublicProjection::from_private(&w, seat, &events);
            assert_eq!(projection.events.len(), 1);
            let frame = projection.to_sse_frame();
            assert!(frame.contains("\"kind\":\"visible_impact\""));
            assert!(!frame.contains("12345"));
            assert!(!frame.contains("67890"));
            assert!(!frame.contains("PRIVATE"));
        }
    }

    #[test]
    fn sse_string_fields_are_escaped_and_no_multiline_injection() {
        let malicious = "actor\n\nretry: 999\ndata: injected\"\\\u{0001}";
        let mut own = unit(malicious, Team::Blue, 1);
        own.champion = "Caster\r\nid: injected".into();
        let w = world(vec![own]);
        let frame = SeatPublicProjection::from_private(&w, Team::Blue, &[])
            .to_sse_frame();
        assert!(frame.starts_with("event: public_state\ndata: {"));
        assert_eq!(frame.matches("\ndata: ").count(), 1);
        assert!(!frame.contains("\nretry: 999"));
        assert!(!frame.contains("\nid: injected"));
        assert!(frame.contains("\\n\\nretry: 999\\ndata: injected"));
        assert!(frame.contains("\\u0001"));
        assert!(frame.ends_with("\n\n"));
    }

    #[test]
    fn deterministic_public_unit_order_ignores_hashmap_iteration() {
        let w = world(vec![
            unit("z", Team::Blue, 1),
            unit("a", Team::Blue, 2),
            unit("m", Team::Blue, 3),
        ]);
        let a = SeatPublicProjection::from_private(&w, Team::Blue, &[])
            .to_public_json();
        let b = SeatPublicProjection::from_private(&w, Team::Blue, &[])
            .to_public_json();
        assert_eq!(a, b);
        assert_eq!(SeatPublicProjection::from_private(&w, Team::Blue, &[])
            .units.iter().map(|u| u.id.as_str()).collect::<Vec<_>>(),
            vec!["a", "m", "z"]);
    }

    #[test]
    fn neither_side_gets_unseen_enemy_through_event_ids() {
        let w = world(vec![
            unit("hidden-blue", Team::Blue, 1),
            unit("hidden-red", Team::Red, 2),
        ]);
        let events = vec![
            PrivatePvPEvent::combat_impact(
                "hidden-blue".into(), "hidden-red".into(), 424242, 9999,
            ),
            PrivatePvPEvent::combat_impact(
                "hidden-red".into(), "absent".into(), 77, 88,
            ),
        ];
        for (seat, enemy) in [(Team::Blue, "hidden-red"), (Team::Red, "hidden-blue")] {
            let frame = SeatPublicProjection::from_private(&w, seat, &events)
                .to_sse_frame();
            assert!(!frame.contains(enemy));
            assert!(!frame.contains("absent"));
            assert!(!frame.contains("424242"));
        }
    }

    #[test]
    fn public_frame_is_a_single_allowlisted_json_event() {
        let w = world(vec![unit("blue", Team::Blue, 1)]);
        let p = SeatPublicProjection::from_private(&w, Team::Blue, &[]);
        let frame = p.to_sse_frame();
        assert_eq!(frame.matches("event: public_state").count(), 1);
        assert!(frame.contains("\"schema\":\"coachlol.m45.public-seat-prototype.v1\""));
        assert!(frame.contains("\"tick\":50"));
        assert!(frame.contains("\"seat\":\"blue\""));
        assert!(!frame.contains("\"skills\""));
        assert!(!frame.contains("\"seed\""));
        assert!(!frame.contains("\"orders\""));
    }
}
