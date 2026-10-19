# PC 시험 결과 세기 — qa/pc-runs/*.md 를 같은 기준으로 센다.
# 사용: python tools/pc-harness/analyze_runs.py . qa/pc-runs/<파일>.md ...
# 기계적 기준이라 대략값이다(예시 복사는 문장 앞 15자 일치, 니체 말투는 문장 끝 글자로 판정).
import re, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')

root = pathlib.Path(sys.argv[1])
runs = sys.argv[2:]

def examples(pid):
    t = (root / f"resources/philosophers/{pid}/pack.yaml").read_text(encoding="utf-8")
    t = t[t.index("examples:"):]
    return re.findall(r'-\s+"([^"]+)"', t.split("relations:")[0])

EX = {"니체": examples("nietzsche"), "쇼펜하우어": examples("schopenhauer"),
      "Nietzsche": examples("nietzsche"), "Schopenhauer": examples("schopenhauer")}

def norm(s):
    return re.sub(r'[^0-9A-Za-z가-힣]', '', s)

def common_run(a, b):
    """두 글의 가장 긴 공통 조각 길이(공백·부호 뺀 글자)"""
    a, b = norm(a), norm(b)
    best = 0
    for i in range(len(a)):
        for j in range(i + best + 1, len(a) + 1):
            if a[i:j] in b: best = j - i
            else: break
    return best

OPENER = re.compile(r'^(그렇소|그렇지요|그렇군요|그렇습니다|맞소|맞습니다|그렇지|Yes|Indeed)')

def sentences(s):
    return [x.strip() for x in re.split(r'(?<=[.?!])\s+', s) if len(x.strip()) >= 8]

for run in runs:
    text = (root / run).read_text(encoding="utf-8")
    print(f"\n### {run}")
    cases = re.split(r'^## ', text, flags=re.M)[1:]
    tot = dict(cases=0, silent=0, fail=0, han=0, label=0, copy=0, nz_hao=0, nz_haeyo=0, turns=0, eng=0, broken=0, self3=0, appword=0, echo=0, opener=0, repeat=0, nz_banmal=0)
    for c in cases:
        cid = c.splitlines()[0].strip()
        tot["cases"] += 1
        lines = re.findall(r'^\*\*\[([^\]]+)\]\*\*( ↪)? (.*?)(?=^\*\*\[|^_|^❌|\Z)', c, flags=re.M | re.S)
        speakers = [(n, b.strip()) for n, _, b in lines if n not in ("나", "User")]
        first = speakers[0][0] if speakers else "-"
        silent = len(re.findall(r'침묵\)', c)); fail = c.count("❌")
        tot["silent"] += silent; tot["fail"] += fail
        notes = []
        user = re.search(r'^\*\*\[(?:나|User)\]\*\* (.*)$', c, flags=re.M)
        prev = user.group(1) if user else ""
        for n, b in speakers:
            tot["turns"] += 1
            if re.search(r'[一-鿿]', b): tot["han"] += 1; notes.append(f"{n}:한자")
            if re.search(r'[가-힣]', b) and re.search(r'[A-Za-z]{3,}\s+[A-Za-z]{2,}', b): tot["eng"] += 1; notes.append(f"{n}:영어")
            if '�' in b: tot["broken"] += 1; notes.append(f"{n}:깨진글자")
            if re.search(r'\[[^\]]+\]|^\s*[A-Z ]{4,}\s*\]', b, flags=re.M): tot["label"] += 1; notes.append(f"{n}:이름표")
            hit = [s for s in sentences(b) for e in EX.get(n, []) if s in e or (len(s) >= 15 and s[:15] in e)]
            if hit: tot["copy"] += 1; notes.append(f"{n}:예시복사「{hit[0][:25]}」")
            if n in b: tot["self3"] += 1; notes.append(f"{n}:자기3인칭")
            if re.search(r'사용자|@\w|\bthe user\b', b): tot["appword"] += 1; notes.append(f"{n}:앱말")
            if re.search(r'말씀대로|말씀처럼|As \w+ said', b): tot["echo"] += 1
            if OPENER.search(b): tot["opener"] += 1
            # 엔진 검사(ReplyGuard echoedSentences)와 같은 기준: 겹친 조각 12글자 이상이면서 그 문장의 70% 이상
            if any(common_run(x, prev) >= max(12, 0.7 * len(norm(x))) for x in sentences(b)): tot["repeat"] += 1; notes.append(f"{n}:앞말되풀이")
            prev = b
            if n == "니체":
                for s in sentences(b):
                    if re.search(r'(오|소|구려)[.?!]$', s): tot["nz_hao"] += 1
                    elif re.search(r'요[.?!]$', s): tot["nz_haeyo"] += 1
                    elif re.search(r'(지|네|군|야|어|걸|래|다)[.?!]$', s): tot["nz_banmal"] += 1; notes.append(f"니체:반말「{s[-12:]}」")
        m = re.search(r'자율 차례 (\d+)개 사용 · ([\d.]+)초', c)
        print(f"- {cid}: 첫 화자 {first} · 발화 {len(speakers)} · 침묵 {silent} · 실패 {fail} · {m.group(2)+'초' if m else '-'} {' '.join(notes)}")
    print(f"  합계: 사례 {tot['cases']} · 발화 {tot['turns']} · 침묵 {tot['silent']} · 실패 {tot['fail']} · 한자 섞인 발화 {tot['han']} · 영어 섞인 한국어 발화 {tot['eng']} · 깨진 글자 {tot['broken']} · 이름표 {tot['label']} · 예시를 베낀 발화 {tot['copy']} · 자기 3인칭 {tot['self3']} · 앱 내부 말 {tot['appword']} · '말씀대로' 맞장구 {tot['echo']} · 니체 하오체 {tot['nz_hao']}/해요체 {tot['nz_haeyo']}/반말 {tot['nz_banmal']} · 맞장구로 시작 {tot['opener']} · 앞말 되풀이 {tot['repeat']}")
