import json, re, sys, pathlib
from html.parser import HTMLParser
proj = pathlib.Path(sys.argv[1])
c = json.loads((proj / "canvas.json").read_text(encoding="utf-8"))
boards = c["boards"]
files = {p.name for p in proj.glob("*.dc.html")}
problems = []
if set(boards) != files: problems.append(f"canvas/files mismatch: {set(boards) ^ files}")
if set(c["order"]) != set(boards) or len(c["order"]) != len(boards): problems.append("order mismatch")
BLOBS = {"5d0e39a976cd27ba0c182884b28405df","7cd6b76182321c6d5c5922ddec00c1ca","5f26f9191b593e11d32dd705b72fd5d0","ad60c4638819dddb9854296103adaa9e","a90fc63f902a3c0fa8c95bdb16c6537e","acb8b83c2cbf2faec6a1a5d08ce1e73f","949cb804d3b517860a09c62b1945e9b0"}
VOID = {"meta","link","img","br","input","hr","source","area","base","col","embed","wbr","path","circle","rect","stop","line","polyline","polygon","ellipse","use"}
class P(HTMLParser):
    def __init__(s): super().__init__(); s.stack=[]; s.err=[]; s.ids=[]
    def handle_starttag(s,t,a):
        d=dict(a)
        if "id" in d: s.ids.append(d["id"])
        if t not in VOID: s.stack.append(t)
    def handle_startendtag(s,t,a):
        d=dict(a)
        if "id" in d: s.ids.append(d["id"])
    def handle_endtag(s,t):
        if t in VOID: return
        if not s.stack or s.stack[-1]!=t: s.err.append(f"unexpected </{t}> (open: {s.stack[-3:]})")
        else: s.stack.pop()
for name in sorted(files):
    src = (proj / name).read_text(encoding="utf-8")
    b = boards.get(name, {})
    if '<script src="./support.js"></script>' not in src: problems.append(f"{name}: support.js")
    m = re.search(r'"\$preview":\{"width":(\d+),"height":(\d+)\}', src)
    if not m: problems.append(f"{name}: no $preview")
    elif (int(m.group(1)), int(m.group(2))) != (b.get("w"), b.get("h")): problems.append(f"{name}: preview {m.groups()} vs canvas {b.get('w')}x{b.get('h')}")
    if not b.get("expand"):
        r = re.search(r'<x-dc>.*?</helmet>\s*<div (?:class="[^"]*" )?style="([^"]*)"', src, re.S)
        hm = re.search(r'height: (\d+)px', r.group(1)) if r else None
        if not hm or int(hm.group(1)) != b.get("h"): problems.append(f"{name}: root height {hm and hm.group(1)} vs {b.get('h')}")
    for href in re.findall(r'href="([^"]+)"', src):
        if href.startswith("https://fonts.googleapis.com"): continue
        if href not in boards: problems.append(f"{name}: broken link {href}")
    for blob in re.findall(r'/_blob/([0-9a-f]+)', src):
        if blob not in BLOBS: problems.append(f"{name}: unknown blob {blob}")
    for w in ["광장", "일기"]:
        if w in src: problems.append(f"{name}: forbidden word {w}")
    body = src[src.index("<x-dc>"):src.index("</x-dc>")+7]
    p = P(); p.feed(body)
    if p.stack or p.err: problems.append(f"{name}: tags {p.err[:3]} open={p.stack}")
    dup = {i for i in p.ids if p.ids.count(i) > 1}
    if dup: problems.append(f"{name}: duplicate ids {dup}")
# overlap
items = list(boards.items())
for i in range(len(items)):
    for j in range(i+1, len(items)):
        (a, A), (bn, B) = items[i], items[j]
        if A["x"] < B["x"]+B["w"] and B["x"] < A["x"]+A["w"] and A["y"] < B["y"]+B["h"] and B["y"] < A["y"]+A["h"]:
            problems.append(f"overlap {a} / {bn}")
# notes vs boards: a note's band (y .. y+120) must not intersect a board within its x span
for k, n in c["notes"].items():
    for bn, B in boards.items():
        if n["x"] < B["x"]+B["w"] and B["x"] < n["x"]+n.get("maxW", 800) and n["y"] < B["y"]+B["h"] and B["y"] < n["y"]+140:
            problems.append(f"note {k} touches {bn}")
        # gap below previous row bottom
print("\n".join(problems) if problems else "all checks passed")
print("boards:", len(boards), "files:", len(files))
