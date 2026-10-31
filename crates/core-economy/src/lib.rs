//! M45 B12A — native Rust shop/economy transaction kernel, SOURCE_ONLY_PARTIAL.
//!
//! A trusted Rust match actor must provide ShopContext and an authenticated Team.
//! No client packet can directly choose money, ownership, world position, time,
//! champion_revision, item stats, status effects or RNG.
//!
//! This kernel owns only gold/inventory/shop ledger and Undo. It does NOT apply
//! item stats, effects, trinkets, waves, XP, combat or network receipt idempotency.
//! The integrator must atomically commit these changes with full core-state
//! and reject/rollback the entire transaction if item stat application fails.
use coachlol_core_items::{consumed_components, item, purchase_cost, ItemSpec};
pub mod transaction;
pub mod active_items;

pub const INVENTORY_CAP: usize = 6;
pub const UNDO_CAP: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Team { Blue, Red }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Role { Top, Jungle, Mid, Adc, Support }
impl Role {
    pub const fn source_code(self) -> &'static str {
        match self {
            Self::Top => "TOP", Self::Jungle => "JG", Self::Mid => "MID",
            Self::Adc => "ADC", Self::Support => "SUP",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase { Preparation, Planning, Decision, Executing, Ended }

/// Values from server-owned authoritative simulation ONLY.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ShopContext {
    pub time: i64,
    pub phase: Phase,
    pub team_ready: bool,
    pub decision_pending: bool,
    pub at_fountain: bool,
    pub alive: bool,
    pub champion_revision: u64,
}
impl ShopContext {
    pub fn planning(time: i64) -> Self {
        Self { time, phase: Phase::Preparation, team_ready: false,
            decision_pending: false, at_fountain: true, alive: true, champion_revision: 0 }
    }
    fn allowed(&self) -> bool {
        matches!(self.phase, Phase::Preparation | Phase::Planning)
            && !self.team_ready && !self.decision_pending
    }
    fn shop_reachable(&self) -> bool { !self.alive || self.at_fountain }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShopError {
    WrongOwner, InvalidPhase, AwayFromFountain, UnknownItem,
    ItemNotPurchasable, ItemRoleLocked, JunglePetRequired, JunglePetAlreadyOwned,
    InventoryFull, InsufficientGold, UniqueViolation, BootsAlreadyOwned,
    StarterAlreadyOwned, ConsumableLimit, QuestItemProtected,
    UnsupportedOperation, InvalidIndex, NoUndo, UndoRevoked, UndoStateChanged,
    GoldOverflow,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShopAction { Buy, Sell, UndoBuy, UndoSell }

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ShopReceipt {
    pub action: ShopAction,
    pub item_id: String,
    pub delta_gold: i64,
    pub consumed_components: Vec<String>,
    /// The item-stat adapter MUST atomically apply this inventory delta too.
    pub item_stats_pending: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct EconomicSnapshot {
    gold: i64,
    items: Vec<String>,
    jungle_pet: Option<String>,
    control_ward_stock: u8,
}
#[derive(Debug, Clone, PartialEq, Eq)]
struct UndoEntry {
    before: EconomicSnapshot,
    after: EconomicSnapshot,
    item_id: String,
    action: ShopAction,
    amount: i64,
    at: i64,
    champion_revision: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ShopUnit {
    id: String,
    team: Team,
    role: Role,
    gold: i64,
    items: Vec<String>,
    jungle_pet: Option<String>,
    control_ward_stock: u8,
    undo_history: Vec<UndoEntry>,
    undo_revoked: bool,
}

impl ShopUnit {
    pub fn new(id: impl Into<String>, team: Team, role: Role, gold: i64) -> Result<Self, ShopError> {
        if gold < 0 { return Err(ShopError::InsufficientGold); }
        let id = id.into();
        let prefix = match team { Team::Blue => "blue_", Team::Red => "red_" };
        // No extra bytes, aliases or ambiguous sub-IDs: one seat owns exactly
        // five fixed champion role IDs, never an arbitrary matching suffix.
        if id != format!("{prefix}{}", role.source_code()) {
            return Err(ShopError::WrongOwner);
        }
        Ok(Self { id, team, role, gold, items: Vec::new(),
            jungle_pet: None, control_ward_stock: 0,
            undo_history: Vec::new(), undo_revoked: false })
    }
    pub fn id(&self) -> &str { &self.id }
    pub const fn team(&self) -> Team { self.team }
    pub const fn role(&self) -> Role { self.role }
    pub const fn gold(&self) -> i64 { self.gold }
    pub fn items(&self) -> &[String] { &self.items }
    pub fn pet(&self) -> Option<&str> { self.jungle_pet.as_deref() }
    pub const fn control_ward_stock(&self) -> u8 { self.control_ward_stock }
    pub fn undo_history_len(&self) -> usize { self.undo_history.len() }
    pub const fn undo_revoked(&self) -> bool { self.undo_revoked }

    fn snapshot(&self) -> EconomicSnapshot {
        EconomicSnapshot { gold: self.gold, items: self.items.clone(),
            jungle_pet: self.jungle_pet.clone(), control_ward_stock: self.control_ward_stock }
    }
    fn restore_snapshot(&mut self, s: EconomicSnapshot) {
        self.gold = s.gold; self.items = s.items;
        self.jungle_pet = s.jungle_pet; self.control_ward_stock = s.control_ward_stock;
    }
    fn check_owner(&self, seat: Team) -> Result<(), ShopError> {
        if seat == self.team { Ok(()) } else { Err(ShopError::WrongOwner) }
    }
    fn check_window(&self, context: &ShopContext) -> Result<(), ShopError> {
        if !context.allowed() { return Err(ShopError::InvalidPhase); }
        if !context.shop_reachable() { return Err(ShopError::AwayFromFountain); }
        Ok(())
    }
    /// Authoritative source-exit notification: irreversible across reconnect.
    pub fn on_fountain_presence(&mut self, alive: bool, in_fountain: bool) {
        if alive && !in_fountain && !self.undo_history.is_empty() {
            self.undo_history.clear();
            self.undo_revoked = true;
        }
    }
    fn record_undo(&mut self, before: EconomicSnapshot, context: &ShopContext,
                   action: ShopAction, item_id: &str, amount: i64) {
        self.undo_revoked = false;
        let after = self.snapshot();
        self.undo_history.push(UndoEntry {
            before, after, item_id: item_id.to_string(), action, amount,
            at: context.time, champion_revision: context.champion_revision,
        });
        if self.undo_history.len() > UNDO_CAP { self.undo_history.remove(0); }
    }
    fn consumed(&self, id: &str) -> Vec<String> {
        consumed_components(id, &self.items)
    }
    fn has_tag(&self, tag: &str) -> bool {
        self.items.iter().any(|id| item(id).map(|i| i.has(tag)).unwrap_or(false))
    }
    fn exclusive_belongs_to_unconsumed(&self, tag: &str, consumed: &[String]) -> bool {
        let mut remaining = self.items.clone();
        for id in consumed {
            if let Some(index) = remaining.iter().position(|owned| owned == id) {
                remaining.remove(index);
            }
        }
        remaining.iter().any(|id| item(id).map(|i| i.has(tag)).unwrap_or(false))
    }
    fn purchase_rule(&self, spec: &ItemSpec, consumed: &[String]) -> Result<(), ShopError> {
        if spec.not_purchasable || spec.has("trinket") {
            return Err(ShopError::ItemNotPurchasable);
        }
        if spec.role_lock.is_some_and(|role| role != self.role.source_code()) {
            return Err(ShopError::ItemRoleLocked);
        }
        if spec.id == "health_potion" &&
            self.items.iter().filter(|x| x.as_str() == "health_potion").count() >= 5 {
            return Err(ShopError::ConsumableLimit);
        }
        if (spec.id == "health_potion" && self.items.iter().any(|x| x == "refillable_potion")) ||
           (spec.id == "refillable_potion" && self.items.iter().any(|x| x == "health_potion")) {
            return Err(ShopError::ConsumableLimit);
        }
        if spec.id == "ward" && self.control_ward_stock >= 2 {
            return Err(ShopError::ConsumableLimit);
        }
        if (spec.has("unique") || spec.has("legendary") || spec.has("epic")) &&
            self.items.iter().any(|x| x == spec.id) {
            return Err(ShopError::UniqueViolation);
        }
        if ["annul", "lifeline"].iter().any(|tag| spec.has(tag) &&
            self.exclusive_belongs_to_unconsumed(tag, consumed)) {
            return Err(ShopError::UniqueViolation);
        }
        if spec.has("fatality") && self.items.iter().any(|id|
            id != spec.id && item(id).is_some_and(|x| x.has("fatality"))) {
            return Err(ShopError::UniqueViolation);
        }
        if (spec.id == "sheen" || spec.id == "trinity_force") &&
            self.items.iter().any(|id| (id == "sheen" || id == "trinity_force")
                && !spec.recipe.contains(&id.as_str())) {
            return Err(ShopError::UniqueViolation);
        }
        if self.role == Role::Jungle && self.jungle_pet.is_none() &&
            spec.pet.is_none() && spec.id != "ward" {
            return Err(ShopError::JunglePetRequired);
        }
        if spec.pet.is_some() && self.jungle_pet.is_some() {
            return Err(ShopError::JunglePetAlreadyOwned);
        }
        if spec.id == "support_atlas" &&
            self.items.iter().any(|id| id.starts_with("support_")) {
            return Err(ShopError::UniqueViolation);
        }
        if spec.id == "dark_seal" && self.items.iter().any(|id| id == "mejais_soulstealer") {
            return Err(ShopError::UniqueViolation);
        }
        if spec.has("starter") && spec.role_lock.is_none() && self.has_tag("starter") {
            return Err(ShopError::StarterAlreadyOwned);
        }
        if (spec.id == "boots" || spec.has("boots")) &&
            self.items.iter().any(|id| id == "boots" || item(id).is_some_and(|x| x.has("boots"))) &&
            !spec.recipe.iter().any(|ingredient| self.items.iter().any(|own| own == ingredient)) {
            return Err(ShopError::BootsAlreadyOwned);
        }
        if self.items.len() >= INVENTORY_CAP && consumed.is_empty() {
            return Err(ShopError::InventoryFull);
        }
        Ok(())
    }
    pub fn quote_buy(&self, seat: Team, context: &ShopContext,
                     item_id: &str) -> Result<i64, ShopError> {
        self.check_owner(seat)?;
        self.check_window(context)?;
        let spec = item(item_id).ok_or(ShopError::UnknownItem)?;
        let consumed = self.consumed(item_id);
        self.purchase_rule(spec, &consumed)?;
        let cost = purchase_cost(item_id, &self.items).ok_or(ShopError::UnknownItem)?;
        if self.gold < cost { return Err(ShopError::InsufficientGold); }
        Ok(cost)
    }
    pub fn buy(&mut self, seat: Team, context: &ShopContext,
               item_id: &str) -> Result<ShopReceipt, ShopError> {
        let cost = self.quote_buy(seat, context, item_id)?;
        let spec = item(item_id).ok_or(ShopError::UnknownItem)?;
        let consumed = self.consumed(item_id);
        let before = self.snapshot();
        let next_gold = self.gold.checked_sub(cost).ok_or(ShopError::GoldOverflow)?;
        // All preflight checks complete; economic commit is one mutation group.
        let mut next_items = self.items.clone();
        for component in &consumed {
            let idx = next_items.iter().position(|x| x == component)
                .ok_or(ShopError::UnknownItem)?;
            next_items.remove(idx);
        }
        if next_items.len() >= INVENTORY_CAP { return Err(ShopError::InventoryFull); }
        next_items.push(spec.id.to_string());
        self.gold = next_gold;
        self.items = next_items;
        if let Some(pet) = spec.pet { self.jungle_pet = Some(pet.to_string()); }
        if spec.id == "ward" { self.control_ward_stock += 1; }
        self.record_undo(before, context, ShopAction::Buy, item_id, cost);
        Ok(ShopReceipt { action: ShopAction::Buy, item_id: spec.id.to_string(),
            delta_gold: -cost, consumed_components: consumed,
            item_stats_pending: true })
    }
    pub fn sell(&mut self, seat: Team, context: &ShopContext,
                index: usize) -> Result<ShopReceipt, ShopError> {
        self.check_owner(seat)?;
        self.check_window(context)?;
        let id = self.items.get(index).ok_or(ShopError::InvalidIndex)?.clone();
        let spec = item(&id).ok_or(ShopError::UnknownItem)?;
        if spec.pet.is_some() || spec.role_lock.is_some() || spec.not_purchasable ||
           spec.has("quest") || spec.has("trinket") {
            return Err(ShopError::QuestItemProtected);
        }
        let refund = spec.sell.ok_or(ShopError::UnsupportedOperation)?;
        let next_gold = self.gold.checked_add(refund).ok_or(ShopError::GoldOverflow)?;
        let before = self.snapshot();
        self.items.remove(index);
        self.gold = next_gold;
        if id == "ward" { self.control_ward_stock = self.control_ward_stock.saturating_sub(1); }
        self.record_undo(before, context, ShopAction::Sell, &id, refund);
        Ok(ShopReceipt { action: ShopAction::Sell, item_id: id,
            delta_gold: refund, consumed_components: Vec::new(), item_stats_pending: true })
    }
    pub fn award_gold(&mut self, amount: i64) -> Result<(), ShopError> {
        if amount < 0 { return Err(ShopError::InsufficientGold); }
        self.gold = self.gold.checked_add(amount).ok_or(ShopError::GoldOverflow)?;
        Ok(())
    }
    pub fn undo(&mut self, seat: Team,
                context: &ShopContext) -> Result<ShopReceipt, ShopError> {
        self.check_owner(seat)?;
        self.check_window(context)?;
        if self.undo_revoked { return Err(ShopError::UndoRevoked); }
        let entry = self.undo_history.last().ok_or(ShopError::NoUndo)?.clone();
        if context.time != entry.at || context.champion_revision != entry.champion_revision
            || self.snapshot() != entry.after {
            return Err(ShopError::UndoStateChanged);
        }
        self.undo_history.pop();
        self.restore_snapshot(entry.before);
        self.undo_revoked = false;
        Ok(ShopReceipt {
            action: match entry.action { ShopAction::Buy => ShopAction::UndoBuy,
                ShopAction::Sell => ShopAction::UndoSell, other => other },
            item_id: entry.item_id,
            delta_gold: match entry.action { ShopAction::Buy => entry.amount,
                ShopAction::Sell => -entry.amount, _ => 0 },
            consumed_components: Vec::new(), item_stats_pending: true,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn unit(team: Team, role: Role, gold: i64) -> ShopUnit {
        let prefix = if team == Team::Blue { "blue" } else { "red" };
        ShopUnit::new(format!("{}_{}", prefix, role.source_code()), team, role, gold).unwrap()
    }
    fn check_both(f: impl Fn(Team)) { for t in [Team::Blue, Team::Red] { f(t); } }

    #[test]
    fn buy_sell_refund_and_lifo_undo_on_both_sides() {
        check_both(|team| {
            let mut x = unit(team, Role::Mid, 1000);
            let ctx = ShopContext::planning(0);
            let p = x.buy(team, &ctx, "boots").unwrap();
            assert_eq!(p.delta_gold, -300);
            assert_eq!(x.gold(), 700);
            assert_eq!(x.sell(team, &ctx, 0).unwrap().delta_gold, 210);
            assert_eq!(x.gold(), 910);
            assert_eq!(x.undo(team, &ctx).unwrap().action, ShopAction::UndoSell);
            assert_eq!(x.gold(), 700);
            assert_eq!(x.items(), ["boots"]);
            assert_eq!(x.undo(team, &ctx).unwrap().action, ShopAction::UndoBuy);
            assert_eq!(x.gold(), 1000);
            assert!(x.items().is_empty());
        });
    }
    #[test]
    fn double_component_buy_spends_each_instance_once() {
        check_both(|team| {
            let mut x = unit(team, Role::Mid, 10000);
            let ctx = ShopContext::planning(0);
            x.buy(team, &ctx, "long_sword").unwrap();
            x.buy(team, &ctx, "long_sword").unwrap();
            let price = x.quote_buy(team, &ctx, "serrated_dirk").unwrap();
            assert_eq!(price, 1000 - 700);
            let r = x.buy(team, &ctx, "serrated_dirk").unwrap();
            assert_eq!(r.consumed_components, ["long_sword", "long_sword"]);
            assert_eq!(x.items(), ["serrated_dirk"]);
        });
    }
    #[test]
    fn jungle_first_pet_and_five_champions_both_teams() {
        check_both(|team| {
            let mut x = unit(team, Role::Jungle, 2000);
            let ctx = ShopContext::planning(0);
            assert_eq!(x.buy(team, &ctx, "boots"), Err(ShopError::JunglePetRequired));
            x.buy(team, &ctx, "jungle_gustwalker").unwrap();
            assert_eq!(x.pet(), Some("gustwalker"));
            x.buy(team, &ctx, "boots").unwrap();
            assert_eq!(x.buy(team, &ctx, "jungle_mosstomper"), Err(ShopError::JunglePetAlreadyOwned));
        });
    }
    #[test]
    fn leaving_fountain_irreversibly_invalidates_undo() {
        check_both(|team| {
            let mut x = unit(team, Role::Mid, 1000);
            let ctx = ShopContext::planning(0);
            x.buy(team, &ctx, "boots").unwrap();
            x.on_fountain_presence(true, false);
            x.on_fountain_presence(true, true);
            assert_eq!(x.undo(team, &ctx), Err(ShopError::UndoRevoked));
            x.buy(team, &ctx, "long_sword").unwrap();
            assert_eq!(x.undo(team, &ctx).unwrap().item_id, "long_sword");
            assert_eq!(x.items(), ["boots"]);
        });
    }
    #[test]
    fn snapshot_revision_and_time_protect_undo() {
        let mut x = unit(Team::Blue, Role::Mid, 1000);
        let ctx = ShopContext::planning(0);
        x.buy(Team::Blue, &ctx, "boots").unwrap();
        let changed = ShopContext { champion_revision: 1, ..ctx };
        assert_eq!(x.undo(Team::Blue, &changed), Err(ShopError::UndoStateChanged));
        let later = ShopContext { time: 1, ..ctx };
        assert_eq!(x.undo(Team::Blue, &later), Err(ShopError::UndoStateChanged));
        x.award_gold(45).unwrap();
        assert_eq!(x.undo(Team::Blue, &ctx), Err(ShopError::UndoStateChanged));
    }
    #[test]
    fn wrong_owner_and_ready_cannot_mutate() {
        let mut x = unit(Team::Blue, Role::Mid, 1000);
        let ctx = ShopContext::planning(0);
        assert_eq!(x.buy(Team::Red, &ctx, "boots"), Err(ShopError::WrongOwner));
        let ready = ShopContext { team_ready: true, ..ctx };
        assert_eq!(x.buy(Team::Blue, &ready, "boots"), Err(ShopError::InvalidPhase));
        assert_eq!(x.gold(), 1000);
    }
    #[test]
    fn special_exclusivity_and_trinket_gate() {
        let ctx = ShopContext::planning(0);
        let mut x = unit(Team::Blue, Role::Mid, 20000);
        assert_eq!(x.buy(Team::Blue, &ctx, "trinket_oracle"), Err(ShopError::ItemNotPurchasable));
        x.buy(Team::Blue, &ctx, "banshees_veil").unwrap();
        assert_eq!(x.buy(Team::Blue, &ctx, "edge_of_night"), Err(ShopError::UniqueViolation));
    }
    #[test]
    fn exactly_six_slots_and_16_undo_entries() {
        let mut x = unit(Team::Blue, Role::Mid, 50000);
        let ctx = ShopContext::planning(0);
        for _ in 0..6 { x.buy(Team::Blue, &ctx, "dagger").unwrap(); }
        assert_eq!(x.buy(Team::Blue, &ctx, "long_sword"), Err(ShopError::InventoryFull));
        for _ in 0..6 { x.sell(Team::Blue, &ctx, 0).unwrap(); }
        assert_eq!(x.undo_history_len(), 12);
        for _ in 0..6 { x.buy(Team::Blue, &ctx, "dagger").unwrap(); }
        assert_eq!(x.undo_history_len(), 16);
    }
    #[test]
    fn b12c_exact_five_role_identifiers_only_for_each_team() {
        for team in [Team::Blue, Team::Red] {
            let prefix = if team == Team::Blue { "blue" } else { "red" };
            let wrong = if team == Team::Blue { "red" } else { "blue" };
            for role in [Role::Top, Role::Jungle, Role::Mid, Role::Adc, Role::Support] {
                let exact = format!("{prefix}_{}", role.source_code());
                assert_eq!(
                    ShopUnit::new(exact.clone(), team, role, 500).unwrap().id(),
                    exact
                );
                for injected in [
                    format!("{prefix}_FAKE_{}", role.source_code()),
                    format!("{prefix}__{}", role.source_code()),
                    format!("{prefix}_{}_EXTRA", role.source_code()),
                    format!("{wrong}_{}", role.source_code()),
                    format!("{prefix}_{wrong}_{}", role.source_code()),
                ] {
                    assert_eq!(
                        ShopUnit::new(injected, team, role, 500),
                        Err(ShopError::WrongOwner)
                    );
                }
            }
        }
    }

    #[test]
    fn b12c_denied_operations_never_modify_own_gold_or_inventory() {
        for team in [Team::Blue, Team::Red] {
            let mut shop = unit(team, Role::Mid, 500);
            let context = ShopContext::planning(0);
            let old = shop.clone();
            assert_eq!(shop.buy(team, &context, "rabadon"), Err(ShopError::InsufficientGold));
            assert_eq!(shop, old);
            assert_eq!(shop.buy(team, &context, "trinket_oracle"), Err(ShopError::ItemNotPurchasable));
            assert_eq!(shop, old);
            let rival = if team == Team::Blue { Team::Red } else { Team::Blue };
            assert_eq!(shop.buy(rival, &context, "boots"), Err(ShopError::WrongOwner));
            assert_eq!(shop, old);
            assert_eq!(shop.sell(team, &context, 0), Err(ShopError::InvalidIndex));
            assert_eq!(shop, old);
        }
    }

}
