"""Original, deliberately simple SVG geometry for CoachLOL V4.5.2d-4-dev16.
The newly authored SVGs in this directory are offered under CC0 1.0.
No third-party graphics, fonts, trademarks or Riot icons are included.
"""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/ui/map_cc0_v452d4_dev16'
OUT.mkdir(parents=True,exist_ok=True)
def svg(body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img">'
    '<g stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>\n')
icons={
'ward_eye_gold': svg('''<path d="M2.2 16Q8.5 6.6 16 6.7Q23.5 6.6 29.8 16Q23.5 25.4 16 25.3Q8.5 25.4 2.2 16Z" fill="#46300f" stroke="#ffdb75" stroke-width="2.2"/><path d="M5.8 16Q16 9.2 26.2 16Q16 22.8 5.8 16Z" fill="#f3bb4e"/><circle cx="16" cy="16" r="5.5" fill="#201608" stroke="#fff0ad" stroke-width="1.6"/><circle cx="16" cy="16" r="2.1" fill="#fff6bd"/><circle cx="18.4" cy="13.4" r="1.15" fill="#ffffff"/>'''),
'ward_eye_pink': svg('''<path d="M2.4 16Q8 7 16 6.2Q24 7 29.6 16Q24 25 16 25.8Q8 25 2.4 16Z" fill="#361224" stroke="#ff76b5" stroke-width="2.2"/><path d="M7 13L4 8M25 13L28 8" fill="none" stroke="#fca0cf" stroke-width="1.7"/><path d="M6.5 16Q16 10.5 25.5 16Q16 21.5 6.5 16Z" fill="#e96ca7"/><circle cx="16" cy="16" r="5.25" fill="#3a1739" stroke="#ffb9de" stroke-width="1.5"/><path d="M16 12.8L19.1 16L16 19.2L12.9 16Z" fill="#ffc6e5"/><circle cx="17.8" cy="14.1" r=".9" fill="#fff"/>'''),
'ward_support_mint': svg('''<path d="M16 3.3L22 9L27.6 16L21.4 23L16 28.7L10.6 23L4.4 16L10 9Z" fill="#123c36" stroke="#7ae1c8" stroke-width="2"/><path d="M16 8.4L19.4 15L16 23.6L12.6 15Z" fill="#c5ffe9"/><path d="M8.2 16H23.8" stroke="#4adfbd" stroke-width="1.6"/>'''),
'hexgate_portal': svg('''<path d="M16 2.7L28 9.4V22.6L16 29.3L4 22.6V9.4Z" fill="#112b42" stroke="#79d9f9" stroke-width="2"/><path d="M16 7.5C21 7.5 24.2 10.8 24.2 16C24.2 21.2 20.8 24.5 16 24.5C11.1 24.5 7.8 21.2 7.8 16C7.8 10.8 11.1 7.5 16 7.5Z" fill="#166a96" stroke="#b8f6ff" stroke-width="1.7"/><path d="M12 10.6Q19 10.7 20.8 15.6Q21 20 16 21.3Q12.5 22 11.5 18.2Q11.3 14 16.5 14" fill="none" stroke="#b4f7ff" stroke-width="2.1"/><path d="M16.5 14L13.9 12.7L14.2 16" fill="#a9f9ff"/>'''),
'scryer_glow_plant': svg('''<path d="M16.2 28V15" stroke="#65cfae" stroke-width="3.1"/><path d="M16 21Q7 17.5 5 23Q8 29.5 16 25.6Z" fill="#2aa99c" stroke="#b4fff1" stroke-width="1.2"/><path d="M16 19Q26.5 14.7 28 21Q24.5 26.2 16 23Z" fill="#4cbab2" stroke="#b4fff1" stroke-width="1.2"/><path d="M16 5L19.3 11.3L16 18L12.7 11.3Z" fill="#bdfcff" stroke="#75d7fa" stroke-width="1.7"/><path d="M6 8.5L7.3 5L8.6 8.5L12 9.7L8.6 10.8L7.3 14L6 10.8L2.6 9.7Z" fill="#aff7ff"/><circle cx="25" cy="5.5" r="2" fill="#c4fcff"/><circle cx="28.5" cy="12.4" r="1.15" fill="#8be5fa"/>'''),
'blast_seed': svg('''<circle cx="16" cy="16" r="12.8" fill="#261709" stroke="#f5ad62" stroke-width="2"/><circle cx="16" cy="16" r="7.2" fill="#e98945" stroke="#ffdb9a" stroke-width="1.5"/><path d="M16 8.7L20.7 16L16 23.3L11.3 16Z" fill="#fff0b5"/><circle cx="16" cy="16" r="2.1" fill="#8d351d"/>'''),
'heal_fruit_plant': svg('''<path d="M16 28.2V15" fill="none" stroke="#65bb62" stroke-width="3"/><path d="M16 22Q6.5 15.3 4.2 21.3Q6.3 27.7 16 25.7Z" fill="#5cb477" stroke="#aeef94" stroke-width="1.1"/><path d="M16 19Q25 12.8 28.2 18.5Q26.4 25.6 16 23.8Z" fill="#77ca74" stroke="#c9f8a8" stroke-width="1.1"/><path d="M16 7Q23 8 21.3 14.3Q19.9 20 16 20Q10.7 18.8 10.7 13.5Q10.3 8.7 16 7Z" fill="#a9ee69" stroke="#edffba" stroke-width="1.8"/><path d="M16 10V17M12.5 13.5H19.5" stroke="#2c814c" stroke-width="2.2"/><circle cx="25.7" cy="7.4" r="1.5" fill="#cfffba"/>''')
}

def minion_body(kind, primary, light, edge, metal):
    if kind=='melee':
        return f'''<path d="M8 22L7 12L13 6L20 7L24 14L23 24L16 28Z" fill="{edge}" stroke="{metal}" stroke-width="1.5"/><path d="M11 10L16 5L21 10L20 16H12Z" fill="{primary}"/><path d="M12 11H20L18 16H14Z" fill="{light}"/><path d="M4.4 19L8 16L12 18L12 25L8 29L4 25Z" fill="{primary}" stroke="{light}" stroke-width="1.5"/><path d="M26 5L28 7L24 20L22.1 22L22.3 16Z" fill="{metal}" stroke="{edge}" stroke-width="1"/>'''
    if kind=='caster':
        return f'''<path d="M16 4L24 12L27 28H5L8 12Z" fill="{edge}" stroke="{metal}" stroke-width="1.7"/><path d="M16 7L21 15L22.5 27H9.5L11 15Z" fill="{primary}"/><path d="M12 15L16 9L20 15L17 20H15Z" fill="{light}"/><path d="M26.5 5.5L28 22" stroke="{metal}" stroke-width="2.2"/><path d="M26 3L29 5.5L26.5 9L24.2 6Z" fill="{light}" stroke="{metal}" stroke-width="1.3"/>'''
    if kind=='siege':
        return f'''<path d="M6.5 15.5L9 10L22 10L26 16L24.5 23H8Z" fill="{edge}" stroke="{metal}" stroke-width="1.5"/><path d="M10 11L21 11L23 17H10Z" fill="{primary}"/><rect x="18.5" y="4" width="7" height="12" rx="2" fill="{metal}" stroke="{light}" stroke-width="1.5"/><path d="M19.3 8H25" stroke="{edge}" stroke-width="1.7"/><circle cx="9" cy="23.6" r="5" fill="{primary}" stroke="{light}" stroke-width="2"/><circle cx="23" cy="23.6" r="5" fill="{primary}" stroke="{light}" stroke-width="2"/><circle cx="9" cy="23.6" r="1.8" fill="{metal}"/><circle cx="23" cy="23.6" r="1.8" fill="{metal}"/>'''
    if kind=='super':
        return f'''<path d="M16 3L22 7L26 16L22 27H10L6 16L10 7Z" fill="{edge}" stroke="{metal}" stroke-width="2"/><path d="M16 6L20 9L23 17L19.5 23H12.5L9 17L12 9Z" fill="{primary}"/><path d="M16 9L20 14L16 23L12 14Z" fill="{light}"/><path d="M6 5L10 10L6 22L3 16Z" fill="{metal}"/><path d="M26 5L22 10L26 22L29 16Z" fill="{metal}"/>'''
    raise ValueError(kind)

for team,(primary,light,edge,metal) in {'blue':('#3485e2','#a4e9ff','#0a305f','#e3b96c'),'red':('#d64a73','#ffd6e6','#53112c','#f5b070')}.items():
    for kind in ['melee','caster','siege','super']:
        icons[f'minion_{kind}_{team}']=svg(minion_body(kind,primary,light,edge,metal))

for name,art in icons.items():
    path=OUT/f'{name}.svg';path.write_text(art,encoding='utf8')
(OUT/'LICENSE-CC0-1.0.txt').write_text('''CoachLOL — mapa e minions: conjunto de SVGs ORIGINAIS V4.5.2d-4-dev16\n\nOferta de dedicação de domínio público: Creative Commons CC0 1.0 Universal.\nhttps://creativecommons.org/publicdomain/zero/1.0/\n\nOs elementos SVG nesta pasta foram desenhados neste incremento com geometria\nvetorial original. Não são extrações de League of Legends, nem incluem símbolos\ntextuais ou assets de Riot Games. A dedicação CC0 aplica-se SOMENTE aos SVGs\nlistados em manifest.json, não ao restante do projeto CoachLOL ou seus assets.\nNos limites permitidos em cada jurisdição, qualquer direito autoral que possa\nexistir sobre esta arte original é renunciado e o material é oferecido sob CC0.\n''',encoding='utf8')
(OUT/'manifest.json').write_text(json.dumps({'license':'CC0-1.0','scope':'original-authored SVGs only','source':'original vector geometry, no third-party icons','reference':'https://creativecommons.org/publicdomain/zero/1.0/','files':[f'{i}.svg' for i in sorted(icons)]},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Created',len(icons),'SVG assets')
