"""Browser evidence for a multi-tick 5v5 pit fight and D/F draft slots.

Genuine Chromium screenshots of the running game UI with a controlled game-state
fixture. NOT a complete match played organically from level 1.
"""
from pathlib import Path
import asyncio, re, base64, json
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V452D4_DEV11'
OUT.mkdir(exist_ok=True,parents=True)
HOOK='''
window.__coachDev11Harness={
 prepare(key){
  const choices={blue:{JG:'Warwick'},red:{JG:'LeeSin'},summonerSlots:{blue:{JG:key==='d'?['smite','ghost']:['ghost','smite']},red:{JG:['flash','smite']}},smiteKeys:{blue:key,red:'f'}};
  match=new Arena(window.MAP_DATA,window.MASK_DATA,{seed:20261027,mode:'bot',draft:choices,roundSeconds:10});
  const a=match;
  for(const u of a.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.autoFollow=false;u.x=.04;u.y=.96;u.awaitingShop=false;}
  a.gameTime=500;a.phase='executing';a.executionRemaining=20;a.updateObjectives();
  const c=a.camps.find(c=>c.timerKey==='dragon');c.health=4500;
  for(const team of ['blue','red']){
   const roster=a.units.filter(u=>u.team===team).sort((x,y)=>(x.role==='JG'?-1:1)-(y.role==='JG'?-1:1)||x.id.localeCompare(y.id));
   roster.forEach((u,i)=>{
    u.x=c.x+.0001*i;u.y=c.y+.0001*i;
    u.order={kind:i<3?'objective':'attack',targetId:i<3?c.id:(team==='blue'?'red_':'blue_')+'TOP'};
    u.jungleAttackAt=0;u.attackAt=0;u.autoAttack=i>=3;
    if(u.role==='JG'){u.junglePet='mosstomper';u.smiteTier=team==='blue'?3:2;u.smiteCharges=2;u.smiteCd=0;u.smiteRecoveries=[];}
   });
  }
  let ordinaryTicks=0;const initialHP=4500;
  for(let i=0;i<20&&!a.pendingDecision&&c.alive;i++){
   a.gameTime++;a.resolveCombat();a.updateObjectives();
   if(!a.pendingDecision)ordinaryTicks++;
  }
  if(a.pendingDecision?.kind==='smite_contest')tacticalReview();
  return {phase:a.pendingDecision?.kind,ordinaryTicks,initialHP,hp:c.health,
   key:a.units.find(u=>u.id==='blue_JG').smiteKey,
   drawn:!$('smiteContestOverlay').hidden,charges:a.units.find(u=>u.id==='blue_JG').smiteCharges,
   members:a.objectivePitRosterV452d4Dev9(c).length,slots:a.units.find(u=>u.id==='blue_JG').summonerSlots};
 },
 finish(){if(executionTimer){clearInterval(executionTimer);executionTimer=null;}match.gameTime++;match.updateObjectives();return this.result();},
 result(){const c=match.camps.find(c=>c.timerKey==='dragon');return {alive:c.alive,blue:match.teams.blue.dragons.length,red:match.teams.red.dragons.length,ledger:match.objectiveLedgerV44.filter(x=>x.objective==='dragon').length};}
};
'''

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        for key in ('f','d'):
            page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            html=(ROOT/'index.html').read_text(encoding='utf-8')
            def css_repl(m):
                f=ROOT/m.group(1)
                return '<style>'+f.read_text(encoding='utf-8')+'</style>' if f.is_file() else ''
            html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',css_repl,html)
            icon=ROOT/'assets/icons/dragon.svg'
            html=html.replace('src="assets/icons/dragon.svg"','src="data:image/svg+xml;base64,'+base64.b64encode(icon.read_bytes()).decode()+'"')
            def js_repl(m):
                f=ROOT/m.group(1)
                raw=f.read_text(encoding='utf-8')
                if f.name=='app.js':
                    icon=(ROOT/'assets/icons/dragon.svg').read_bytes()
                    raw=raw.replace("'assets/icons/'+asset+'.svg'",repr('data:image/svg+xml;base64,'+base64.b64encode(icon).decode()))
                    for outcome in ('victory','defeat'):
                        logo=ROOT/f'assets/ui/endgame/{outcome}_overlay.png'
                        raw=raw.replace(f"'assets/ui/endgame/{outcome}_overlay.png'",repr('data:image/png;base64,'+base64.b64encode(logo.read_bytes()).decode()))
                    i=raw.rfind('})();');assert i>0
                    raw=raw[:i]+HOOK+raw[i:]
                return '<script>'+raw+'</script>'
            html=re.sub(r'<script src="([^"]+)"\s*></script>',js_repl,html)
            await page.set_content(html,wait_until='domcontentloaded',timeout=30000)
            await page.wait_for_function('window.__coachDev11Harness',timeout=15000)
            state=await page.evaluate(f'window.__coachDev11Harness.prepare("{key}")')
            assert state['phase']=='smite_contest' and state['ordinaryTicks']>=2,state
            assert state['drawn'] and state['members']==10 and state['charges']==2,state
            assert state['hp']<state['initialHP'] and state['key']==key and 'flash' not in state['slots'] and 'ghost' in state['slots'],state
            assert await page.locator('#smiteContestKey').is_disabled()
            assert await page.locator('#smiteContestKey').input_value()==key
            assert await page.locator('#smiteContestBluePower').inner_text()=='1.400'
            await page.locator('#smiteContestOverlay').screenshot(path=str(OUT/f'smite_5v5_{key}_chromium.png'))
            await page.keyboard.press(key.upper())
            await page.locator('#smiteContestOverlay').wait_for(state='hidden',timeout=10000)
            # Complete the paused objective tick using the same engine method
            # exercised in the Node replay test; do not rely on UI timer speed.
            await page.evaluate('window.__coachDev11Harness.finish()')
            await page.wait_for_function('window.__coachDev11Harness.result().ledger===1',timeout=5000)
            outcome=await page.evaluate('window.__coachDev11Harness.result()')
            assert outcome=={'alive':False,'blue':1,'red':0,'ledger':1},outcome
            assert not errors,errors[:5]
            print('PASS Chromium',key.upper(),json.dumps(state),json.dumps(outcome),'pageErrors=0')
            await page.close()
        await browser.close()

if __name__=='__main__': asyncio.run(main())
