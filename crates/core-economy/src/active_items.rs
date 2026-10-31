//! M45 B12E isolated Rust active Mercury adapter, not a match server.
//! Identity, statuses and context must be server-derived, never client supplied.
use super::{Phase,ShopUnit,Team};
use coachlol_core_items::active_items::{mercury_spec,CLEANSE,STUN_BLOCKERS};

#[derive(Debug,Clone,Copy,PartialEq,Eq)]
pub enum ActiveError { NotEquipped, Phase, Decision, Stasis, Cooldown, InvalidTime }
impl ActiveError {
    pub const fn reason(self)-> &'static str {
        match self {
            Self::NotEquipped=>"item_ativo_nao_equipado",
            Self::Phase=>"fase_invalida",
            Self::Decision=>"decisao_nao_autorizada",
            Self::Stasis=>"estase",
            Self::Cooldown=>"item_em_recarga",
            Self::InvalidTime=>"tempo_servidor_invalido",
        }
    }
}
#[derive(Debug,Clone,Copy)]
pub struct ActiveContext<'a> {
    pub now:f64, pub phase:Phase, pub ready:bool,
    pub pending_unit:Option<&'a str>, pub ended:bool,
}
#[derive(Debug,Clone,PartialEq)]
pub struct TimedEffect { pub id:u64, pub kind:String, pub until:f64 }
#[derive(Debug,Clone,PartialEq)]
pub struct MercuryState {
    pub hp:f64, pub stasis_until:f64, pub cooldown_until:f64,
    pub sprint_until:f64, pub statuses:Vec<TimedEffect>,
    pub root_until:f64, pub stun_until:f64, pub grounded_until:f64,
}
impl MercuryState {
    pub fn new(hp:f64)->Self {
        Self { hp,stasis_until:0.0,cooldown_until:0.0,sprint_until:0.0,
            statuses:Vec::new(),root_until:0.0,stun_until:0.0,grounded_until:0.0 }
    }
    fn valid(&self)->bool {
        [self.hp,self.stasis_until,self.cooldown_until,self.sprint_until,
        self.root_until,self.stun_until,self.grounded_until].iter().all(|v|v.is_finite())
        && self.statuses.iter().all(|e|e.until.is_finite())
    }
}
#[derive(Debug,Clone,PartialEq)]
pub struct ActiveReceipt {
    pub item_id:&'static str,pub removed:usize,
    pub cooldown_until:f64,pub sprint_until:f64,pub speed_fraction:f64,
}
pub fn activate(
    seat:Team,unit:&ShopUnit,state:&mut MercuryState,
    context:ActiveContext<'_>,id:&str,
)->Result<ActiveReceipt,ActiveError>{
    let spec=mercury_spec(id);
    if unit.team()!=seat||state.hp<=0.0||spec.is_none()||
       !unit.items().iter().any(|owned|owned==id) { return Err(ActiveError::NotEquipped); }
    let spec=spec.unwrap();
    if !context.now.is_finite()||!state.valid(){return Err(ActiveError::InvalidTime);}
    if context.ended||!matches!(context.phase,Phase::Preparation|Phase::Planning|Phase::Decision)
        ||(context.phase!=Phase::Decision&&context.ready) {return Err(ActiveError::Phase);}
    if context.phase==Phase::Decision&&context.pending_unit!=Some(unit.id()){
        return Err(ActiveError::Decision);
    }
    if state.stasis_until>context.now {return Err(ActiveError::Stasis);}
    if state.cooldown_until>context.now {return Err(ActiveError::Cooldown);}
    let next=context.now+spec.cooldown;
    let sprint=if spec.sprint>0.0 {context.now+spec.sprint} else {state.sprint_until};
    if !next.is_finite()||!sprint.is_finite(){return Err(ActiveError::InvalidTime);}
    // Clone first: rejected action must never mutate item state or status effects.
    let mut stage=state.clone();
    let count=stage.statuses.len();
    stage.statuses.retain(|x|!CLEANSE.contains(&x.kind.as_str()));
    let removed=count-stage.statuses.len();
    stage.root_until=stage.statuses.iter().filter(|e|e.until>context.now&&e.kind=="root")
        .fold(0.0,|a,e|f64::max(a,e.until));
    stage.stun_until=stage.statuses.iter().filter(|e|e.until>context.now&&
        STUN_BLOCKERS.contains(&e.kind.as_str())).fold(0.0,|a,e|f64::max(a,e.until));
    stage.grounded_until=stage.statuses.iter().filter(|e|e.until>context.now&&e.kind=="grounded")
        .fold(0.0,|a,e|f64::max(a,e.until));
    stage.cooldown_until=next;
    if spec.sprint>0.0 {stage.sprint_until=sprint;}
    *state=stage;
    Ok(ActiveReceipt { item_id:spec.id,removed,cooldown_until:next,
        sprint_until:sprint,speed_fraction:spec.speed_fraction })
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ShopContext,Role};
    fn unit(t:Team,id:&str)->ShopUnit {
        let prefix=if t==Team::Blue{"blue"}else{"red"};
        let mut u=ShopUnit::new(format!("{prefix}_MID"),t,Role::Mid,50000).unwrap();
        u.buy(t,&ShopContext::planning(0),id).unwrap();u
    }
    fn ctx<'a>(u:&'a ShopUnit,now:f64)->ActiveContext<'a>{
        ActiveContext {now,phase:Phase::Planning,ready:false,
            pending_unit:Some(u.id()),ended:false}
    }
    #[test]
    fn cleanse_suppression_not_knockup_for_both_seats() {
        for team in [Team::Blue,Team::Red] {
            for id in ["quicksilver_sash","mercurial_scimitar"] {
                let u=unit(team,id);let mut s=MercuryState::new(1000.0);
                for (i,kind) in ["suppression","stun","knockup"].iter().enumerate() {
                    s.statuses.push(TimedEffect {id:i as u64,kind:(*kind).into(),until:30.0});
                }
                assert_eq!(activate(team,&u,&mut s,ctx(&u,20.0),id).unwrap().removed,2);
                assert_eq!(s.statuses[0].kind,"knockup");
                assert_eq!(s.cooldown_until,110.0);
                let before=s.clone();
                assert_eq!(activate(team,&u,&mut s,ctx(&u,20.0),id),Err(ActiveError::Cooldown));
                assert_eq!(s,before);
                assert!(activate(team,&u,&mut s,ctx(&u,110.0),id).is_ok());
            }
        }
    }
    #[test]
    fn invalid_authority_and_decision_cannot_mutate() {
        let u=unit(Team::Blue,"quicksilver_sash");
        let mut s=MercuryState::new(100.0);let initial=s.clone();
        assert_eq!(activate(Team::Red,&u,&mut s,ctx(&u,20.0),"quicksilver_sash"),
            Err(ActiveError::NotEquipped));
        let mut c=ctx(&u,20.0);c.ready=true;
        assert_eq!(activate(Team::Blue,&u,&mut s,c,"quicksilver_sash"),Err(ActiveError::Phase));
        c.phase=Phase::Decision;c.pending_unit=Some("red_MID");
        assert_eq!(activate(Team::Blue,&u,&mut s,c,"quicksilver_sash"),Err(ActiveError::Decision));
        assert_eq!(s,initial);
        c.pending_unit=Some(u.id());
        assert!(activate(Team::Blue,&u,&mut s,c,"quicksilver_sash").is_ok());
    }
    #[test]
    fn stasis_and_invalid_time_never_consume() {
        let u=unit(Team::Red,"mercurial_scimitar");
        let mut s=MercuryState::new(100.0);s.stasis_until=21.0;
        let copy=s.clone();
        assert_eq!(activate(Team::Red,&u,&mut s,ctx(&u,20.0),"mercurial_scimitar"),
            Err(ActiveError::Stasis));
        assert_eq!(activate(Team::Red,&u,&mut s,ctx(&u,f64::NAN),"mercurial_scimitar"),
            Err(ActiveError::InvalidTime));
        assert_eq!(s,copy);
    }
}
