"""Controlled browser smoke of Dragon Smite overlay; no full organic match."""
from pathlib import Path
import asyncio,re,base64
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V452D4_DEV9'
OUT.mkdir(exist_ok=True,parents=True)
HOOK='''
window.__coachDev9Harness={
 prepare(){
  const game=match;
  for(const u of game.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.autoFollow=false;u.x=.04;u.y=.96;}
  game.gameTime=500;game.phase='executing';game.executionRemaining=5;game.updateObjectives();
  const c=game.camps.find(c=>c.timerKey==='dragon');c.health=850;
  for(const [team,tier] of [['blue',3],['red',2]]){
   const u=game.units.find(u=>u.id===team+'_JG');u.junglePet='mosstomper';u.smiteTier=tier;u.smiteDamage=[0,600,1000,1400][tier];u.smiteCharges=2;u.smiteCd=0;u.smiteRecoveries=[];
   u.x=c.x;u.y=c.y;u.order={kind:'objective',targetId:c.id};u.jungleAttackAt=999;
  }
  game.updateObjectives();tacticalReview();
  return {paused:game.pendingDecision?.kind,hp:c.health,shown:!$('smiteContestOverlay').hidden};
 },
 result(){const game=match,c=game.camps.find(c=>c.timerKey==='dragon');return {alive:c.alive,blueDragons:game.teams.blue.dragons.length,redDragons:game.teams.red.dragons.length,ledger:game.objectiveLedgerV44.filter(x=>x.objective==='dragon').length};}
};
'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for key in ('f','d'):
   page=await browser.new_page(viewport={'width':1440,'height':900})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   html=(ROOT/'index.html').read_text(encoding='utf-8')
   def css_repl(m):
    f=ROOT/m.group(1);return '<style>'+f.read_text(encoding='utf-8')+'</style>' if f.is_file() else ''
   html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',css_repl,html)
   def js_repl(m):
    f=ROOT/m.group(1);raw=f.read_text(encoding='utf-8')
    if f.name=='app.js':
     for outcome in ('victory','defeat'):
      logo=ROOT/f'assets/ui/endgame/{outcome}_overlay.png'
      raw=raw.replace(f"'assets/ui/endgame/{outcome}_overlay.png'",repr('data:image/png;base64,'+base64.b64encode(logo.read_bytes()).decode()))
     i=raw.rfind('})();');assert i>0;raw=raw[:i]+HOOK+raw[i:]
    return '<script>'+raw+'</script>'
   html=re.sub(r'<script src="([^"]+)"\s*></script>',js_repl,html)
   icon=ROOT/'assets/icons/dragon.svg'
   html=html.replace('src="assets/icons/dragon.svg"','src="data:image/svg+xml;base64,'+base64.b64encode(icon.read_bytes()).decode()+'"')
   await page.set_content(html,wait_until='domcontentloaded',timeout=30000)
   await page.wait_for_function('window.__coachDev9Harness',timeout=15000)
   out=await page.evaluate('window.__coachDev9Harness.prepare()')
   assert out=={'paused':'smite_contest','hp':850,'shown':True},out
   await page.locator('#smiteContestOverlay').wait_for(state='visible')
   if key=='d': await page.locator('#smiteContestKey').select_option('d')
   assert await page.locator('#smiteContestBluePower').inner_text()=='1.400'
   assert await page.locator('#smiteContestRedPower').inner_text()=='1.000'
   await page.screenshot(path=str(OUT/f'smite_contest_{key}.png'))
   await page.keyboard.press(key.upper())
   await page.locator('#smiteContestOverlay').wait_for(state='hidden',timeout=10000)
   await page.wait_for_function('window.__coachDev9Harness.result().ledger===1',timeout=15000)
   result=await page.evaluate('window.__coachDev9Harness.result()')
   assert result=={'alive':False,'blueDragons':1,'redDragons':0,'ledger':1},result
   assert not errors,errors[:4]
   print(f'PASS Chromium {key.upper()}: overlay -> keyboard -> Dragon awarded once; JS errors=0')
   await page.close()
  await browser.close()
if __name__=='__main__':asyncio.run(main())
