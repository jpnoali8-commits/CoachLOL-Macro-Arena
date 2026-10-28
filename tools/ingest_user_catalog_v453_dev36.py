#!/usr/bin/env python3
"""Safely import a user-provided CoachLOL collector ZIP; verify byte hashes against
its manifest, retain Riot original static data for reproducible patch comparisons.
Never changes the game's live item, unit, rune or champion mechanics.
"""
import argparse, hashlib, json, re, sys, zipfile
from pathlib import Path, PurePosixPath

BASE = Path(__file__).resolve().parents[1]

def ingest(package: Path, root: Path):
    with zipfile.ZipFile(package) as archive:
        members={PurePosixPath(info.filename):info for info in archive.infolist() if not info.is_dir()}
        if not members or len(members)>3000 or sum(x.file_size for x in members.values())>150*1024*1024:
            raise ValueError('ZIP_COMPLEXITY_OR_SIZE_REJECTED')
        for p in members:
            if p.is_absolute() or '..' in p.parts or len(p.parts)<2:
                raise ValueError('ZIP_UNSAFE_PATH')
        prefixes={p.parts[0] for p in members}
        if len(prefixes)!=1: raise ValueError('ZIP_MULTIPLE_ROOTS')
        prefix=next(iter(prefixes)); manifest_path=PurePosixPath(prefix)/'MANIFESTO_DOWNLOADS.json'
        m=json.loads(archive.read(str(manifest_path)))
        version=m['selected_patch']; expect='16.21.1'
        if version!=expect: raise ValueError('PATCH_NOT_SUPPORTED_NEEDS_SEPARATE_REVIEW:'+version)
        urls={}
        checked=0
        for f in m['downloads']:
            if f.get('status')!='ok':continue
            url=f.get('url','')
            if not url.startswith('https://'):raise ValueError('UNTRUSTED_MANIFEST_URL')
            # No user-local Windows path is stored in the released project.
            filename=PurePosixPath(str(f['file']).replace('\\','/')).name
            matching=[p for p in members if p.name==filename and str(p).startswith(prefix+'/')]
            # URL path determines the exact name, while group distinguishes duplicates.
            if '/data/en_US/champion/' in url: relative='riot/'+version+'/en_US/champion/'+filename
            elif '/data/pt_BR/champion/' in url: relative='riot/'+version+'/pt_BR/champion/'+filename
            elif '/data/en_US/' in url: relative='riot/'+version+'/en_US/'+filename
            elif '/data/pt_BR/' in url: relative='riot/'+version+'/pt_BR/'+filename
            elif '/api/versions.json' in url: relative='riot/versions.json'
            elif 'communitydragon' in url:
                relative='communitydragon/latest/'+filename
            elif 'wiki.leagueoflegends.com' in url:
                relative='wiki/'+filename
            else:raise ValueError('UNKNOWN_DOWNLOAD_SOURCE:'+url)
            key=PurePosixPath(prefix)/relative
            if key not in members: raise ValueError('MISSING_ARCHIVE_ENTRY:'+relative)
            data=archive.read(str(key))
            digest=hashlib.sha256(data).hexdigest()
            if digest!=f['sha256'] or len(data)!=int(f['bytes']):
                raise ValueError('MANIFEST_HASH_OR_LENGTH_MISMATCH:'+relative)
            urls[relative]={'sha256':digest,'bytes':len(data),'url':url}
            checked+=1
        if checked<300:raise ValueError('TOO_FEW_VERIFIED_FILES')
        important=['riot/'+version+'/en_US/item.json','riot/'+version+'/pt_BR/item.json',
                   'riot/'+version+'/en_US/champion.json','riot/'+version+'/pt_BR/champion.json',
                   'communitydragon/latest/items.json']
        for f in important:
            if f not in urls:raise ValueError('MISSING_REQUIRED_SOURCE:'+f)
        en=json.loads(archive.read(prefix+'/'+important[0]))
        pt=json.loads(archive.read(prefix+'/'+important[1]))
        champs=json.loads(archive.read(prefix+'/'+important[2]))
        client=json.loads(archive.read(prefix+'/'+important[4]))
        if en.get('version')!=version or pt.get('version')!=version or champs.get('version')!=version:raise ValueError('SOURCE_VERSION_MISMATCH')
        if len(en['data'])<500 or len(champs['data'])<150 or len(client)<500:raise ValueError('SOURCE_PARTIAL')
        for champ in champs['data']:
            for loc in ['en_US','pt_BR']:
                key=PurePosixPath(prefix)/f'riot/{version}/{loc}/champion/{champ}.json'
                if key not in members or 'data' not in json.loads(archive.read(str(key))):
                    raise ValueError('CHAMPION_DETAILS_MISSING:'+str(key))
        out=root/'data'/'riot_reference'/'source_16_21_1'
        # Verify ALL sources first; only then publish to a stable project directory.
        for relative in urls:
            # Distribute Riot and CommunityDragon JSON; do not bundle whole wiki HTML.
            if relative.startswith('wiki/'):continue
            target=out/relative;target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(archive.read(prefix+'/'+relative))
        report={'schema':'coachlol.source.audit.dev36','patch':'26.21','dataDragon':'16.21.1',
           'sourceKind':'USER_SUPPLIED_FILES_HASH_MATCHED_TO_USER_MANIFEST_NOT_RIOT_SIGNED',
           'filesVerifiedAgainstManifest':checked,'allDownloadManifestErrors':m['counts'].get('download_failed'),
           'items':len(en['data']),'champions':len(champs['data']),
           'championDetailLanguages':['en_US','pt_BR'], 'communityDragonLatestNotPinned':True,
           'wikiPagesReceivedButNotBundled':len([u for u in urls if u.startswith('wiki/')]),
           'sourceHashes':{k:v['sha256'] for k,v in urls.items()},
           'notes':'Reference only; item passives, unit modifiers, spells and special shopping restrictions require gameplay review.'}
        result=root/'data'/'riot_reference'/'source_audit_26_21_dev36.json'
        result.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        print(json.dumps({k:report[k] for k in ['filesVerifiedAgainstManifest','items','champions','sourceKind']},indent=2))
        return report

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('zip',type=Path);p.add_argument('--root',type=Path,default=BASE);a=p.parse_args()
    try:ingest(a.zip,a.root)
    except Exception as e:print('COACHLOL_INGEST_ERROR:',e,file=sys.stderr);sys.exit(1)
