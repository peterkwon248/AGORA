import json, sys, pathlib
p = pathlib.Path(sys.argv[1]) / "canvas.json"
c = json.loads(p.read_text(encoding="utf-8"))
b = c["boards"]
new = {}
for k, v in b.items():
    new[k] = v
    if k == "PhilImages.dc.html":
        new["PhilImageSheet.dc.html"] = {"x": 3290, "y": 1880, "w": 390, "h": 844, "title": "철학자 이미지 — 바꾸기 시트"}
        new["PhilImageCrop.dc.html"] = {"x": 3760, "y": 1880, "w": 390, "h": 844, "title": "철학자 이미지 — 동그랗게 맞추기"}
for k, v in new.items():
    if k.startswith("Desktop"):
        v["y"] = 4760
c["boards"] = new
o = c["order"]
i = o.index("PhilImages.dc.html")
for n in ["PhilImageCrop.dc.html", "PhilImageSheet.dc.html"]:
    if n not in o:
        o.insert(i + 1, n)
c["notes"]["row3"]["text"] = "폰 — 철학자 · 방 정보 · 설정 · 기억 · 철학자 이미지"
c["notes"]["row3"]["maxW"] = 4150
c["notes"]["row2"]["y"] = 4460
p.write_text(json.dumps(c, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(c["order"][-8:])
