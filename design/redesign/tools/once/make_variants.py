"""Builds the chat-home option boards (D–G), swaps Main to option B, and keeps the old Main as Home0."""
import json, pathlib, sys

proj = pathlib.Path(sys.argv[1])

BLOB = {
    "so": "5d0e39a976cd27ba0c182884b28405df", "ni": "7cd6b76182321c6d5c5922ddec00c1ca",
    "sh": "5f26f9191b593e11d32dd705b72fd5d0", "ca": "ad60c4638819dddb9854296103adaa9e",
    "ci": "a90fc63f902a3c0fa8c95bdb16c6537e", "au": "acb8b83c2cbf2faec6a1a5d08ce1e73f",
}
HUE = {"so": "#56691A", "ni": "#B0353F", "sh": "#3D5A93", "ca": "#8A580B", "ci": "#7A4284", "au": "#1E6D66"}
NAME = {"so": "소크라테스", "ni": "니체", "sh": "쇼펜하우어", "ca": "카뮈", "ci": "시오랑", "au": "아우렐리우스"}
STATUS = {
    "so": "오늘 자네가 확신한 것 하나, 같이 따져 볼까?",
    "ni": "오늘 하루를 다시 살아도 좋은지, 저녁에 묻겠소.",
    "sh": "원하던 걸 얻은 다음 날을 조심하십시오.",
    "ca": "오늘 하늘은 어땠어요? 그 얘기부터 해요.",
    "ci": "밤새 쓴 문장 하나, 지우지 않기로 했어요.",
    "au": "오늘 내 손에 달린 일 하나만 고르세요.",
}

HEAD = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700;800&amp;family=Gowun+Batang:wght@400;700&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#3A2BB0}}a:hover{{color:#4636CC}}
@keyframes agPulse{{0%,100%{{opacity:1;transform:scale(1)}}50%{{opacity:.55;transform:scale(.8)}}}}
</style>
</helmet>
<div style="width: 390px; height: 844px; box-sizing: border-box; display: flex; flex-direction: column; background: #F5F4F9; color: #1C1930; font-family: 'Gothic A1', sans-serif; position: relative; overflow: hidden;">
"""
TAIL = """</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
  renderVals() {
    return {};
  }
}
</script>
</body>
</html>
"""

def svg(paths, size=24, sw="1.8", extra=""):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"{extra}>{paths}</svg>')

I_SEARCH = '<circle cx="11" cy="11" r="6.5"></circle><path d="M20 20l-4.2-4.2"></path>'
I_GEAR = ('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>')
I_PEN = '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>'
I_CHEV_D = '<path d="m6 9 6 6 6-6"></path>'
I_CHEV_R = '<path d="m9 18 6-6-6-6"></path>'
I_PLUS = '<path d="M12 5v14M5 12h14"></path>'
I_UP = '<path d="M12 19V5M5 12l7-7 7 7"></path>'
I_GROUP = ('<circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path>'
           '<path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"></path><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"></path>')
I_MEMO = '<path d="M5 3h10l4 4v14H5z"></path><path d="M9 11h6M9 15h4"></path>'
I_HAND = '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path><path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01"></path>'
I_CHAT = '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path>'
I_PERSON = '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>'
I_FEED = '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"></path><path d="M17 9h3v8a2 2 0 0 1-2 2"></path><path d="M8 9h5M8 13h5M8 16h3"></path>'
I_BOOK = '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"></path><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"></path>'

WORDMARK = ('<span style="flex-grow: 1; font-size: 21px; font-weight: 800; letter-spacing: 0.22em; display: inline-flex; align-items: center;" aria-label="AGORA">'
            'AG<span style="width: 13px; height: 13px; border-radius: 50%; background: #F2B544; display: inline-block; margin: 0 0.24em 0 0.02em;"></span>RA</span>')

def icon_btn(label, icon):
    return (f'<button aria-label="{label}" style="width: 48px; height: 48px; border: 0; border-radius: 50%; background: transparent; color: #1C1930; display: flex; align-items: center; justify-content: center; cursor: pointer;">'
            f'{svg(icon)}</button>')

def icon_link(href, label, icon):
    return (f'<a href="{href}" aria-label="{label}" style="width: 48px; height: 48px; border-radius: 50%; color: #1C1930; display: flex; align-items: center; justify-content: center;">'
            f'{svg(icon)}</a>')

def header(left, *buttons):
    inner = "\n    ".join([left, *buttons])
    return (f'  <header style="height: 64px; padding: 0 8px 0 20px; display: flex; align-items: center; gap: 2px; flex: none;">\n'
            f'    {inner}\n  </header>\n')

def nav(self_file):
    item = ('<a href="{href}"{cur} style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: {color}; font-size: 12px; font-weight: 700;">'
            '<span style="position: relative; width: 64px; height: 32px; border-radius: 16px;{pill} display: flex; align-items: center; justify-content: center;">{icon}{badge}</span>{label}</a>')
    badge3 = ('<span style="position: absolute; right: 9px; top: 0; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; border-radius: 999px; background: #F2B544; color: #2B1D00; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center;">3</span>')
    parts = [
        item.format(href="PeopleTab.dc.html", cur="", color="#625E7A", pill="", icon=svg(I_PERSON), badge="", label="프로필"),
        item.format(href=self_file, cur=' aria-current="page"', color="#1C1930", pill=" background: #E8E5FD; color: #3A2BB0;", icon=svg(I_CHAT), badge="", label="채팅"),
        item.format(href="Feed.dc.html", cur="", color="#625E7A", pill="", icon=svg(I_FEED), badge=badge3, label="피드"),
        item.format(href="Notes.dc.html", cur="", color="#625E7A", pill="", icon=svg(I_BOOK), badge="", label="노트"),
    ]
    inner = "\n    ".join(parts)
    return (f'  <nav aria-label="주요 화면" style="height: 80px; flex: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); background: #FFFFFF; box-shadow: inset 0 1px 0 #E2DFEB;">\n'
            f'    {inner}\n  </nav>\n')

def av(pid, size, ring=4.0, gap=2, bg="#F5F4F9", extra=""):
    return (f'<img src="/_blob/{BLOB[pid]}" alt="" style="{extra}width: {size}px; height: {size}px; flex: none; border-radius: 50%; object-fit: cover; '
            f'filter: grayscale(1) contrast(1.06); background: #ECEAF3; box-shadow: 0 0 0 {gap}px {bg}, 0 0 0 {ring:g}px {HUE[pid]};">')

def cluster(members, box=48, bg="#F5F4F9"):
    if len(members) == 1:
        return (f'<span style="width: {box}px; height: {box}px; flex: none; display: flex; align-items: center; justify-content: center;" aria-hidden="true">'
                f'{av(members[0], box - 4, bg=bg)}</span>')
    if len(members) == 2:
        s = round(box * 0.66)
        a = av(members[0], s, ring=3.5, bg=bg, extra="position: absolute; left: 0; top: 0; ")
        b = av(members[1], s, ring=3.5, bg=bg, extra="position: absolute; right: 0; bottom: 0; ")
        return f'<span style="position: relative; width: {box}px; height: {box}px; flex: none;" aria-hidden="true">{a}{b}</span>'
    s = round(box * 0.54)
    a = av(members[0], s, ring=3.5, bg=bg, extra=f"position: absolute; left: {round((box - s) / 2)}px; top: 0; ")
    b = av(members[1], s, ring=3.5, bg=bg, extra="position: absolute; left: 0; bottom: 0; ")
    c = av(members[2], s, ring=3.5, bg=bg, extra="position: absolute; right: 0; bottom: 0; ")
    return f'<span style="position: relative; width: {box}px; height: {box}px; flex: none;" aria-hidden="true">{a}{b}{c}</span>'

ROOMS = [
    dict(title="허무에 대하여", members=["ci", "ca", "ni"], time="지금", typing="ci"),
    dict(title="니체 · 쇼펜하우어", members=["ni", "sh"], time="오전 8:46", sender="ni",
         text="운이 아니오. 오늘 당신에게 맛을 볼 여유가 있었던 거요.", unread=2),
    dict(title="카뮈", members=["ca"], time="어제", text="오늘 산책은 어땠어요? 아까 하늘 얘기가 생각나서요.", first=True),
    dict(title="마르쿠스 아우렐리우스", members=["au"], time="어제", text="아침에 정한 한 가지, 지켰나요?"),
    dict(title="소크라테스", members=["so"], time="10월 12일", text="그럼 자네가 말하는 ‘좋은 삶’이란 무엇인가?"),
    dict(title="니체", members=["ni"], time="10월 11일", text="‘해야 한다’와 ‘하고 싶다’, 오늘은 어느 쪽이 더 컸소?"),
]

PULSE_DOT = '<span style="width: 7px; height: 7px; border-radius: 50%; background: #F2B544; animation: agPulse 1.8s ease-in-out infinite; flex: none;" aria-hidden="true"></span>'
BADGE = '<span style="min-width: 20px; height: 20px; padding: 0 6px; box-sizing: border-box; flex: none; border-radius: 999px; background: #4636CC; color: #FFFFFF; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">{n}</span>'
FIRST_CHIP = '<span style="height: 18px; padding: 0 6px; border-radius: 6px; background: #FCF0D6; color: #835300; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; flex: none;">먼저 건넴</span>'

def room_row(r, box=48, pad="12px 20px", title_size=16, text_size=14):
    top = [f'<span style="font-size: {title_size}px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{r["title"]}</span>']
    if r.get("first"):
        top.append(FIRST_CHIP)
    top.append('<span style="flex-grow: 1;"></span>')
    tcolor = "#835300; font-weight: 700" if r.get("typing") else "#625E7A"
    top.append(f'<span style="font-size: 11px; color: {tcolor}; flex: none;">{r["time"]}</span>')
    if r.get("typing"):
        bottom = (f'<span style="display: flex; align-items: center; gap: 7px;">{PULSE_DOT}'
                  f'<span style="font-size: {text_size}px; line-height: 20px; color: #835300; font-weight: 600;">{NAME[r["typing"]]}이 쓰는 중…</span></span>')
    else:
        who = f'<b style="font-weight: 700; color: {HUE[r["sender"]]};">{NAME[r["sender"]]}</b> ' if r.get("sender") else ""
        badge = BADGE.format(n=r["unread"]) if r.get("unread") else ""
        bottom = (f'<span style="display: flex; align-items: center; gap: 8px;">'
                  f'<span style="font-size: {text_size}px; line-height: 20px; color: #474360; flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{who}{r["text"]}</span>{badge}</span>')
    return (f'    <a href="Room.dc.html" style="display: flex; align-items: center; gap: 14px; padding: {pad}; text-decoration: none; color: inherit;">\n'
            f'      {cluster(r["members"], box)}\n'
            f'      <span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;">\n'
            f'        <span style="display: flex; align-items: center; gap: 8px;">{"".join(top)}</span>\n'
            f'        {bottom}\n'
            f'      </span>\n    </a>\n')

def search_field(fid, placeholder, label):
    return (f'  <div style="padding: 4px 16px 8px; flex: none;">\n'
            f'    <label for="{fid}" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);">{label}</label>\n'
            f'    <span style="height: 44px; padding: 0 16px; box-sizing: border-box; border-radius: 999px; background: #ECEAF3; color: #625E7A; display: flex; align-items: center; gap: 10px;">'
            f'{svg(I_SEARCH, 18, "2")}<input id="{fid}" type="search" placeholder="{placeholder}" style="flex-grow: 1; min-width: 0; border: 0; padding: 0; background: transparent; color: #1C1930; font-family: inherit; font-size: 15px; outline: none;"></span>\n'
            f'  </div>\n')

FAB = ('  <a href="People.dc.html" style="position: absolute; right: 20px; bottom: 100px; height: 56px; padding: 0 20px 0 16px; border-radius: 18px; background: #4636CC; color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; text-decoration: none; box-shadow: 0 6px 18px rgba(28, 25, 48, 0.18);">'
       f'{svg(I_PEN, 22)}새 대화</a>\n')

def page(title, body):
    return HEAD.format(title=title) + "\n" + body + TAIL

# ---------- D: list first ----------
def chip(label, on=False):
    st = ("background: #E8E5FD; color: #3A2BB0;" if on else "background: transparent; color: #474360; box-shadow: inset 0 0 0 1px #CDC9DA;")
    return (f'<button aria-pressed="{"true" if on else "false"}" style="height: 34px; padding: 0 14px; flex: none; border: 0; border-radius: 999px; {st} font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;">{label}</button>')

d = header('<h1 style="margin: 0; flex-grow: 1; font-size: 22px; line-height: 30px; font-weight: 800;">채팅</h1>',
           icon_link("People.dc.html", "새 대화", I_PEN), icon_link("Settings.dc.html", "설정", I_GEAR))
d += search_field("d-search", "대화나 철학자 찾기", "대화 찾기")
d += ('  <div role="group" aria-label="대화 거르기" style="display: flex; gap: 8px; padding: 2px 16px 8px; flex: none; overflow: hidden;">\n    '
      + "\n    ".join([chip("전체", True), chip("안 읽음 2"), chip("개인톡"), chip("단톡방"), chip("먼저 건넴")]) + "\n  </div>\n")
d += '  <main style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column;">\n'
d += "".join(room_row(r) for r in ROOMS)
d += '  </main>\n\n' + FAB + "\n" + nav("HomeD.dc.html")
(proj / "HomeD.dc.html").write_text(page("채팅 홈 안 D — 목록이 먼저", d), encoding="utf-8")

# ---------- E: one-liner strip + list ----------
def note_item(pid=None, me=False):
    if me:
        bubble_text, name, color = "요즘 일과 쉼 사이에서 균형을 찾는 중", "내 한 마디", "#474360"
        avatar = ('<span style="width: 56px; height: 56px; flex: none; border-radius: 50%; background: #FCF0D6; color: #835300; font-size: 19px; font-weight: 800; '
                  'box-shadow: 0 0 0 2px #F5F4F9, 0 0 0 3.5px #CDC9DA; display: flex; align-items: center; justify-content: center;">지</span>')
        href = "MyProfile.dc.html"
    else:
        bubble_text, name, color = STATUS[pid], NAME[pid], HUE[pid]
        avatar = av(pid, 56)
        href = "Profile.dc.html"
    dot = ""
    if pid == "ci":
        avatar = (f'<span style="position: relative; width: 56px; height: 56px; flex: none; display: block;">{avatar}'
                  '<span style="position: absolute; right: -3px; bottom: -3px; width: 13px; height: 13px; border-radius: 50%; background: #F2B544; box-shadow: 0 0 0 3px #F5F4F9; animation: agPulse 1.8s ease-in-out infinite;" aria-hidden="true"></span></span>')
    return (f'<a href="{href}" style="width: 84px; flex: none; display: flex; flex-direction: column; align-items: center; text-decoration: none; color: inherit;">'
            f'<span style="width: 80px; min-height: 36px; padding: 6px 7px; box-sizing: border-box; border-radius: 14px; background: #FFFFFF; box-shadow: 0 1px 3px rgba(28, 25, 48, 0.08), inset 0 0 0 1px #E2DFEB; '
            f'font-family: \'Gowun Batang\', serif; font-size: 11px; line-height: 15px; color: #1C1930; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{bubble_text}</span>'
            f'<span style="width: 7px; height: 7px; align-self: flex-start; margin: 2px 0 0 30px; border-radius: 50%; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2DFEB;" aria-hidden="true"></span>'
            f'<span style="width: 4px; height: 4px; align-self: flex-start; margin: 1px 0 6px 25px; border-radius: 50%; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2DFEB;" aria-hidden="true"></span>'
            f'{avatar}'
            f'<span style="margin-top: 8px; font-size: 11.5px; line-height: 16px; font-weight: 700; color: {color}; white-space: nowrap;">{name}</span></a>')

e = header(WORDMARK, icon_link("People.dc.html", "새 대화", I_PEN), icon_link("Settings.dc.html", "설정", I_GEAR))
e += search_field("e-search", "찾기", "대화 찾기")
e += ('  <section aria-label="오늘의 한 마디" style="display: flex; gap: 4px; padding: 6px 12px 12px; flex: none; overflow: hidden;">\n    '
      + "\n    ".join([note_item(me=True)] + [note_item(p) for p in ["ci", "ca", "ni", "sh", "so", "au"]]) + "\n  </section>\n")
tab_on = 'style="height: 44px; flex: 1 1 0; border: 0; background: transparent; color: #1C1930; box-shadow: inset 0 -2px 0 #4636CC; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer;"'
tab_off = 'style="height: 44px; flex: 1 1 0; border: 0; background: transparent; color: #625E7A; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"'
e += (f'  <div role="tablist" aria-label="대화 나누어 보기" style="display: flex; padding: 0 16px; flex: none; box-shadow: inset 0 -1px 0 #E2DFEB;">\n'
      f'    <button role="tab" aria-selected="true" {tab_on}>대화</button>\n'
      f'    <button role="tab" aria-selected="false" {tab_off}>먼저 건넨 말 <span style="min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 999px; background: #F2B544; color: #2B1D00; font-size: 10.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">1</span></button>\n'
      f'  </div>\n')
e += '  <main style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; padding-top: 4px;">\n'
e += "".join(room_row(r, box=48, pad="10px 20px", title_size=15.5, text_size=14) for r in ROOMS if not r.get("first"))
e += '  </main>\n\n' + nav("HomeE.dc.html")
(proj / "HomeE.dc.html").write_text(page("채팅 홈 안 E — 한 마디 띠 + 목록", e), encoding="utf-8")

# ---------- F: grouped sections ----------
def tile(icon, label, count, tone, href="Room.dc.html"):
    fg, bg = tone
    return (f'<a href="{href}" style="min-height: 76px; padding: 10px 12px; box-sizing: border-box; border-radius: 16px; background: #FFFFFF; box-shadow: inset 0 0 0 1px #E2DFEB; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; text-decoration: none; color: inherit;">'
            f'<span style="display: flex; align-items: center; justify-content: space-between;"><span style="width: 30px; height: 30px; border-radius: 10px; background: {bg}; color: {fg}; display: flex; align-items: center; justify-content: center;">{svg(icon, 17, "2")}</span>'
            f'<span style="font-size: 15px; font-weight: 800; color: {fg};">{count}</span></span>'
            f'<span style="font-size: 12.5px; line-height: 17px; font-weight: 700; color: #1C1930;">{label}</span></a>')

def section_head(label, add_label):
    return (f'  <div style="height: 40px; padding: 0 8px 0 14px; display: flex; align-items: center; gap: 6px; flex: none;">\n'
            f'    <button aria-expanded="true" style="height: 36px; padding: 0 8px 0 4px; border: 0; border-radius: 10px; background: transparent; color: #474360; font-family: inherit; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 4px; cursor: pointer;">{svg(I_CHEV_D, 16, "2.2")}{label}</button>\n'
            f'    <span style="flex-grow: 1;"></span>\n'
            f'    <a href="People.dc.html" aria-label="{add_label}" style="width: 40px; height: 40px; border-radius: 50%; color: #474360; display: flex; align-items: center; justify-content: center;">{svg(I_PLUS, 18, "2")}</a>\n'
            f'  </div>\n')

def dense_row(lead, label, right="", bold=False):
    w = "800; color: #1C1930" if bold else "600; color: #474360"
    return (f'  <a href="Room.dc.html" style="min-height: 44px; margin: 0 8px; padding: 0 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">'
            f'{lead}<span style="flex-grow: 1; min-width: 0; font-size: 15px; font-weight: {w}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{label}</span>{right}</a>\n')

def group_lead(members):
    a = av(members[0], 20, ring=3, gap=1.5, extra="position: absolute; left: 0; top: 0; ")
    b = av(members[1], 20, ring=3, gap=1.5, extra="position: absolute; right: 0; bottom: 0; ")
    return f'<span style="position: relative; width: 28px; height: 28px; flex: none;" aria-hidden="true">{a}{b}</span>'

def dm_lead(pid):
    return f'<span style="width: 28px; height: 28px; flex: none; display: flex; align-items: center; justify-content: center;" aria-hidden="true">{av(pid, 24, ring=3, gap=1.5)}</span>'

writing = (f'<span style="display: flex; align-items: center; gap: 6px; flex: none; font-size: 12px; font-weight: 700; color: #835300;">{PULSE_DOT}시오랑 쓰는 중</span>')
f = header(WORDMARK, icon_btn("검색", I_SEARCH), icon_link("Settings.dc.html", "설정", I_GEAR))
f += search_field("f-search", "방이나 철학자로 바로 가기", "방이나 철학자로 바로 가기")
f += ('  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding: 2px 16px 10px; flex: none;">\n    '
      + "\n    ".join([tile(I_CHAT, "쓰는 중", "1", ("#835300", "#FCF0D6")),
                      tile(I_HAND, "먼저 건넨 말", "1", ("#835300", "#FCF0D6")),
                      tile(I_MEMO, "여백 메모", "1", ("#3A2BB0", "#E8E5FD"), "Note.dc.html")]) + "\n  </div>\n")
f += section_head("단톡방", "단톡방 만들기")
f += dense_row(group_lead(["ci", "ca"]), "허무에 대하여", writing, bold=True)
f += dense_row(group_lead(["ni", "sh"]), "니체 · 쇼펜하우어", BADGE.format(n=2), bold=True)
f += section_head("개인톡", "개인톡 시작하기")
f += dense_row(dm_lead("ca"), "카뮈", FIRST_CHIP, bold=True)
f += dense_row(dm_lead("au"), "마르쿠스 아우렐리우스", '<span style="font-size: 11px; color: #625E7A; flex: none;">어제</span>')
f += dense_row(dm_lead("so"), "소크라테스", '<span style="font-size: 11px; color: #625E7A; flex: none;">10월 12일</span>')
f += dense_row(dm_lead("ni"), "니체", '<span style="font-size: 11px; color: #625E7A; flex: none;">10월 11일</span>')
f += ('  <a href="People.dc.html" style="min-height: 44px; margin: 4px 8px 0; padding: 0 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; text-decoration: none; color: #3A2BB0; font-size: 14px; font-weight: 700;">'
      f'<span style="width: 28px; height: 28px; flex: none; border-radius: 9px; background: #E8E5FD; display: flex; align-items: center; justify-content: center;">{svg(I_PLUS, 16, "2.2")}</span>철학자 더 부르기</a>\n')
f += '  <span style="flex-grow: 1;"></span>\n'
f += ('  <a href="People.dc.html" aria-label="새 대화" style="position: absolute; right: 20px; bottom: 100px; width: 56px; height: 56px; border-radius: 18px; background: #4636CC; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(28, 25, 48, 0.18);">'
      f'{svg(I_PEN, 22)}</a>\n')
f += nav("HomeF.dc.html")
(proj / "HomeF.dc.html").write_text(page("채팅 홈 안 F — 묶음 목록", f), encoding="utf-8")

# ---------- G: one-line composer + list ----------
g = header(WORDMARK, icon_btn("검색", I_SEARCH), icon_link("Settings.dc.html", "설정", I_GEAR))
g += ('  <div style="padding: 4px 16px 10px; flex: none;">\n'
      '    <label for="g-say" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);">철학자에게 말 걸기</label>\n'
      '    <span style="min-height: 56px; padding: 6px 6px 6px 8px; box-sizing: border-box; border-radius: 999px; background: #FFFFFF; box-shadow: inset 0 0 0 1.5px #4636CC, 0 4px 14px rgba(28, 25, 48, 0.06); display: flex; align-items: center; gap: 10px;">'
      '<span style="width: 36px; height: 36px; flex: none; border-radius: 50%; background: #FCF0D6; color: #835300; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center;" aria-hidden="true">지</span>'
      '<input id="g-say" type="text" placeholder="오늘은 무슨 이야기를 꺼내 볼까요?" style="flex-grow: 1; min-width: 0; border: 0; padding: 0; background: transparent; color: #1C1930; font-family: inherit; font-size: 15px; outline: none;">'
      f'<a href="Main.dc.html" aria-label="철학자 고르고 보내기" style="width: 44px; height: 44px; flex: none; border-radius: 50%; background: #4636CC; color: #FFFFFF; display: flex; align-items: center; justify-content: center;">{svg(I_UP, 20, "2.2")}</a></span>\n'
      '  </div>\n')
g += '  <main style="flex-grow: 1; overflow: hidden; display: flex; flex-direction: column;">\n'
live = ROOMS[0]
g += ('    <a href="Room.dc.html" style="margin: 2px 12px 6px; padding: 10px 10px; border-radius: 18px; background: #FCF0D6; display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">\n'
      f'      {cluster(live["members"], 44, bg="#FCF0D6")}\n'
      '      <span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;">\n'
      '        <span style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 15.5px; font-weight: 700; flex-grow: 1;">허무에 대하여</span><span style="font-size: 11px; color: #835300; font-weight: 700;">지금</span></span>\n'
      f'        <span style="display: flex; align-items: center; gap: 7px;">{PULSE_DOT}<span style="font-size: 14px; line-height: 20px; color: #835300; font-weight: 600;">시오랑이 쓰는 중…</span></span>\n'
      '      </span>\n    </a>\n')
g += '    <h2 style="margin: 0; padding: 10px 20px 2px; font-size: 13px; line-height: 18px; font-weight: 700; color: #474360;">대화</h2>\n'
g += "".join(room_row(r, box=48, pad="10px 20px", title_size=15.5, text_size=14) for r in ROOMS[1:])
g += '  </main>\n\n' + nav("HomeG.dc.html")
(proj / "HomeG.dc.html").write_text(page("채팅 홈 안 G — 한 줄 말 걸기 + 목록", g), encoding="utf-8")

# ---------- Main <- B, old Main -> Home0 ----------
old_main = (proj / "Main.dc.html").read_text(encoding="utf-8")
home0 = old_main.replace("<title>채팅</title>", "<title>처음 안 — 초상 띠 + 목록</title>", 1)
home0 = home0.replace('<a href="Main.dc.html" aria-current="page"', '<a href="Home0.dc.html" aria-current="page"', 1)
(proj / "Home0.dc.html").write_text(home0, encoding="utf-8")
b = (proj / "HomeB.dc.html").read_text(encoding="utf-8")
b = b.replace("<title>채팅 홈 B — 말 걸기가 먼저</title>", "<title>채팅</title>", 1)
b = b.replace('<a href="HomeB.dc.html" aria-current="page"', '<a href="Main.dc.html" aria-current="page"', 1)
assert "HomeB.dc.html" not in b
(proj / "Main.dc.html").write_text(b, encoding="utf-8")
(proj / "HomeB.dc.html").unlink()

# ---------- canvas ----------
cp = proj / "canvas.json"
c = json.loads(cp.read_text(encoding="utf-8"))
boards = c["boards"]
boards.pop("HomeB.dc.html")
boards["Main.dc.html"]["title"] = "채팅 — 안 B"
row = -1800
layout = [("Home0.dc.html", 0, "처음 안 — 초상 띠 + 목록"), ("HomeA.dc.html", 470, None), ("HomeC.dc.html", 940, None),
          ("HomeD.dc.html", 1640, "채팅 홈 안 D — 목록이 먼저"), ("HomeE.dc.html", 2110, "채팅 홈 안 E — 한 마디 띠 + 목록"),
          ("HomeF.dc.html", 2580, "채팅 홈 안 F — 묶음 목록"), ("HomeG.dc.html", 3050, "채팅 홈 안 G — 한 줄 말 걸기 + 목록")]
new_boards = {}
for k, v in boards.items():
    new_boards[k] = v
for name, x, title in layout:
    e_ = new_boards.get(name, {"w": 390, "h": 844})
    e_.update({"x": x, "y": row, "w": 390, "h": 844})
    if title:
        e_["title"] = title
    new_boards[name] = e_
c["boards"] = new_boards
order = [o for o in c["order"] if o != "HomeB.dc.html"]
i = order.index("HomeA.dc.html")
order = order[:i] + ["Home0.dc.html"] + order[i:]
j = order.index("HomeC.dc.html") + 1
order = order[:j] + ["HomeD.dc.html", "HomeE.dc.html", "HomeF.dc.html", "HomeG.dc.html"] + order[j:]
c["order"] = order
c["notes"]["home"] = {"x": 0, "y": -2100, "text": "채팅 홈 — 지난 안 (지금 채팅은 안 B)", "kind": "title1", "maxW": 1330}
c["notes"]["home2"] = {"x": 1640, "y": -2100, "text": "채팅 홈 — 새 안 (익숙한 메신저 꼴)", "kind": "title1", "maxW": 1800}
cp.write_text(json.dumps(c, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ok", order)
