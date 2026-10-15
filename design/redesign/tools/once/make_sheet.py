import re, sys, pathlib
proj = pathlib.Path(sys.argv[1])
src = (proj / "PhilImages.dc.html").read_text(encoding="utf-8")
root_open = '<div style="width: 390px; height: 844px; box-sizing: border-box; display: flex; flex-direction: column; background: #F5F4F9; color: #1C1930; font-family: \'Gothic A1\', sans-serif; overflow: hidden;">'
start = src.index(root_open) + len(root_open)
end = src.index("</div>\n</x-dc>")
inner = src[start:end].strip("\n")
inner = "\n".join(("  " + l) if l.strip() else l for l in inner.split("\n"))

CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#625E7A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none;"><path d="m9 18 6-6-6-6"></path></svg>'

sheet = f'''
  <div aria-hidden="true" style="position: absolute; inset: 0; background: rgba(28, 25, 48, 0.42);"></div>

  <section role="dialog" aria-modal="true" aria-labelledby="sheet-h" style="position: absolute; left: 0; right: 0; bottom: 0; padding: 8px 16px 24px; border-radius: 28px 28px 0 0; background: #FFFFFF; box-shadow: 0 -8px 24px rgba(28, 25, 48, 0.12); display: flex; flex-direction: column;">
    <span style="align-self: center; width: 36px; height: 4px; margin-bottom: 14px; border-radius: 2px; background: #CDC9DA;" aria-hidden="true"></span>
    <div style="padding: 0 4px 10px; display: flex; flex-direction: column; gap: 2px;">
      <h2 id="sheet-h" style="margin: 0; font-size: 18px; line-height: 25px; font-weight: 800;">니체 이미지</h2>
      <span style="font-size: 13px; line-height: 18px; color: #625E7A;">앨범이나 카메라로 바꿀 수 있어요</span>
    </div>

    <a href="PhilImageCrop.dc.html" style="min-height: 68px; padding: 8px 4px; box-sizing: border-box; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;">
      <span style="width: 44px; height: 44px; flex: none; border-radius: 14px; background: #E8E5FD; color: #3A2BB0; display: flex; align-items: center; justify-content: center;" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m21 16-5-5-9 9"></path></svg></span>
      <span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 15px; line-height: 21px; font-weight: 700;">앨범에서 고르기</span>
        <span style="font-size: 13px; line-height: 18px; color: #625E7A;">내 사진이나 저장해 둔 그림</span>
      </span>
      {CHEV}
    </a>
    <a href="PhilImageCrop.dc.html" style="min-height: 68px; padding: 8px 4px; box-sizing: border-box; box-shadow: inset 0 1px 0 #E2DFEB; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;">
      <span style="width: 44px; height: 44px; flex: none; border-radius: 14px; background: #E8E5FD; color: #3A2BB0; display: flex; align-items: center; justify-content: center;" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13" r="3.5"></circle></svg></span>
      <span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 15px; line-height: 21px; font-weight: 700;">사진 찍기</span>
        <span style="font-size: 13px; line-height: 18px; color: #625E7A;">찍은 다음 동그랗게 맞춰요</span>
      </span>
      {CHEV}
    </a>
    <div aria-current="true" style="min-height: 68px; padding: 8px 4px; box-sizing: border-box; box-shadow: inset 0 1px 0 #E2DFEB; display: flex; align-items: center; gap: 14px;">
      <img src="/_blob/7cd6b76182321c6d5c5922ddec00c1ca" alt="" style="width: 40px; height: 40px; margin: 2px; flex: none; border-radius: 50%; object-fit: cover; filter: grayscale(1) contrast(1.06); background: #ECEAF3; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3.5px #B0353F;">
      <span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 15px; line-height: 21px; font-weight: 700;">앱이 준 초상</span>
        <span style="font-size: 13px; line-height: 18px; color: #625E7A;">지금 쓰는 중</span>
      </span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4636CC" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-right: 4px;"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
    </div>

    <p style="margin: 6px 4px 14px; font-size: 12px; line-height: 18px; color: #625E7A;">바꾼 뒤에도 여기서 언제든 앱 초상으로 되돌릴 수 있어요. 고른 이미지는 이 기기 밖으로 나가지 않아요.</p>
    <a href="PhilImages.dc.html" style="height: 48px; border-radius: 999px; background: #ECEAF3; color: #1C1930; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-decoration: none;">닫기</a>
  </section>
'''

head = src[:src.index("<title>")] + "<title>철학자 이미지 — 바꾸기 시트</title>" + src[src.index("</title>") + len("</title>"):src.index(root_open)]
tail = src[end:]
new_root = '<div style="position: relative; width: 390px; height: 844px; box-sizing: border-box; background: #F5F4F9; color: #1C1930; font-family: \'Gothic A1\', sans-serif; overflow: hidden;">'
bg_open = '\n\n  <div inert aria-hidden="true" style="height: 100%; display: flex; flex-direction: column;">\n'
out = head + new_root + bg_open + inner + "\n  </div>\n" + sheet + tail
(proj / "PhilImageSheet.dc.html").write_text(out, encoding="utf-8")
print("ok", len(out))
