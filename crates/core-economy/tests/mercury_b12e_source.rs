//! M45 B12E goldens: actual frozen Arena JavaScript -> native Rust comparisons.
use coachlol_core_economy::{ShopUnit,ShopContext,Team,Role,Phase};
use coachlol_core_economy::active_items::{activate,ActiveContext,MercuryState,TimedEffect};
fn get_team(t:&str)->Team{match t{"blue"=>Team::Blue,"red"=>Team::Red,_=>panic!("unknown team")}}
fn get_phase(p:&str)->Phase{match p{"preparation"=>Phase::Preparation,"planning"=>Phase::Planning,
"decision"=>Phase::Decision,"executing"=>Phase::Executing,"ended"=>Phase::Ended,_=>panic!("phase")}}
#[test]
fn frozen_source_112_mercury_actions_match_native() {
 let lines=include_str!("fixtures/b12e_mercury_source.tsv");
 let mut tested=0;
 for line in lines.lines().filter(|s|!s.is_empty()&&!s.starts_with('#')){
    let p=line.split('\t').collect::<Vec<_>>();
    assert_eq!(p.len(),22,"{line}");
    let owner=get_team(p[1]);
    let mut unit=ShopUnit::new(format!("{}_MID",p[1]),owner,Role::Mid,50000).unwrap();
    unit.buy(owner,&ShopContext::planning(0),p[2]).unwrap();
    let mut state=MercuryState::new(p[8].parse().unwrap());
    state.stasis_until=p[9].parse().unwrap();
    state.cooldown_until=p[11].parse().unwrap();
    state.sprint_until=p[12].parse().unwrap();
    if p[13]!="-"{
        state.statuses=p[13].split(',').enumerate().map(|(i,entry)|{
            let (kind,until)=entry.split_once('@').unwrap();
            TimedEffect{id:i as u64+100,kind:kind.to_string(),until:until.parse().unwrap()}
        }).collect();
    }
    let pending=match p[7]{
      "none"=>None,"self"=>Some(unit.id()),
      "enemy"=>Some(if owner==Team::Blue{"red_MID"}else{"blue_MID"}),_=>panic!("pending"),
    };
    let context=ActiveContext{now:p[10].parse().unwrap(),phase:get_phase(p[5]),
      ready:p[6]=="1",pending_unit:pending,ended:p[0]=="ended_flag"};
    let got=activate(get_team(p[4]),&unit,&mut state,context,p[3]);
    let reason=match &got{Ok(_)=>"ok",Err(e)=>e.reason()};
    assert_eq!(reason,p[14],"{line}");
    let removed=got.as_ref().map(|r|r.removed.to_string()).unwrap_or_else(|_|"-".into());
    assert_eq!(removed,p[15],"{line}");
    assert_eq!(state.cooldown_until,p[16].parse::<f64>().unwrap(),"{line}");
    assert_eq!(state.sprint_until,p[17].parse::<f64>().unwrap(),"{line}");
    let remaining=if state.statuses.is_empty(){"-".to_string()}else{
       state.statuses.iter().map(|s|s.kind.as_str()).collect::<Vec<_>>().join(",")
    };
    assert_eq!(remaining,p[18],"{line}");
    assert_eq!(state.root_until,p[19].parse::<f64>().unwrap(),"{line}");
    assert_eq!(state.stun_until,p[20].parse::<f64>().unwrap(),"{line}");
    assert_eq!(state.grounded_until,p[21].parse::<f64>().unwrap(),"{line}");
    tested+=1;
 }
 assert_eq!(tested,112);
}
