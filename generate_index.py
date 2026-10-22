#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Docsify sidebar and image index. Does not run any Git commands."""
from pathlib import Path
from urllib.parse import quote
from html import escape

ROOT = Path(__file__).resolve().parent
IGNORE = {".git", ".github", ".vscode", "node_modules", "vendor", "__pycache__", ".venv", "venv", "dist", "build", "theme", "archive"}
EXCLUDE_MD = {"HOME.md", "_sidebar.md", "IMAGES.md"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"}

def skip(path):
    parts = path.relative_to(ROOT).parts
    return any(part.startswith(".") or part in IGNORE for part in parts)

def url(path):
    return "/".join(quote(part, safe="") for part in path.relative_to(ROOT).parts)

def title(path):
    try:
        for line in path.read_text(encoding="utf-8-sig").splitlines()[:100]:
            if line.startswith("# "):
                return line[2:].strip() or path.stem
    except (UnicodeDecodeError, OSError) as exc:
        print(f"警告：无法读取标题 {path}: {exc}")
    return path.stem

def label(text):
    return text.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")

def link(path, display=None):
    return f"[{label(display or title(path))}]({url(path)})"

def markdown_files(folder):
    return sorted(
        (f for f in folder.iterdir() if f.is_file() and f.suffix.lower() == ".md"
         and f.name not in EXCLUDE_MD and not skip(f)),
        key=lambda p: p.name.casefold(),
    )

def has_notes(folder):
    if any(f.suffix.lower() == ".md" and f.name not in EXCLUDE_MD for f in markdown_files(folder)):
        return True
    return any(has_notes(d) for d in subdirs(folder))

def subdirs(folder):
    return sorted(
        (d for d in folder.iterdir() if d.is_dir() and not skip(d)),
        key=lambda p: p.name.casefold(),
    )

sidebar = ["- [首页](/)", "- [图片索引](IMAGES.md)", ""]
for f in markdown_files(ROOT):
    if f.name.lower() != "readme.md":
        sidebar.append(f"- {link(f)}")

def add_folder(folder, depth=0):
    if not has_notes(folder):
        return
    indent = "  " * depth
    files = markdown_files(folder)
    readme = next((f for f in files if f.name.lower() == "readme.md"), None)
    if readme:
        sidebar.append(f"{indent}- {link(readme, folder.name)}")
    else:
        sidebar.append(f"{indent}- {label(folder.name)}")
    for f in files:
        if f != readme:
            sidebar.append(f"{indent}  - {link(f)}")
    for d in subdirs(folder):
        add_folder(d, depth + 1)

for d in subdirs(ROOT):
    add_folder(d)

(ROOT / "_sidebar.md").write_text("\n".join(sidebar).rstrip() + "\n", encoding="utf-8")

images = sorted(
    (f for f in ROOT.rglob("*") if f.is_file() and f.suffix.lower() in IMAGE_EXT and not skip(f)),
    key=lambda p: str(p).casefold(),
)
gallery = [
    "# 图片索引", "",
    "> 本页面由 generate_index.py 自动生成。图片直接放进仓库的相应文件夹即可收录。",
    "",
]
if not images:
    gallery.append("暂无图片。")
else:
    previous = None
    for f in images:
        folder = f.parent.relative_to(ROOT).as_posix()
        if folder != previous:
            gallery += ["", f"## {folder if folder != '.' else '根目录'}", ""]
            previous = folder
        target = url(f)
        gallery += [
            f'<a href="{escape(target, quote=True)}" target="_blank">'
            f'<img src="{escape(target, quote=True)}" alt="{escape(f.name, quote=True)}" '
            'loading="lazy" style="max-width:280px;max-height:220px;object-fit:contain"></a>',
            "",
            f"- {link(f, f.name)}",
            "",
        ]
(ROOT / "IMAGES.md").write_text("\n".join(gallery).rstrip() + "\n", encoding="utf-8")
print(f"已更新 _sidebar.md 和 IMAGES.md（{len(images)} 张图片）。")
print("只修改本地文件，没有执行 Git 提交或上传。")
