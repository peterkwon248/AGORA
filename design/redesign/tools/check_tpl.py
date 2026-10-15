"""Checks every {{ hole }} in the prototype template against view-model snapshots from harness.js."""
import json, re, sys
from html.parser import HTMLParser

tpl_path, snaps_path = sys.argv[1], sys.argv[2]
VOID = {"meta", "link", "img", "br", "input", "hr", "source", "area", "base", "col", "embed", "wbr",
        "path", "circle", "rect", "stop", "line", "polyline", "polygon", "ellipse", "use"}

class Node:
    def __init__(self, tag, attrs):
        self.tag, self.attrs, self.children = tag, attrs, []

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [])
        self.stack = [self.root]
        self.errors = []
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs))
    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack[-1].tag != tag:
            self.errors.append(f"mismatched </{tag}> inside <{self.stack[-1].tag}>")
            for i in range(len(self.stack) - 1, 0, -1):
                if self.stack[i].tag == tag:
                    del self.stack[i:]
                    break
            return
        self.stack.pop()
    def handle_data(self, data):
        self.stack[-1].children.append(data)

p = P()
p.feed(open(tpl_path, encoding="utf-8").read())
if p.errors or len(p.stack) != 1:
    print("TAG ERRORS:", p.errors[:10], "open:", [n.tag for n in p.stack[1:]][:10])

HOLE = re.compile(r"\{\{\s*(.+?)\s*\}\}")
MISSING = object()

def lookup(path, scope, vm):
    if path in ("true", "false", "null"):
        return {"true": True, "false": False, "null": None}[path]
    parts = path.split(".")
    if parts[0] in scope:
        cur = scope[parts[0]]
    elif parts[0] in vm:
        cur = vm[parts[0]]
    else:
        return MISSING
    for seg in parts[1:]:
        if isinstance(cur, dict) and seg in cur:
            cur = cur[seg]
        else:
            return MISSING
    return cur

def truthy(v):
    if v is MISSING or v is None or v is False or v == "__undef__":
        return False
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return v != 0
    if isinstance(v, str):
        return v != ""
    return True

UNDEF_OK = {"aria-current"}
problems = {}

def note(kind, path, snap):
    problems.setdefault((kind, path), snap)

def walk(node, scope, vm, snap):
    for ch in node.children:
        if isinstance(ch, str):
            for m in HOLE.finditer(ch):
                v = lookup(m.group(1), scope, vm)
                if v is MISSING or v == "__undef__":
                    note("text hole missing", m.group(1), snap)
                elif isinstance(v, (dict, list)):
                    note("object in text", m.group(1), snap)
            continue
        attrs = dict(ch.attrs)
        if ch.tag == "sc-if":
            v = lookup(HOLE.search(attrs.get("value", "")).group(1), scope, vm)
            if truthy(v):
                walk(ch, scope, vm, snap)
            continue
        if ch.tag == "sc-for":
            path = HOLE.search(attrs.get("list", "")).group(1)
            lst = lookup(path, scope, vm)
            if not isinstance(lst, list):
                note("sc-for not a list", path, snap)
                continue
            for i, item in enumerate(lst[:4]):
                s2 = dict(scope)
                s2[attrs["as"]] = item
                s2["$index"] = i
                walk(ch, s2, vm, snap)
            continue
        for name, val in ch.attrs:
            if val is None or name.startswith("hint-"):
                continue
            for m in HOLE.finditer(val):
                v = lookup(m.group(1), scope, vm)
                if v is MISSING:
                    note(f"attr {name} missing", m.group(1), snap)
                elif v == "__undef__" and name not in UNDEF_OK:
                    note(f"attr {name} undefined", m.group(1), snap)
                elif name.startswith("on") and v != "__fn__":
                    note(f"handler {name} not a function", m.group(1), snap)
                elif name == "ref" and v != "__fn__":
                    note("ref not a function", m.group(1), snap)
                elif name == "style" and not isinstance(v, (str, int, float)):
                    note("style hole not a string", m.group(1), snap)
        walk(ch, scope, vm, snap)

snaps = json.load(open(snaps_path, encoding="utf-8"))
for s in snaps:
    walk(p.root, {}, s["vm"], s["name"])
if problems:
    for (kind, path), snap in sorted(problems.items()):
        print(f"{kind}: {path}   (first seen: {snap})")
    sys.exit(1)
print(f"template holes ok across {len(snaps)} states")
