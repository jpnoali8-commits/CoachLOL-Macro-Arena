//! M45 B12F: Rust-native Annul shield state + economy/Mercury transaction lifecycle.
//! These contracts are isolated until native match actor/core-combat validation.
//! All time, hits, ownership, inventory and champion identity MUST be server-owned.
use coachlol_core_items::annul::{inventory_annul, ANNUL_KEY, SHIELD_FOREVER};
use super::{ShopContext, ShopReceipt, Team};
use super::transaction::{AtomicError, AtomicShop};
use super::active_items::{activate, ActiveContext, ActiveError, ActiveReceipt, MercuryState};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AnnulError {
    InvalidTime, LayerOverflow, RuntimeDiverged, Economy(AtomicError),
}
impl From<AtomicError> for AnnulError {
    fn from(err: AtomicError) -> Self { Self::Economy(err) }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ShieldLayer { pub id: u64, pub key: String, pub until: f64 }

#[derive(Debug, Clone, PartialEq)]
pub struct AnnulState {
    pub alive: bool,
    pub ready_at: f64,
    pub last_layer_id: u64,
    pub layers: Vec<ShieldLayer>,
}
impl Default for AnnulState {
    fn default() -> Self {
        Self { alive: true, ready_at: 0.0, last_layer_id: 0, layers: Vec::new() }
    }
}
impl AnnulState {
    fn time(now: f64) -> Result<(), AnnulError> {
        if !now.is_finite() || now < 0.0 { Err(AnnulError::InvalidTime) } else { Ok(()) }
    }
    fn add(&mut self, key: &str) -> Result<(), AnnulError> {
        let id = self.last_layer_id.checked_add(1).ok_or(AnnulError::LayerOverflow)?;
        self.last_layer_id = id;
        self.layers.push(ShieldLayer { id, key: key.to_owned(), until: SHIELD_FOREVER });
        Ok(())
    }
    pub fn add_external(&mut self, now: f64) -> Result<(), AnnulError> {
        Self::time(now)?;
        self.add("external")
    }
    pub fn own_layers(&self) -> impl Iterator<Item=&ShieldLayer> {
        self.layers.iter().filter(|layer| layer.key == ANNUL_KEY)
    }
    pub fn own_active(&self, now: f64) -> bool {
        self.own_layers().any(|layer| layer.until > now)
    }
    pub fn active_spell_shields(&self, now: f64) -> usize {
        self.layers.iter().filter(|layer| layer.until > now).count()
    }
    pub fn refresh(&mut self, inventory: &[String], now: f64) -> Result<bool, AnnulError> {
        Self::time(now)?;
        if !self.alive || inventory_annul(inventory).is_none() || self.ready_at > now
            || self.active_spell_shields(now) > 0 {
            return Ok(false);
        }
        self.add(ANNUL_KEY)?;
        Ok(true)
    }
    /// Blocks one hostile spell; caller handles the actual spell/damage and journal.
    pub fn consume(&mut self, inventory: &[String], now: f64) -> Result<bool, AnnulError> {
        Self::time(now)?;
        let Some(index) = self.layers.iter().position(|layer| layer.until > now) else {
            return Ok(false);
        };
        let own = self.layers[index].key == ANNUL_KEY;
        let next = if own {
            inventory_annul(inventory).map(|s| now + s.cooldown_seconds as f64)
        } else { None };
        if next.is_some_and(|v| !v.is_finite()) {
            return Err(AnnulError::InvalidTime);
        }
        self.layers[index].until = now;
        if let Some(t) = next { self.ready_at = t; }
        Ok(true)
    }
    /// Positive, actually dealt enemy-champion damage while the shield is down.
    pub fn on_champion_damage(&mut self, inv: &[String], now: f64, dealt: f64,
                              enemy_champion: bool) -> Result<bool, AnnulError> {
        Self::time(now)?;
        if !dealt.is_finite() || dealt < 0.0 { return Err(AnnulError::InvalidTime); }
        if dealt <= 0.0 || !enemy_champion || self.ready_at <= now {
            return Ok(false);
        }
        let Some(spec) = inventory_annul(inv) else { return Ok(false) };
        let next = now + spec.cooldown_seconds as f64;
        if !next.is_finite() { return Err(AnnulError::InvalidTime); }
        self.ready_at = next;
        Ok(true)
    }
    pub fn on_death(&mut self, inv: &[String], now: f64) -> Result<(), AnnulError> {
        Self::time(now)?;
        if let Some(spec) = inventory_annul(inv) {
            let next = now + spec.cooldown_seconds as f64;
            if !next.is_finite() { return Err(AnnulError::InvalidTime); }
            self.ready_at = next;
            for layer in &mut self.layers {
                if layer.key == ANNUL_KEY { layer.until = now; }
            }
        }
        self.alive = false;
        Ok(())
    }
    pub fn revive(&mut self) { self.alive = true; }
    pub fn equipment_change(&mut self, old: &[String], new: &[String],
                            now: f64) -> Result<(), AnnulError> {
        Self::time(now)?;
        match (inventory_annul(old), inventory_annul(new)) {
            (None, Some(_)) => {
                self.ready_at = now;
                self.refresh(new, now)?;
            }
            (Some(_), None) => {
                self.ready_at = 0.0;
                for layer in &mut self.layers {
                    if layer.key == ANNUL_KEY { layer.until = now; }
                }
            }
            (Some(a), Some(b)) if a.id != b.id => {
                // Upgrading Verdant -> Banshee keeps its old 60s cooldown.
                self.refresh(new, now)?;
            }
            _ => {}
        }
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq)]
struct EffectUndo {
    previous_annul: AnnulState, committed_annul: AnnulState,
    previous_mercury: MercuryState, committed_mercury: MercuryState,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ItemRuntimeShop {
    shop: AtomicShop,
    annul: AnnulState,
    mercury: MercuryState,
    history: Vec<EffectUndo>,
}
impl ItemRuntimeShop {
    pub fn new(shop: AtomicShop) -> Self {
        let hp = shop.stats().hp;
        Self { shop, annul: AnnulState::default(), mercury: MercuryState::new(hp),
            history: Vec::new() }
    }
    pub fn shop(&self) -> &AtomicShop { &self.shop }
    pub fn annul(&self) -> &AnnulState { &self.annul }
    pub fn mercury(&self) -> &MercuryState { &self.mercury }
    fn append(&mut self, old_annul: AnnulState, old_mercury: MercuryState) {
        if self.shop.undo_depth() == 1 { self.history.clear(); }
        self.history.push(EffectUndo {
            previous_annul: old_annul, committed_annul: self.annul.clone(),
            previous_mercury: old_mercury, committed_mercury: self.mercury.clone(),
        });
        while self.history.len() > self.shop.undo_depth() { self.history.remove(0); }
    }
    pub fn buy(&mut self, seat: Team, ctx: &ShopContext, id: &str)
        -> Result<ShopReceipt, AnnulError> {
        let mut staged_shop = self.shop.clone();
        let inventory_before = staged_shop.economy().items().to_vec();
        let receipt = staged_shop.buy(seat, ctx, id)?;
        let mut staged_annul = self.annul.clone();
        staged_annul.equipment_change(
            &inventory_before, staged_shop.economy().items(), ctx.time as f64
        )?;
        let old_annul = self.annul.clone();
        let old_mercury = self.mercury.clone();
        self.shop = staged_shop;
        self.annul = staged_annul;
        self.append(old_annul, old_mercury);
        Ok(receipt)
    }
    pub fn sell(&mut self, seat: Team, ctx: &ShopContext, index: usize)
        -> Result<ShopReceipt, AnnulError> {
        let mut staged_shop = self.shop.clone();
        let inventory_before = staged_shop.economy().items().to_vec();
        let receipt = staged_shop.sell(seat, ctx, index)?;
        let mut staged_annul = self.annul.clone();
        staged_annul.equipment_change(
            &inventory_before, staged_shop.economy().items(), ctx.time as f64
        )?;
        let mut staged_mercury = self.mercury.clone();
        if receipt.item_id == "mercurial_scimitar" { staged_mercury.sprint_until = 0.0; }
        let old_annul = self.annul.clone();
        let old_mercury = self.mercury.clone();
        self.shop = staged_shop;
        self.annul = staged_annul;
        self.mercury = staged_mercury;
        self.append(old_annul, old_mercury);
        Ok(receipt)
    }
    pub fn undo(&mut self, seat: Team, ctx: &ShopContext)
        -> Result<ShopReceipt, AnnulError> {
        let snapshot = self.history.last().ok_or(AnnulError::RuntimeDiverged)?;
        if self.annul != snapshot.committed_annul || self.mercury != snapshot.committed_mercury {
            return Err(AnnulError::RuntimeDiverged);
        }
        let mut staged_shop = self.shop.clone();
        let receipt = staged_shop.undo(seat, ctx)?;
        let old = snapshot.clone();
        self.shop = staged_shop;
        self.annul = old.previous_annul;
        self.mercury = old.previous_mercury;
        self.history.pop();
        Ok(receipt)
    }
    pub fn on_fountain_presence(&mut self, alive: bool, at_fountain: bool) {
        self.shop.on_fountain_presence(alive, at_fountain);
        if self.shop.undo_depth() == 0 { self.history.clear(); }
    }
    pub fn refresh(&mut self, now: f64) -> Result<bool, AnnulError> {
        self.annul.refresh(self.shop.economy().items(), now)
    }
    pub fn block(&mut self, now: f64) -> Result<bool, AnnulError> {
        self.annul.consume(self.shop.economy().items(), now)
    }
    pub fn damage(&mut self, now: f64, dealt: f64) -> Result<bool, AnnulError> {
        self.annul.on_champion_damage(self.shop.economy().items(), now, dealt, true)
    }
    pub fn die(&mut self, now: f64) -> Result<(), AnnulError> {
        self.annul.on_death(self.shop.economy().items(), now)
    }
    pub fn add_external(&mut self, now: f64) -> Result<(), AnnulError> {
        self.annul.add_external(now)
    }
    pub fn activate_mercury(&mut self, team: Team, ctx: ActiveContext<'_>, id: &str)
        -> Result<ActiveReceipt, ActiveError> {
        activate(team, self.shop.economy(), &mut self.mercury, ctx, id)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use super::super::{ShopUnit, Role, Phase};
    use super::super::transaction::LiveItemStats;
    fn fixture(team: Team) -> ItemRuntimeShop {
        let prefix = if team == Team::Blue { "blue" } else { "red" };
        let owner = ShopUnit::new(format!("{prefix}_MID"), team, Role::Mid, 50000).unwrap();
        let live = LiveItemStats::new(1000.0, 1000.0, 500.0, 500.0).unwrap();
        ItemRuntimeShop::new(AtomicShop::new(owner, live).unwrap())
    }
    #[test]
    fn both_teams_receive_shield_then_restore_on_sale_undo() {
        for team in [Team::Blue, Team::Red] {
            let mut x = fixture(team);
            let ctx = ShopContext::planning(10);
            x.buy(team, &ctx, "banshees_veil").unwrap();
            assert!(x.annul().own_active(10.0));
            let prior = x.clone();
            x.sell(team, &ctx, 0).unwrap();
            assert!(!x.annul().own_active(10.0));
            x.undo(team, &ctx).unwrap();
            assert_eq!(x, prior);
        }
    }
    #[test]
    fn upgrade_preserves_downtime_and_recharges_at_boundary() {
        let mut x = fixture(Team::Blue);
        x.buy(Team::Blue, &ShopContext::planning(10), "verdant_barrier").unwrap();
        assert!(x.block(10.0).unwrap());
        assert_eq!(x.annul().ready_at, 70.0);
        x.buy(Team::Blue, &ShopContext::planning(11), "banshees_veil").unwrap();
        assert_eq!(x.annul().ready_at, 70.0);
        assert!(!x.refresh(69.0).unwrap());
        assert!(x.refresh(70.0).unwrap());
    }
    #[test]
    fn enemy_damage_during_cooldown_delays_restore() {
        let mut x = fixture(Team::Red);
        x.buy(Team::Red, &ShopContext::planning(10), "edge_of_night").unwrap();
        x.block(10.0).unwrap();
        assert!(x.damage(11.0, 33.0).unwrap());
        assert_eq!(x.annul().ready_at, 51.0);
        assert!(!x.refresh(50.0).unwrap());
        assert!(x.refresh(51.0).unwrap());
    }
    #[test]
    fn death_blocks_refresh_even_after_nominal_recovery() {
        let mut x = fixture(Team::Blue);
        x.buy(Team::Blue, &ShopContext::planning(10), "verdant_barrier").unwrap();
        x.die(11.0).unwrap();
        assert_eq!(x.annul().ready_at, 71.0);
        assert!(!x.refresh(100.0).unwrap());
    }
    #[test]
    fn mercury_sale_cancels_sprint_and_undo_restores_it() {
        let team = Team::Blue;
        let mut x = fixture(team);
        let ctx = ShopContext::planning(10);
        x.buy(team, &ctx, "mercurial_scimitar").unwrap();
        let active = ActiveContext {
            now: 10.0, phase: Phase::Planning, ready: false,
            pending_unit: Some("blue_MID"), ended: false,
        };
        x.activate_mercury(team, active, "mercurial_scimitar").unwrap();
        assert_eq!(x.mercury().sprint_until, 11.5);
        x.sell(team, &ctx, 0).unwrap();
        assert_eq!(x.mercury().sprint_until, 0.0);
        x.undo(team, &ctx).unwrap();
        assert_eq!(x.mercury().sprint_until, 11.5);
    }
    #[test]
    fn runtime_changes_block_undo_without_deducting_gold_twice() {
        let team = Team::Red;
        let mut x = fixture(team);
        let ctx = ShopContext::planning(10);
        x.buy(team, &ctx, "verdant_barrier").unwrap();
        x.block(10.0).unwrap();
        let gold = x.shop().economy().gold();
        assert_eq!(x.undo(team, &ctx), Err(AnnulError::RuntimeDiverged));
        assert_eq!(x.shop().economy().gold(), gold);
    }
}
