//! Node/V8 oracle expected values generated from the original engine.mjs.
//! These checks execute Rust only when cargo test is actually run.
use coachlol_core_items::{consumed_components, item, purchase_cost};
fn words(field: &str) -> Vec<String> {
    if field == "-" { Vec::new() }
    else { field.split(',').map(str::to_owned).collect() }
}
#[test]
fn source_1000_recipe_goldens_match_native_rust() {
    let input = include_str!("fixtures/m45_b12b_recipes.tsv");
    let mut count = 0;
    for line in input.lines().filter(|s| !s.is_empty() && !s.starts_with('#')) {
        let p: Vec<&str> = line.split('\t').collect();
        assert_eq!(p.len(), 4, "bad TSV: {line}");
        let inventory = words(p[1]);
        let consumed = words(p[2]);
        let cost: i64 = p[3].parse().unwrap();
        assert!(item(p[0]).is_some());
        assert_eq!(consumed_components(p[0], &inventory), consumed, "{line}");
        assert_eq!(purchase_cost(p[0], &inventory), Some(cost), "{line}");
        count += 1;
    }
    assert_eq!(count, 1000);
}
