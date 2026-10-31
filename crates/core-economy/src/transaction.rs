//! M45 B12D — atomic staging of economic state and numeric item attributes.
//! NOT a full gameplay port. No item passives, cast effects, full-unit replay,
//! match authority, live HTTP, or client WASM state may be inferred from this.
use std::collections::BTreeMap;
use coachlol_core_items::item_stats;
use super::{ShopContext, ShopError, ShopReceipt, ShopUnit, Team};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomicError {
    Shop(ShopError),
    UnknownItemStats,
    InvalidStatState,
    RuntimeDiverged,
    EffectRejected,
}
impl From<ShopError> for AtomicError {
    fn from(err: ShopError) -> Self { Self::Shop(err) }
}

/// A server-owned stat projection, using JS unit-stat keys for non-special
/// attributes. All fields are private state, never an authoritative browser API.
/// Special item procs/passives require integration with core-items/core-combat.
#[derive(Debug, Clone, PartialEq)]
pub struct LiveItemStats {
    pub max_hp: f64,
    pub hp: f64,
    pub max_mana: f64,
    pub mana: f64,
    pub fields: BTreeMap<String, f64>,
}
impl LiveItemStats {
    pub fn new(max_hp: f64, hp: f64, max_mana: f64, mana: f64) -> Result<Self, AtomicError> {
        let state = Self {
            max_hp, hp, max_mana, mana, fields: BTreeMap::new(),
        };
        state.validate()?;
        Ok(state)
    }
    pub fn field(&self, name: &str) -> f64 {
        self.fields.get(name).copied().unwrap_or(0.0)
    }
    fn validate(&self) -> Result<(), AtomicError> {
        if ![self.max_hp, self.hp, self.max_mana, self.mana]
            .iter().all(|v| v.is_finite()) ||
            self.max_hp < 1.0 || self.max_mana < 0.0 ||
            self.hp < 0.0 || self.hp > self.max_hp ||
            self.mana < 0.0 || self.mana > self.max_mana ||
            !self.fields.values().all(|v| v.is_finite()) {
            return Err(AtomicError::InvalidStatState);
        }
        Ok(())
    }
    fn add_field(&mut self, name: &str, delta: f64) -> Result<(), AtomicError> {
        let next = self.field(name) + delta;
        if !next.is_finite() { return Err(AtomicError::InvalidStatState); }
        self.fields.insert(name.to_owned(), next);
        Ok(())
    }
    fn apply_item(&mut self, id: &str, sign: f64) -> Result<(), AtomicError> {
        let bonus = item_stats(id).ok_or(AtomicError::UnknownItemStats)?;
        for &(name, value) in bonus.values {
            let delta = value * sign;
            if !delta.is_finite() { return Err(AtomicError::InvalidStatState); }
            match name {
                "hp" => {
                    self.max_hp = (self.max_hp + delta).max(1.0);
                    self.hp = (self.hp + delta).max(1.0).min(self.max_hp);
                }
                "mana" => {
                    self.max_mana = (self.max_mana + delta).max(0.0);
                    self.mana = (self.mana + delta).max(0.0).min(self.max_mana);
                }
                "speed" => self.add_field("flatMoveSpeed", delta)?,
                "movePercent" => self.add_field("percentMoveSpeed", delta / 100.0)?,
                "attackSpeedPct" => self.add_field("attackSpeedBonusV453Dev29", delta)?,
                "wards" => self.add_field("wardCharges", delta)?,
                other => self.add_field(other, delta)?,
            }
        }
        self.validate()
    }
    /// Inventory multiset diff. Each consumed component ID is removed only
    /// once; removed item base stats are subtracted before additions.
    pub fn reconcile(&mut self, old: &[String], new: &[String])
        -> Result<(), AtomicError> {
        let mut remaining = new.to_vec();
        for id in old {
            if let Some(index) = remaining.iter().position(|entry| entry == id) {
                remaining.remove(index);
            } else {
                self.apply_item(id, -1.0)?;
            }
        }
        for id in remaining { self.apply_item(&id, 1.0)?; }
        self.validate()
    }
}
#[derive(Debug, Clone, PartialEq)]
struct RuntimeUndo {
    before: LiveItemStats,
    after: LiveItemStats,
}

/// Both the inventory/gold transaction and the stat update occur on staging
/// clones, and are committed ONLY after all validations/effect hooks succeed.
/// The optional hook operates on staged stats, not external server state.
/// Full champion stats, cooldowns/passives and match events still require the
/// central authoritative Rust actor and one wider atomic commit.
#[derive(Debug, Clone, PartialEq)]
pub struct AtomicShop {
    economy: ShopUnit,
    live: LiveItemStats,
    runtime_undo: Vec<RuntimeUndo>,
}
impl AtomicShop {
    pub fn new(economy: ShopUnit, live: LiveItemStats) -> Result<Self, AtomicError> {
        if !economy.items().is_empty() || economy.undo_history_len() != 0 {
            return Err(AtomicError::RuntimeDiverged);
        }
        live.validate()?;
        Ok(Self { economy, live, runtime_undo: Vec::new() })
    }
    pub fn economy(&self) -> &ShopUnit { &self.economy }
    pub fn stats(&self) -> &LiveItemStats { &self.live }
    pub fn undo_depth(&self) -> usize { self.runtime_undo.len() }

    fn append_undo(&mut self, before: LiveItemStats, after: LiveItemStats) {
        // One independent new visit can begin after previous Undo was revoked.
        if self.economy.undo_history_len() == 1 {
            self.runtime_undo.clear();
        }
        self.runtime_undo.push(RuntimeUndo { before, after });
        while self.runtime_undo.len() > self.economy.undo_history_len() {
            self.runtime_undo.remove(0);
        }
    }
    pub fn buy(&mut self, seat: Team, context: &ShopContext, id: &str)
        -> Result<ShopReceipt, AtomicError> {
        self.buy_with(seat, context, id, |_| Ok(()))
    }
    pub fn buy_with<F>(&mut self, seat: Team, context: &ShopContext, id: &str,
                       stage_effect: F) -> Result<ShopReceipt, AtomicError>
    where F: FnOnce(&mut LiveItemStats) -> Result<(), AtomicError> {
        let mut staged_economy = self.economy.clone();
        let old_items = staged_economy.items().to_vec();
        let receipt = staged_economy.buy(seat, context, id)?;
        let mut staged_stats = self.live.clone();
        staged_stats.reconcile(&old_items, staged_economy.items())?;
        stage_effect(&mut staged_stats)?;
        staged_stats.validate()?;
        let previous = self.live.clone();
        self.economy = staged_economy;
        self.live = staged_stats.clone();
        self.append_undo(previous, staged_stats);
        Ok(ShopReceipt { item_stats_pending: false, ..receipt })
    }
    pub fn sell(&mut self, seat: Team, context: &ShopContext, index: usize)
        -> Result<ShopReceipt, AtomicError> {
        self.sell_with(seat, context, index, |_| Ok(()))
    }
    pub fn sell_with<F>(&mut self, seat: Team, context: &ShopContext, index: usize,
                        stage_effect: F) -> Result<ShopReceipt, AtomicError>
    where F: FnOnce(&mut LiveItemStats) -> Result<(), AtomicError> {
        let mut staged_economy = self.economy.clone();
        let old_items = staged_economy.items().to_vec();
        let receipt = staged_economy.sell(seat, context, index)?;
        let mut staged_stats = self.live.clone();
        staged_stats.reconcile(&old_items, staged_economy.items())?;
        stage_effect(&mut staged_stats)?;
        staged_stats.validate()?;
        let previous = self.live.clone();
        self.economy = staged_economy;
        self.live = staged_stats.clone();
        self.append_undo(previous, staged_stats);
        Ok(ShopReceipt { item_stats_pending: false, ..receipt })
    }
    pub fn undo(&mut self, seat: Team, context: &ShopContext)
        -> Result<ShopReceipt, AtomicError> {
        let mut staged = self.economy.clone();
        let receipt = staged.undo(seat, context)?;
        let previous = self.runtime_undo.last().ok_or(AtomicError::RuntimeDiverged)?;
        if self.live != previous.after { return Err(AtomicError::RuntimeDiverged); }
        let restored = previous.before.clone();
        self.economy = staged;
        self.live = restored;
        self.runtime_undo.pop();
        Ok(ShopReceipt { item_stats_pending: false, ..receipt })
    }
    pub fn on_fountain_presence(&mut self, alive: bool, in_fountain: bool) {
        self.economy.on_fountain_presence(alive, in_fountain);
        if self.economy.undo_history_len() == 0 { self.runtime_undo.clear(); }
    }
    pub fn award_gold(&mut self, amount: i64) -> Result<(), AtomicError> {
        self.economy.award_gold(amount)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Role;
    fn sample(team: Team, role: Role) -> AtomicShop {
        let prefix = if team == Team::Blue { "blue" } else { "red" };
        let owner = ShopUnit::new(
            format!("{}_{}", prefix, role.source_code()), team, role, 10000
        ).unwrap();
        let live = LiveItemStats::new(1000.0, 1000.0, 500.0, 500.0).unwrap();
        AtomicShop::new(owner, live).unwrap()
    }
    #[test]
    fn rejection_rolls_back_gold_inventory_and_stats_on_both_sides() {
        for team in [Team::Blue, Team::Red] {
            let ctx = ShopContext::planning(0);
            let mut shop = sample(team, Role::Mid);
            let original = shop.clone();
            assert_eq!(shop.buy_with(team, &ctx, "dorans_ring",
                |_| Err(AtomicError::EffectRejected)), Err(AtomicError::EffectRejected));
            assert_eq!(shop, original);
            assert_eq!(shop.buy(team, &ctx, "trinket_oracle"),
                Err(AtomicError::Shop(ShopError::ItemNotPurchasable)));
            assert_eq!(shop, original);
            assert_eq!(shop.buy_with(team, &ctx, "boots",
                |live| { live.hp = f64::NAN; Ok(()) }),
                Err(AtomicError::InvalidStatState));
            assert_eq!(shop, original);
        }
    }
    #[test]
    fn dorans_ring_stats_gold_sell_and_two_undos_are_atomic() {
        for team in [Team::Blue, Team::Red] {
            let ctx = ShopContext::planning(0);
            let mut s = sample(team, Role::Mid);
            assert_eq!(s.buy(team, &ctx, "dorans_ring").unwrap().delta_gold, -400);
            assert_eq!(s.economy().gold(), 9600);
            assert_eq!(s.stats().max_hp, 1090.0);
            assert_eq!(s.stats().hp, 1090.0);
            assert_eq!(s.stats().field("ap"), 18.0);
            assert_eq!(s.sell(team, &ctx, 0).unwrap().delta_gold, 160);
            assert_eq!(s.stats().hp, 1000.0);
            assert_eq!(s.stats().field("ap"), 0.0);
            s.undo(team, &ctx).unwrap();
            assert_eq!(s.economy().gold(), 9600);
            assert_eq!(s.stats().field("ap"), 18.0);
            s.undo(team, &ctx).unwrap();
            assert_eq!(s.economy().gold(), 10000);
            assert_eq!(s.stats().hp, 1000.0);
            assert_eq!(s.stats().field("ap"), 0.0);
        }
    }
    #[test]
    fn consumed_components_change_stats_only_once() {
        let ctx = ShopContext::planning(0);
        let mut s = sample(Team::Blue, Role::Mid);
        s.buy(Team::Blue, &ctx, "long_sword").unwrap();
        s.buy(Team::Blue, &ctx, "long_sword").unwrap();
        assert_eq!(s.stats().field("ad"), 20.0);
        s.buy(Team::Blue, &ctx, "serrated_dirk").unwrap();
        let expected = item_stats("serrated_dirk").unwrap()
            .values.iter().find(|(key, _)| *key == "ad").unwrap().1;
        assert_eq!(s.stats().field("ad"), expected);
        s.undo(Team::Blue, &ctx).unwrap();
        assert_eq!(s.stats().field("ad"), 20.0);
    }
    #[test]
    fn shop_exit_revokes_all_old_stat_undos() {
        let ctx = ShopContext::planning(0);
        let mut s = sample(Team::Blue, Role::Mid);
        s.buy(Team::Blue, &ctx, "boots").unwrap();
        s.on_fountain_presence(true, false);
        s.on_fountain_presence(true, true);
        assert_eq!(s.undo(Team::Blue, &ctx),
            Err(AtomicError::Shop(ShopError::UndoRevoked)));
        s.buy(Team::Blue, &ctx, "long_sword").unwrap();
        s.undo(Team::Blue, &ctx).unwrap();
        assert_eq!(s.economy().items(), ["boots"]);
        assert_eq!(s.stats().field("ad"), 0.0);
    }
    #[test]
    fn full_runtime_divergence_refuses_undo_without_mutation() {
        let ctx = ShopContext::planning(0);
        let mut s = sample(Team::Blue, Role::Mid);
        s.buy(Team::Blue, &ctx, "boots").unwrap();
        let mut changed = s.clone();
        changed.live.hp -= 1.0;
        let prior = changed.clone();
        assert_eq!(changed.undo(Team::Blue, &ctx),
            Err(AtomicError::RuntimeDiverged));
        assert_eq!(changed, prior);
    }
    #[test]
    fn refund_and_stats_do_not_change_after_effect_rejection() {
        let ctx = ShopContext::planning(0);
        let mut s = sample(Team::Red, Role::Mid);
        s.buy(Team::Red, &ctx, "boots").unwrap();
        let prior = s.clone();
        assert_eq!(s.sell_with(Team::Red, &ctx, 0,
            |_| Err(AtomicError::EffectRejected)), Err(AtomicError::EffectRejected));
        assert_eq!(s, prior);
    }
    #[test]
    fn applied_base_stats_clear_pending_receipt_on_blue_and_red() {
        for team in [Team::Blue, Team::Red] {
            let mut s = sample(team, Role::Mid);
            let ctx = ShopContext::planning(0);
            let b = s.buy(team, &ctx, "dorans_ring").unwrap();
            assert!(!b.item_stats_pending);
            assert_eq!(s.stats().field("ap"), 18.0);
            let sold = s.sell(team, &ctx, 0).unwrap();
            assert!(!sold.item_stats_pending);
            assert_eq!(s.stats().field("ap"), 0.0);
            let undone = s.undo(team, &ctx).unwrap();
            assert!(!undone.item_stats_pending);
            assert_eq!(s.stats().field("ap"), 18.0);
        }
    }

}
