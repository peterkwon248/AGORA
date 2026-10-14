package app.agora.philosophers

import com.charleskorn.kaml.Yaml
import com.charleskorn.kaml.YamlConfiguration

/** 팩 하나를 못 쓰게 된 이유. 앱은 멈추지 않고 그 팩만 뺀다(계약 4장 1·2). */
data class RejectedPack(val source: String, val id: String?, val reasons: List<String>)

sealed interface AliasBinding {
    data class Bound(val philosopherId: String) : AliasBinding
    /** 둘 이상이 같은 별칭을 씀 → 자동 바인딩하지 말고 사용자에게 고르게 한다 */
    data class Ambiguous(val candidates: List<String>) : AliasBinding
    data object None : AliasBinding
}

/**
 * 철학자 등록부. 기능 코드는 철학자를 오직 이 클래스를 통해 ID로만 다룬다.
 * 철학자별 분기 코드를 쓰지 않는다(지시서 4.3 금지 사항).
 */
class PhilosopherRegistry private constructor(
    private val byId: Map<String, PhilosopherPack>,
    val rejected: List<RejectedPack>,
) {
    private val legacy: Map<String, String> =
        byId.values.flatMap { p -> p.legacyIds.map { it to p.id } }.toMap()

    /** 별칭(소문자) → 그 별칭을 쓰는 철학자들 */
    private val aliasIndex: Map<String, List<String>> =
        byId.values
            .flatMap { p -> (p.aliases.all() + p.display.name.ko + p.display.name.en).map { it.lowercase().trim() to p.id } }
            .filter { it.first.isNotEmpty() }
            .groupBy({ it.first }, { it.second })
            .mapValues { (_, ids) -> ids.distinct() }

    fun get(id: String): PhilosopherPack? = byId[id]

    fun require(id: String): PhilosopherPack = byId[id] ?: error("등록되지 않은 철학자: $id")

    /** 과거 기록·목록 표시용 — 비활성 포함 전부 */
    fun all(): List<PhilosopherPack> = byId.values.sortedWith(compareBy({ it.order }, { it.id }))

    /** 새 방 멤버·멘션·선제 연락 대상 — 비활성 제외 */
    fun selectable(): List<PhilosopherPack> = all().filter { it.status != PackStatus.DISABLED }

    fun idForLegacy(legacyId: String): String? = legacy[legacyId]

    /**
     * `@` 자동완성 후보. 이름·별칭 앞부분이 맞으면 후보(1글자 별칭 포함).
     * 비활성 철학자는 나오지 않는다.
     */
    fun suggest(query: String): List<PhilosopherPack> {
        val q = query.lowercase().trim()
        return selectable().filter { p ->
            q.isEmpty() || (p.aliases.all() + p.display.name.ko + p.display.name.en + listOfNotNull(p.display.fullName?.ko, p.display.fullName?.en))
                .any { it.lowercase().startsWith(q) }
        }
    }

    /**
     * 사용자가 목록에서 고르지 않고 직접 친 `@문자열`을 묶는다(설계서 6장 구현 규칙).
     * 2글자 미만은 묶지 않고, 여러 명이 해당하면 [AliasBinding.Ambiguous].
     */
    fun bindTyped(token: String): AliasBinding {
        val t = token.lowercase().trim()
        if (t.length < 2) return AliasBinding.None
        val ids = aliasIndex[t].orEmpty().filter { byId[it]?.status != PackStatus.DISABLED }
        return when (ids.size) {
            0 -> AliasBinding.None
            1 -> AliasBinding.Bound(ids.single())
            else -> AliasBinding.Ambiguous(ids)
        }
    }

    companion object {
        private val yaml = Yaml(configuration = YamlConfiguration(strictMode = false))

        fun parse(text: String): PhilosopherPack = yaml.decodeFromString(PhilosopherPack.serializer(), text)

        /** @param sources (출처 이름, YAML 본문) 목록. 파일·assets·다운로드 어디서 왔든 같다. */
        fun load(sources: List<Pair<String, String>>): PhilosopherRegistry {
            val rejected = mutableListOf<RejectedPack>()
            val ok = mutableListOf<Pair<String, PhilosopherPack>>()
            for ((name, text) in sources) {
                val pack = try {
                    parse(text)
                } catch (e: Exception) {
                    rejected += RejectedPack(name, null, listOf("YAML 해석 실패: ${e.message?.lineSequence()?.firstOrNull()}"))
                    continue
                }
                val problems = validatePack(pack)
                if (problems.isEmpty()) ok += name to pack else rejected += RejectedPack(name, pack.id, problems)
            }
            // 같은 ID가 둘 이상이면 둘 다 거부 — 어느 쪽이 진짜인지 추측하지 않는다
            val dupIds = ok.groupBy { it.second.id }.filterValues { it.size > 1 }.keys
            for ((name, p) in ok.filter { it.second.id in dupIds }) {
                rejected += RejectedPack(name, p.id, listOf("id '${p.id}' 중복"))
            }
            val accepted = ok.filter { it.second.id !in dupIds }.associate { it.second.id to it.second }
            return PhilosopherRegistry(accepted, rejected)
        }
    }
}
