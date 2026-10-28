from pathlib import Path
import json
from urllib.parse import quote
from html import escape

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / 'theme/config'
OUT = ROOT / 'theme/generated'


def generate():
    config = json.loads((CONFIG / 'navigation.json').read_text(encoding='utf-8-sig'))
    site = json.loads((CONFIG / 'site.json').read_text(encoding='utf-8-sig'))
    excluded = set(config.get('exclude', [])) | {'theme', 'node_modules', 'venv', '__pycache__'}
    folders = config.get('folders', {})
    def skip(p):
        rel = p.relative_to(ROOT)
        return any(s.startswith('.') or s in excluded for s in rel.parts) or any(
            p == ROOT / key or ROOT / key in p.parents
            for key, value in folders.items() if value.get('hidden'))
    def url(p):
        return '/'.join(quote(s, safe='') for s in p.relative_to(ROOT).parts)
    def label(s):
        return s.replace('\\', '\\\\').replace('[', '\\[').replace(']', '\\]')
    def title(p):
        for line in p.read_text(encoding='utf-8-sig').splitlines()[:100]:
            if line.startswith('# '): return line[2:].strip() or p.stem
        return p.stem
    def link(p, name=None):
        return f'[{label(name or title(p))}](/{url(p)})'
    def children(p):
        return sorted((x for x in p.iterdir() if x.is_dir() and not skip(x)), key=lambda x:(folders.get(x.relative_to(ROOT).as_posix(), {}).get('order', 999), x.name.casefold()))
    def notes(p):
        return sorted((x for x in p.iterdir() if x.is_file() and x.suffix.lower()=='.md' and x.name not in {site.get('homepage','HOME.md'),'_sidebar.md','IMAGES.md'} and not skip(x)),key=lambda x:x.name.casefold())
    def has_notes(p):
        return bool(notes(p)) or any(has_notes(x) for x in children(p))
    sidebar = [f"- [{label(item['label'])}]({item['path'] if item['path'].startswith(('http:', 'https:', '/')) else '/' + item['path']})" for item in config.get('links', [])]
    sidebar.append('')
    sidebar.extend('- '+link(p) for p in notes(ROOT))
    def add(p, depth=0):
        if not has_notes(p): return
        files=notes(p)
        readme=next((x for x in files if x.name.lower()=='readme.md'),None)
        name=folders.get(p.relative_to(ROOT).as_posix(),{}).get('label',p.name)
        sidebar.append('  '*depth+'- '+(link(readme,name) if readme else label(name)))
        sidebar.extend('  '*(depth+1)+'- '+link(x) for x in files if x!=readme)
        for child in children(p): add(child,depth+1)
    for p in children(ROOT): add(p)
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'sidebar.md').write_text('\n'.join(sidebar)+'\n',encoding='utf-8')
    images=sorted((p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.gif','.webp','.svg','.bmp','.avif','.tif','.tiff'} and not skip(p)))
    gallery=['# 图片索引','','> 根据仓库图片自动生成。','']
    if not images: gallery.append('暂无图片。')
    previous=None
    for p in images:
        folder=p.parent.relative_to(ROOT).as_posix()
        if folder!=previous:
            gallery.extend(['','## '+('根目录' if folder=='.' else folder),'']); previous=folder
        target='../../'+url(p)
        gallery.extend([f'![{label(p.name)}]({target})','',f'[{label(p.name)}]({target})',''])
    (OUT/'images.md').write_text('\n'.join(gallery)+'\n',encoding='utf-8')
    print(f'Updated navigation and image index ({len(images)} images).')

if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(description='Generate navigation; optionally preview with automatic refresh of indexes.')
    parser.add_argument('--serve',action='store_true')
    parser.add_argument('--port',type=int,default=4173)
    args=parser.parse_args()
    generate()
    if args.serve:
        from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
        from functools import partial
        import threading
        def watch():
            previous=None
            while True:
                snapshot=tuple(sorted((str(p),p.stat().st_mtime_ns) for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts and 'generated' not in p.parts and p.suffix.lower() in {'.md','.json','.png','.jpg','.jpeg','.webp','.svg','.gif','.avif','.bmp','.tif','.tiff'}))
                if previous is not None and snapshot!=previous:
                    try: generate()
                    except Exception as error: print('Generation failed:',error)
                previous=snapshot
                threading.Event().wait(1)
        threading.Thread(target=watch,daemon=True).start()
        print(f'Preview: http://localhost:{args.port} (Ctrl+C to stop)')
        ThreadingHTTPServer(('127.0.0.1',args.port),partial(SimpleHTTPRequestHandler,directory=str(ROOT))).serve_forever()
