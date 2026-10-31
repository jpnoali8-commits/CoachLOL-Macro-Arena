//! B12F: 236 source-executed Arena steps -> native Rust differential test.
use coachlol_core_economy::{Role,Team,ShopContext,ShopUnit};
use coachlol_core_economy::annul::ItemRuntimeShop;
use coachlol_core_economy::transaction::{AtomicShop,LiveItemStats};
fn seat(t:&str)->Team{match t{"blue"=>Team::Blue,"red"=>Team::Red,_=>panic!("bad seat")}}
#[test]
fn source_236_annul_lifecycle_actions_match_rust(){
 let corpus=include_str!("fixtures/b12f_annul_source.tsv");
 let mut label=String::new();
 let mut active:Option<ItemRuntimeShop>=None;
 let mut now=10_i64;
 let mut steps=0;
 let mut scenarios=0;
 for line in corpus.lines().filter(|v|!v.is_empty()&&!v.starts_with('#')){
    let p=line.split('\t').collect::<Vec<_>>();
    assert_eq!(p.len(),15,"{line}");
    let key=format!("{}/{}/{}",p[0],p[1],p[2]);
    let team=seat(p[1]);
    if label!=key {
        label=key;scenarios+=1;now=10;
        let owner=ShopUnit::new(format!("{}_MID",p[1]),team,Role::Mid,50000).unwrap();
        let live=LiveItemStats::new(1000.0,1000.0,500.0,500.0).unwrap();
        active=Some(ItemRuntimeShop::new(AtomicShop::new(owner,live).unwrap()));
        assert_eq!(p[3],"0");
    }
    let x=active.as_mut().unwrap();
    let op=p[4];
    let ctx=ShopContext::planning(now);
    let accepted=if op=="B"||op.starts_with("B:"){
        x.buy(team,&ctx,op.strip_prefix("B:").unwrap_or(p[0])).is_ok()
    }else if op=="C"{
        x.block(now as f64).unwrap()
    }else if op=="R"{
        x.refresh(now as f64).unwrap();true
    }else if let Some(n)=op.strip_prefix("T:"){
        now+=n.parse::<i64>().unwrap();true
    }else if op.starts_with("D:"){
        x.damage(now as f64,33.0).unwrap();true
    }else if op=="S"{
        x.sell(team,&ctx,0).is_ok()
    }else if op=="U"{
        x.undo(team,&ctx).is_ok()
    }else if op=="K"{
        x.die(now as f64).unwrap();true
    }else if op=="E"{
        x.add_external(now as f64).unwrap();true
    }else{panic!("unknown operation {op}")};
    assert_eq!(u8::from(accepted),p[5].parse::<u8>().unwrap(),"accept {line}");
    assert_eq!(now,p[6].parse::<i64>().unwrap(),"time {line}");
    assert_eq!(x.shop().economy().gold(),p[7].parse::<i64>().unwrap(),"gold {line}");
    let inv=x.shop().economy().items();
    let item_ids=if inv.is_empty(){"-".to_string()}else{inv.join(",")};
    assert_eq!(item_ids,p[8],"items {line}");
    let state=x.annul();
    assert_eq!(state.ready_at,p[9].parse::<f64>().unwrap(),"ready {line}");
    assert_eq!(state.own_layers().count(),p[10].parse::<usize>().unwrap(),"layers {line}");
    assert_eq!(u8::from(state.own_active(now as f64)),p[11].parse::<u8>().unwrap(),"active {line}");
    assert_eq!(state.own_layers().last().map(|e|e.until).unwrap_or(0.0),
        p[12].parse::<f64>().unwrap(),"last shield {line}");
    assert_eq!(u8::from(state.alive),p[13].parse::<u8>().unwrap(),"alive {line}");
    assert_eq!(state.active_spell_shields(now as f64),
        p[14].parse::<usize>().unwrap(),"other shields {line}");
    steps+=1;
 }
 assert_eq!(scenarios,56);
 assert_eq!(steps,236);
}
