"""Assembles project/Proto.dc.html from proto/tpl/*.html + proto/logic.js.

Template shorthand handled here (expanded before publishing, never shipped):
  [[name|arg|...]]  shared components (avatar, rows, switches, icons ...)
  ⟦한국어¦English⟧   bilingual UI text -> {{ t.kN }} with generated dictionaries
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(sys.argv[1])          # design/redesign
PROTO = ROOT / "proto"
OUT = ROOT / "canvas" / "project" / "Proto.dc.html"

ICONS = {
    "back": '<path d="M15 5l-7 7 7 7"></path>',
    "search": '<circle cx="11" cy="11" r="6.5"></circle><path d="M20 20l-4.2-4.2"></path>',
    "gear": '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>',
    "chev": '<path d="m9 18 6-6-6-6"></path>',
    "chevd": '<path d="m6 9 6 6 6-6"></path>',
    "plus": '<path d="M12 5v14M5 12h14"></path>',
    "up": '<path d="M12 19V5M5 12l7-7 7 7"></path>',
    "info": '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.5h.01"></path>',
    "info2": '<circle cx="12" cy="12" r="9"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    "at": '<circle cx="12" cy="12" r="4"></circle><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"></path>',
    "person": '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
    "chat": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path>',
    "feed": '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"></path><path d="M17 9h3v8a2 2 0 0 1-2 2"></path><path d="M8 9h5M8 13h5M8 16h3"></path>',
    "book": '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"></path><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"></path>',
    "pen": '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>',
    "cal": '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M4 10h16M9 3v4M15 3v4"></path>',
    "camera": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle>',
    "image": '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m21 16-5-5-9 9"></path>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"></path>',
    "close": '<path d="M6 6l12 12M18 6 6 18"></path>',
    "rotate": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>',
    "lock": '<rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path>',
    "clock": '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l3 2"></path>',
    "reply": '<path d="M9 7l-5 5 5 5"></path><path d="M4 12h10a6 6 0 0 1 6 6v1"></path>',
    "feather": '<path d="M20.2 12.2a6 6 0 0 0-8.5-8.5L5 10.5V19h8.5z"></path><path d="M16 8 2 22"></path><path d="M17.5 15H9"></path>',
    "group": '<circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"></path><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"></path>',
    "addperson": '<circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><path d="M19 8v6"></path><path d="M16 11h6"></path>',
    "readers": '<circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2a5 5 0 0 1 5.5 5.8"></path>',
    "cloud": '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.3 12.5 3.5 3.5 0 0 0 6.5 19z"></path>',
    "memo": '<path d="M5 3h10l4 4v14H5z"></path><path d="M9 11h6M9 15h4"></path>',
    "hand": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path><path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01"></path>',
    "expand": '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"></path>',
    "askmemo": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path><path d="M12 9v5M9.5 11.5h5"></path>',
    "download": '<path d="M12 4v11M7 10l5 5 5-5"></path><path d="M5 20h14"></path>',
    "upload": '<path d="M12 16V5M7 10l5-5 5 5"></path><path d="M5 20h14"></path>',
    "clip": '<path d="M20.5 11.2l-8.1 8.1a5 5 0 0 1-7.1-7.1l8.1-8.1a3.4 3.4 0 0 1 4.8 4.8l-8.1 8.1a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"></path>',
    "flag": '<path d="M5 21V4h11l-1.5 4L16 12H5"></path>',
    "archive": '<rect x="3" y="4" width="18" height="5" rx="1"></rect><path d="M5 9v10h14V9"></path><path d="M10 13h4"></path>',
    "layout": '<rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M4 10h16M10 10v10"></path>',
    "chip": '<rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"></path>',
    "trash": '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path>',
}
FILLED = {
    "stop": '<rect x="7" y="7" width="10" height="10" rx="2"></rect>',
    "more": '<circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle>',
}

def icon(name, size="24", sw="1.8", style=""):
    st = f' style="{style}"' if style else ""
    if name in FILLED:
        return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"{st}>{FILLED[name]}</svg>'
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"{st}>{ICONS[name]}</svg>')

def av(var, size, ring="4", gapc="var(--bg)", extra=""):
    ring_f = float(ring)
    gap = "2" if ring_f >= 3.5 else "1.5"
    if ring_f >= 5:
        gap = "3"
    return (f'<span style="width: {size}px; height: {size}px; {extra} flex: none; display: block; border-radius: 50%; overflow: hidden; '
            f'background: var(--sunken); box-shadow: 0 0 0 {gap}px {gapc}, 0 0 0 {ring}px {{{{ {var}.ring }}}};">'
            f'<img src="{{{{ {var}.src }}}}" alt="" draggable="false" style="width: 100%; height: 100%; display: block; object-fit: cover; {{{{ {var}.img }}}}"></span>')

def cl(var, box, gapc="var(--bg)"):
    box = int(box)
    s2 = round(box * 0.66)
    s3 = round(box * 0.56)
    x3 = (box - s3) // 2
    one_ring = "4" if box >= 40 else "3"
    two_ring = "3.5" if box >= 40 else "3"
    three_ring = "3" if box >= 40 else "2.5"
    return (f'<span style="position: relative; width: {box}px; height: {box}px; flex: none; display: block;" aria-hidden="true">'
            f'<sc-if value="{{{{ {var}.one }}}}">' + av(f"{var}.a", box - 4, one_ring, gapc, "position: absolute; left: 2px; top: 2px;") + '</sc-if>'
            f'<sc-if value="{{{{ {var}.two }}}}">' + av(f"{var}.a", s2, two_ring, gapc, "position: absolute; left: 0; top: 0;")
            + av(f"{var}.b", s2, two_ring, gapc, "position: absolute; right: 0; bottom: 0;") + '</sc-if>'
            f'<sc-if value="{{{{ {var}.three }}}}">' + av(f"{var}.a", s3, three_ring, gapc, f"position: absolute; left: {x3}px; top: 0;")
            + av(f"{var}.b", s3, three_ring, gapc, "position: absolute; left: 0; bottom: 0;")
            + av(f"{var}.c", s3, three_ring, gapc, "position: absolute; right: 0; bottom: 0;") + '</sc-if></span>')

def sw(var):
    return (f'<span style="position: relative; width: 52px; height: 32px; flex: none; border-radius: 999px; transition: background 0.15s ease; {{{{ {var}.track }}}}" aria-hidden="true">'
            f'<span style="position: absolute; top: 4px; width: 24px; height: 24px; border-radius: 50%; transition: left 0.15s ease; {{{{ {var}.knob }}}}"></span></span>')

def seg(lst, aria, lv="o"):
    return (f'<div role="group" aria-label="{aria}" style="display: flex; padding: 4px; border-radius: 16px; background: var(--sunken); gap: 4px;">'
            f'<sc-for list="{{{{ {lst} }}}}" as="{lv}" hint-placeholder-count="3"><button aria-pressed="{{{{ {lv}.on }}}}" onClick="{{{{ {lv}.pick }}}}" '
            f'style="flex: 1 1 0; min-width: 0; min-height: 40px; padding: 0 4px; border: 0; border-radius: 12px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; {{{{ {lv}.style }}}}">{{{{ {lv}.label }}}}</button></sc-for></div>')

BACK = ('<button aria-label="⟦뒤로¦Back⟧" onClick="{{ fn.goBack }}" style="width: 48px; height: 48px; flex: none; border: 0; border-radius: 50%; '
        'background: transparent; color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer;">' + icon("back") + '</button>')

def hdr(title):
    return ('<header style="height: 64px; padding: 0 8px; display: flex; align-items: center; gap: 4px; flex: none;">' + BACK +
            f'<h1 style="margin: 0; flex-grow: 1; min-width: 0; font-size: 18px; line-height: 24px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{title}</h1></header>')

def iconbtn(onclick, label, name, size="24"):
    return (f'<button aria-label="{label}" onClick="{{{{ {onclick} }}}}" style="width: 48px; height: 48px; flex: none; border: 0; border-radius: 50%; '
            f'background: transparent; color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer;">{icon(name, size)}</button>')

WORDMARK = ('<span style="flex-grow: 1; font-size: 21px; font-weight: 800; letter-spacing: 0.22em; display: inline-flex; align-items: center;" aria-label="AGORA">'
            'AG<span style="width: 13px; height: 13px; border-radius: 50%; background: var(--lamp); display: inline-block; margin: 0 0.24em 0 0.02em;"></span>RA</span>')

FIRST_CHIP = ('<span style="height: 18px; padding: 0 6px; flex: none; border-radius: 6px; background: var(--lampsoft); color: var(--lampink); '
              'font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center;">⟦먼저 건넴¦Reached out⟧</span>')
PULSE = '<span style="width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--lamp); animation: agPulse 1.8s ease-in-out infinite;" aria-hidden="true"></span>'

def badge(var):
    return (f'<span style="min-width: 20px; height: 20px; padding: 0 6px; flex: none; border-radius: 999px; background: var(--primary); color: var(--onprimary); '
            f'font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">{{{{ {var} }}}}</span>')

def row(var, box="44", tsize="15", pad="9px 20px", gapc="var(--bg)"):
    return (f'<button onClick="{{{{ {var}.open }}}}" style="width: 100%; display: flex; align-items: center; gap: 14px; padding: {pad}; border: 0; background: transparent; font-family: inherit; color: inherit; text-align: left; cursor: pointer;">'
            + cl(f"{var}.cl", box, gapc) +
            '<span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">'
            f'<span style="display: flex; align-items: center; gap: 8px;"><span style="font-size: {tsize}px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{{{ {var}.title }}}}</span>'
            f'<sc-if value="{{{{ {var}.first }}}}">{FIRST_CHIP}</sc-if><span style="flex-grow: 1;"></span>'
            f'<span style="font-size: 11px; flex: none; {{{{ {var}.timeStyle }}}}">{{{{ {var}.time }}}}</span></span>'
            f'<sc-if value="{{{{ {var}.writing }}}}"><span style="display: flex; align-items: center; gap: 7px;">{PULSE}'
            f'<span style="font-size: 13.5px; line-height: 19px; color: var(--lampink); font-weight: 600;">{{{{ {var}.writingText }}}}</span></span></sc-if>'
            f'<sc-if value="{{{{ {var}.notWriting }}}}"><span style="display: flex; align-items: center; gap: 8px;">'
            f'<span style="flex-grow: 1; min-width: 0; font-size: 13.5px; line-height: 19px; color: var(--ink2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">'
            f'<sc-if value="{{{{ {var}.hasWho }}}}"><b style="font-weight: 700; {{{{ {var}.whoStyle }}}}">{{{{ {var}.who }}}}</b> </sc-if>{{{{ {var}.preview }}}}</span>'
            f'<sc-if value="{{{{ {var}.hasUnread }}}}">{badge(var + ".unread")}</sc-if></span></sc-if>'
            '</span></button>')

def drow(var):
    return (f'<button onClick="{{{{ {var}.open }}}}" style="width: calc(100% - 16px); min-height: 44px; margin: 0 8px; padding: 0 12px; border: 0; border-radius: 12px; background: transparent; font-family: inherit; color: inherit; text-align: left; display: flex; align-items: center; gap: 12px; cursor: pointer;">'
            + cl(f"{var}.cl", "28") +
            f'<span style="flex-grow: 1; min-width: 0; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; {{{{ {var}.denseStyle }}}}">{{{{ {var}.title }}}}</span>'
            f'<sc-if value="{{{{ {var}.writing }}}}"><span style="display: flex; align-items: center; gap: 6px; flex: none; font-size: 12px; font-weight: 700; color: var(--lampink);">{PULSE}⟦쓰는 중¦writing⟧</span></sc-if>'
            f'<sc-if value="{{{{ {var}.first }}}}">{FIRST_CHIP}</sc-if>'
            f'<sc-if value="{{{{ {var}.hasUnread }}}}">{badge(var + ".unread")}</sc-if>'
            f'<sc-if value="{{{{ {var}.notWriting }}}}"><span style="font-size: 11px; color: var(--ink3); flex: none;">{{{{ {var}.time }}}}</span></sc-if></button>')

def ncard(var):
    return (f'<button onClick="{{{{ {var}.open }}}}" style="width: 100%; background: var(--surface); border: 0; border-radius: 22px; box-shadow: inset 0 0 0 1px var(--line); padding: 16px; display: flex; flex-direction: column; gap: 6px; text-align: left; font-family: inherit; color: inherit; cursor: pointer;">'
            f'<span style="display: flex; align-items: center; gap: 8px; width: 100%;"><span style="flex-grow: 1; min-width: 0; font-family: \'Gowun Batang\', serif; font-size: 19px; line-height: 27px; font-weight: 700;">{{{{ {var}.title }}}}</span>'
            f'<sc-if value="{{{{ {var}.hasKind }}}}"><span style="height: 18px; padding: 0 6px; flex: none; border-radius: 6px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; {{{{ {var}.kindStyle }}}}">{{{{ {var}.kindL }}}}</span></sc-if></span>'
            f'<span style="font-family: \'Gowun Batang\', serif; font-size: 14px; line-height: 22px; color: var(--ink2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{{{ {var}.excerpt }}}}</span>'
            f'<span style="display: flex; align-items: center; gap: 6px; margin-top: 4px; width: 100%; flex-wrap: wrap;"><span style="font-size: 11px; color: var(--ink3); flex-grow: 1;">{{{{ {var}.meta }}}}</span>'
            f'<sc-if value="{{{{ {var}.onlyMe }}}}"><span style="display: inline-flex; align-items: center; gap: 4px; color: var(--ink3); font-size: 11px; font-weight: 700;">{icon("lock", "14", "2")}⟦나만¦Only me⟧</span></sc-if>'
            f'<sc-if value="{{{{ {var}.hasReaders }}}}"><span style="display: flex; gap: 3px;"><sc-for list="{{{{ {var}.readers }}}}" as="rd" hint-placeholder-count="2">{av("rd", "18", "3", "var(--surface)")}</sc-for></span></sc-if>'
            f'<sc-if value="{{{{ {var}.sched }}}}"><span style="display: inline-flex; align-items: center; gap: 5px; color: var(--lampink); font-size: 11px; font-weight: 700;">{av(var + ".schedAv", "18", "3", "var(--surface)")}{icon("clock", "14", "2")}{{{{ {var}.schedText }}}}</span></sc-if>'
            f'<sc-if value="{{{{ {var}.hasNew }}}}"><span style="height: 22px; padding: 0 8px; border-radius: 999px; background: var(--lampsoft); color: var(--lampink); font-size: 11px; font-weight: 700; display: inline-flex; align-items: center;">{{{{ {var}.newText }}}}</span></sc-if>'
            '</span></button>')

SMALLBTN = 'height: 40px; padding: 0 12px; border: 0; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;'

def mem(var):
    return ('<div style="padding: 12px 12px 10px 16px; display: flex; flex-direction: column; gap: 5px; box-shadow: inset 0 -1px 0 var(--line);">'
            f'<span style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;"><span style="height: 18px; padding: 0 6px; border-radius: 6px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; {{{{ {var}.tone }}}}">{{{{ {var}.label }}}}</span>'
            f'<span style="font-size: 11.5px; color: var(--ink3);">{{{{ {var}.source }}}}</span></span>'
            f'<span style="font-size: 15px; line-height: 21px; font-weight: 600; {{{{ {var}.textStyle }}}}">{{{{ {var}.text }}}}</span>'
            f'<sc-if value="{{{{ {var}.priv }}}}"><span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: var(--lampink);">{icon("lock", "12", "2.4")}{{{{ {var}.privText }}}}</span></sc-if>'
            f'<span style="font-size: 12px; line-height: 17px; color: var(--ink3);">{{{{ {var}.scope }}}}</span>'
            f'<sc-if value="{{{{ {var}.isGuess }}}}"><span style="display: flex; gap: 6px; margin-top: 2px;"><button onClick="{{{{ {var}.yes }}}}" style="{SMALLBTN} background: var(--psoft); color: var(--pink);">⟦맞아요¦Yes⟧</button>'
            f'<button onClick="{{{{ {var}.no }}}}" style="{SMALLBTN} background: transparent; box-shadow: inset 0 0 0 1px var(--line2); color: var(--ink2);">⟦아니에요¦No⟧</button></span></sc-if>'
            f'<sc-if value="{{{{ {var}.notGuess }}}}"><span style="display: flex; gap: 2px; margin: 0 0 -6px -10px;"><button onClick="{{{{ {var}.togglePause }}}}" style="{SMALLBTN} height: 44px; background: transparent; color: var(--ink2);">{{{{ {var}.pauseLabel }}}}</button>'
            f'<button onClick="{{{{ {var}.forget }}}}" style="{SMALLBTN} height: 44px; background: transparent; color: var(--danger);">⟦잊게 하기¦Forget⟧</button></span></sc-if>'
            '</div>')

def top_line(top):
    return "" if top == "1" else " box-shadow: inset 0 1px 0 var(--line);"

def swrow(var, title, sub="", top="0"):
    sub_html = f'<span style="font-size: 13px; line-height: 18px; color: var(--ink3);">{sub}</span>' if sub else ""
    return (f'<button role="switch" aria-checked="{{{{ {var}.on }}}}" onClick="{{{{ {var}.toggle }}}}" style="width: 100%; min-height: 64px; padding: 10px 16px; border: 0; background: transparent; font-family: inherit; color: inherit; text-align: left; display: flex; align-items: center; gap: 14px; cursor: pointer;{top_line(top)}">'
            f'<span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;"><span style="font-size: 15px; line-height: 21px; font-weight: 600;">{title}</span>{sub_html}</span>'
            + sw(var) + '</button>')

def lrow(onclick, title, sub="", value="", top="0", tone=""):
    color = "color: var(--danger);" if tone == "danger" else ""
    sub_html = f'<span style="font-size: 13px; line-height: 18px; color: var(--ink3);">{sub}</span>' if sub else ""
    val_html = f'<span style="font-size: 14px; font-weight: 600; color: var(--ink2); flex: none; max-width: 45%; text-align: right;">{value}</span>' if value else ""
    chev = "" if tone == "danger" else icon("chev", "16", "2", "flex: none; color: var(--ink3);")
    return (f'<button onClick="{{{{ {onclick} }}}}" style="width: 100%; min-height: 60px; padding: 10px 16px; border: 0; background: transparent; font-family: inherit; color: inherit; text-align: left; display: flex; align-items: center; gap: 14px; cursor: pointer;{top_line(top)}">'
            f'<span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;"><span style="font-size: 15px; line-height: 21px; font-weight: 600; {color}">{title}</span>{sub_html}</span>'
            f'{val_html}{chev}</button>')

def h2(text, extra=""):
    return f'<h2 style="margin: 0; padding: 20px 20px 8px; font-size: 13px; line-height: 18px; font-weight: 700; color: var(--ink3); {extra}">{text}</h2>'

CARD_OPEN = '<div style="margin: 0 16px; background: var(--surface); border-radius: 20px; box-shadow: inset 0 0 0 1px var(--line); display: flex; flex-direction: column; overflow: hidden;">'
AICHIP = ('<span style="height: 18px; padding: 0 6px; border-radius: 6px; background: var(--sunken); color: var(--ink3); font-size: 10.5px; font-weight: 700; '
          'display: inline-flex; align-items: center;">AI</span>')

def screen(key, zkey, label, extra=""):
    return (f'<sc-if value="{{{{ {key} }}}}" hint-placeholder-val="{{{{ false }}}}"><section aria-label="{label}" style="position: absolute; inset: 0; {{{{ z.{zkey} }}}} '
            f'display: flex; flex-direction: column; background: var(--bg); color: var(--ink); animation: agIn 0.22s ease-out; {extra}">')

SCROLL = '<div class="ag-scroll" style="flex: 1 1 auto; min-height: 0; overflow-y: auto;">'

def hidelabel(for_id, text):
    return f'<label for="{for_id}" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;">{text}</label>'

def radio(var):
    return f'<span style="width: 22px; height: 22px; flex: none; border-radius: 50%; {{{{ {var}.dot }}}}" aria-hidden="true"></span>'

def checkbox(var):
    return (f'<span style="width: 26px; height: 26px; flex: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; {{{{ {var}.box }}}}" aria-hidden="true">'
            + icon("check", "16", "2.6") + '</span>')

def primary(onclick, label, disabled="", style_var="", extra=""):
    dis = f' disabled="{{{{ {disabled} }}}}"' if disabled else ""
    st = f"{{{{ {style_var} }}}}" if style_var else "background: var(--primary); color: var(--onprimary);"
    return (f'<button onClick="{{{{ {onclick} }}}}"{dis} style="width: 100%; height: 52px; border: 0; border-radius: 999px; font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; {st} {extra}">{label}</button>')

def secondary(onclick, label, extra=""):
    return (f'<button onClick="{{{{ {onclick} }}}}" style="width: 100%; height: 48px; border: 0; border-radius: 999px; background: var(--sunken); color: var(--ink); font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; {extra}">{label}</button>')

def chipbtn(var, extra=""):
    return (f'<button aria-pressed="{{{{ {var}.on }}}}" onClick="{{{{ {var}.pick }}}}" style="height: 36px; padding: 0 14px; flex: none; border: 0; border-radius: 999px; font-family: inherit; font-size: 13.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; {{{{ {var}.style }}}} {extra}">{{{{ {var}.label }}}}</button>')

def avchip(var):
    return (f'<button aria-pressed="{{{{ {var}.on }}}}" onClick="{{{{ {var}.pick }}}}" style="height: 36px; padding: 0 12px 0 5px; flex: none; border: 0; border-radius: 999px; font-family: inherit; font-size: 13.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; {{{{ {var}.style }}}}">'
            + av(var + ".av", "26", "3", f"{{{{ {var}.gap }}}}") + f'{{{{ {var}.name }}}}</button>')

MACROS = {
    "i": lambda name, size="24", sw="1.8", style="": icon(name, size, sw, style),
    "av": av, "cl": cl, "sw": sw, "seg": seg, "hdr": hdr, "row": row, "drow": drow, "ncard": ncard, "mem": mem,
    "swrow": swrow, "lrow": lrow, "h2": h2, "screen": screen, "hidelabel": hidelabel, "radio": radio, "checkbox": checkbox,
    "primary": primary, "secondary": secondary, "chipbtn": chipbtn, "avchip": avchip, "iconbtn": iconbtn, "badge": badge,
    "back": lambda: BACK, "card": lambda: CARD_OPEN, "/card": lambda: "</div>", "/screen": lambda: "</section></sc-if>",
    "scroll": lambda: SCROLL, "/scroll": lambda: "</div>", "aichip": lambda: AICHIP, "wordmark": lambda: WORDMARK,
    "firstchip": lambda: FIRST_CHIP, "pulse": lambda: PULSE,
}
MACRO_RE = re.compile(r"\[\[([^\[\]]+?)\]\]")

def expand(text):
    for _ in range(8):
        new = MACRO_RE.sub(lambda m: MACROS[m.group(1).split("|")[0]](*m.group(1).split("|")[1:]), text)
        if new == text:
            return new
        text = new
    raise SystemExit("macro expansion did not settle")

def main():
    parts = sorted((PROTO / "tpl").glob("*.html"))
    tpl = "".join(p.read_text(encoding="utf-8") for p in parts)
    tpl = expand(tpl)
    if "[[" in tpl:
        raise SystemExit("unexpanded macro: " + tpl[tpl.index("[["):tpl.index("[[") + 80])
    ko, en, keys = {}, {}, {}
    def tr(m):
        pair = (m.group(1), m.group(2))
        if pair not in keys:
            k = "k" + str(len(keys) + 1)
            keys[pair] = k
            ko[k], en[k] = pair
        return "{{ t." + keys[pair] + " }}"
    tpl = re.sub(r"⟦([^⟦⟧¦]*)¦([^⟦⟧¦]*)⟧", tr, tpl)
    if "⟦" in tpl or "¦" in tpl:
        i = tpl.find("⟦") if "⟦" in tpl else tpl.find("¦")
        raise SystemExit("broken i18n marker near: " + tpl[max(0, i - 60):i + 60])
    logic = (PROTO / "logic.js").read_text(encoding="utf-8")
    logic = logic.replace("const T_KO = {};", "const T_KO = " + json.dumps(ko, ensure_ascii=False) + ";", 1)
    logic = logic.replace("const T_EN = {};", "const T_EN = " + json.dumps(en, ensure_ascii=False) + ";", 1)
    helmet = (PROTO / "helmet.css").read_text(encoding="utf-8").strip()
    props = {
        "theme": {"editor": "enum", "options": ["라이트", "다크", "시스템"], "default": "라이트", "section": "보기"},
        "lang": {"editor": "enum", "options": ["한국어", "English"], "default": "한국어", "section": "보기"},
        "home": {"editor": "enum", "options": ["A 말 걸기 먼저", "B 한 줄 말 걸기", "C 목록 먼저", "D 한 마디 띠", "E 묶음 목록"], "default": "A 말 걸기 먼저", "section": "보기"},
        "startTab": {"editor": "enum", "options": ["프로필", "채팅", "피드", "노트"], "default": "채팅", "section": "보기"},
        "$preview": {"width": 390, "height": 844},
    }
    props_json = json.dumps(props, ensure_ascii=False, separators=(",", ":"))
    assert "'" not in props_json
    html = ("<!doctype html>\n<html lang=\"ko\">\n<head>\n<meta charset=\"utf-8\">\n<title>AGORA 써 보기</title>\n"
            "<script src=\"./support.js\"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n"
            "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700;800&amp;family=Gowun+Batang:wght@400;700&amp;display=swap\">\n"
            f"<style>\n{helmet}\n</style>\n</helmet>\n{tpl}\n</x-dc>\n"
            f"<script type=\"text/x-dc\" data-dc-script data-props='{props_json}'>\n{logic}\n</script>\n</body>\n</html>\n")
    # newline="\n": Windows에서도 줄바꿈을 LF로 써서 캔버스 파일과 바이트 단위로 같게 한다.
    def write(path, text):
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
    write(OUT, html)
    (PROTO / "build").mkdir(exist_ok=True)
    write(PROTO / "build" / "template.html", tpl)
    write(PROTO / "build" / "logic.js", logic)
    print(f"ok: {len(html)//1024} KB, {len(keys)} bilingual strings, {len(parts)} parts")

main()
