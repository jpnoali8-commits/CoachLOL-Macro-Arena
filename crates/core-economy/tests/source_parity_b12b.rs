//! M45 B12B - executable Rust differential fixture from frozen Arena JS.
//! 258 SOURCE_RUN (JS V8) rows; Rust native is NOT_RUN until cargo test is run.
//! No real PvP server, no stats, no combat effects, no replay ACK layer.
use coachlol_core_economy::{Role, ShopContext, ShopUnit, Team};
fn parse_team(s: &str) -> Team {
    match s { "blue" => Team::Blue, "red" => Team::Red, _ => panic!("bad team: {s}") }
}
fn parse_role(s: &str) -> Role {
    match s {
        "TOP" => Role::Top, "JG" => Role::Jungle, "MID" => Role::Mid,
        "ADC" => Role::Adc, "SUP" => Role::Support, _ => panic!("bad role: {s}"),
    }
}
fn joined(items: &[String]) -> String {
    if items.is_empty() { "-".to_string() } else { items.join(",") }
}

#[test]
fn source_258_shop_steps_match_native_rust() {
    let fixture = include_str!("fixtures/m45_b12b_shop.tsv");
    let mut active = String::new();
    let mut unit: Option<ShopUnit> = None;
    let mut ctx = ShopContext::planning(0);
    let mut count = 0;
    let mut scenarios = 0;
    for line in fixture.lines().filter(|s| !s.is_empty() && !s.starts_with('#')) {
        let p: Vec<&str> = line.split('\t').collect();
        assert_eq!(p.len(), 15, "bad TSV: {line}");
        let id = format!("{}:{}", p[0], p[1]);
        let seat = parse_team(p[1]);
        let role = parse_role(p[2]);
        if id != active {
            active = id;
            unit = Some(ShopUnit::new(format!("{}_{}", p[1], p[2]), seat, role,
                                     p[3].parse().unwrap()).unwrap());
            ctx = ShopContext::planning(0);
            scenarios += 1;
            assert_eq!(p[4], "0", "scenario must start at step 0");
        }
        let u = unit.as_mut().unwrap();
        let op = p[5];
        let accepted = if let Some(id) = op.strip_prefix("B:") {
            u.buy(seat, &ctx, id).is_ok()
        } else if let Some(id) = op.strip_prefix("X:") {
            let rival = if seat == Team::Blue { Team::Red } else { Team::Blue };
            u.buy(rival, &ctx, id).is_ok()
        } else if let Some(idx) = op.strip_prefix("S:") {
            u.sell(seat, &ctx, idx.parse().unwrap()).is_ok()
        } else if op == "U" {
            u.undo(seat, &ctx).is_ok()
        } else if op == "D" {
            ctx.at_fountain = false;
            u.on_fountain_presence(true, false);
            true
        } else if op == "R" {
            ctx.at_fountain = true;
            u.on_fountain_presence(true, true);
            true
        } else if op == "P" {
            ctx.team_ready = true;
            true
        } else if op == "N" {
            ctx.team_ready = false;
            true
        } else if op == "T" {
            ctx.time += 1;
            true
        } else if op == "C" {
            ctx.champion_revision += 1;
            true
        } else if let Some(amount) = op.strip_prefix("A:") {
            u.award_gold(amount.parse().unwrap()).is_ok()
        } else {
            panic!("unknown operation: {op}");
        };
        assert_eq!(accepted as u8, p[6].parse::<u8>().unwrap(), "acceptance: {line}");
        assert_eq!(u.gold(), p[7].parse::<i64>().unwrap(), "gold: {line}");
        assert_eq!(joined(u.items()), p[8], "inventory: {line}");
        assert_eq!(u.pet().unwrap_or("-"), p[9], "jungle pet: {line}");
        assert_eq!(u.control_ward_stock(), p[10].parse::<u8>().unwrap(), "pink stock: {line}");
        assert_eq!(ctx.time, p[11].parse::<i64>().unwrap(), "time: {line}");
        assert_eq!(ctx.at_fountain as u8, p[12].parse::<u8>().unwrap(), "shop: {line}");
        assert_eq!(ctx.team_ready as u8, p[13].parse::<u8>().unwrap(), "ready: {line}");
        assert_eq!(ctx.champion_revision, p[14].parse::<u64>().unwrap(), "revision: {line}");
        count += 1;
    }
    assert_eq!(scenarios, 44);
    assert_eq!(count, 258);
}
