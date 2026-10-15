"""Relabels the chat-home options on the canvas to A~E (display letters)."""
import json, re, sys
from pathlib import Path

proj = Path(sys.argv[1])
cj = proj / "canvas.json"
c = json.loads(cj.read_text(encoding="utf-8"))
B = c["boards"]

titles = {
    "Main.dc.html": "채팅 — 홈 A · 말 걸기 먼저",
    "HomeG.dc.html": "채팅 홈 B — 한 줄 말 걸기 + 목록",
    "HomeD.dc.html": "채팅 홈 C — 목록이 먼저",
    "HomeE.dc.html": "채팅 홈 D — 한 마디 띠 + 목록",
    "HomeF.dc.html": "채팅 홈 E — 묶음 목록",
    "HomeA.dc.html": "지난 안 — 지금이 먼저 (A로 합침)",
    "HomeC.dc.html": "지난 안 — 응접실 (A로 합침)",
}
for f, t in titles.items():
    B[f]["title"] = t
    if f != "Main.dc.html":
        p = proj / f
        html = p.read_text(encoding="utf-8")
        html2 = re.sub(r"<title>[^<]*</title>", f"<title>{t}</title>", html, count=1)
        assert html2 != html or f"<title>{t}</title>" in html, f
        p.write_text(html2, encoding="utf-8")

# B~E in reading order on the 'new options' row
for f, x in [("HomeG.dc.html", 1640), ("HomeD.dc.html", 2110), ("HomeE.dc.html", 2580), ("HomeF.dc.html", 3050)]:
    B[f]["x"] = x
order = [o for o in c["order"] if o not in ("HomeD.dc.html", "HomeE.dc.html", "HomeF.dc.html", "HomeG.dc.html")]
i = order.index("HomeC.dc.html") + 1
order[i:i] = ["HomeG.dc.html", "HomeD.dc.html", "HomeE.dc.html", "HomeF.dc.html"]
c["order"] = order

N = c["notes"]
N["home"]["text"] = "채팅 홈 — 지난 안 (지금 채팅 홈은 A)"
N["home2"]["text"] = "채팅 홈 B~E — 설정에서 고를 수 있는 나머지 모양"
N["proto"]["text"] = N["proto"]["text"].replace("B·G·D·E·F를", "A~E를")
assert "A~E를" in N["proto"]["text"]
cj.write_text(json.dumps(c, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ok")
