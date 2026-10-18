package app.agora.inference.llamacpp

import android.content.Context
import java.io.File

/**
 * 휴대폰에 놓인 GGUF 모델 찾기. 자리: 앱 내부 저장소 `files/models/` (다른 앱이 못 읽는다).
 * `Android/data/<앱>/`에 adb push한 파일은 올린 사용자(shell) 소유라 앱에서 안 보인다 — 실측 2026-10-18 Z Fold7.
 * 개발 중 넣는 법: `adb shell "cat <파일> | run-as app.agora sh -c 'cat > files/models/<이름>'"`.
 * 모델은 앱 안에 넣지 않는다 — 저장소(공개)와 APK에 가중치를 싣지 않는다(AGENTS.md).
 */
object LocalModels {
    fun dir(context: Context): File = File(context.filesDir, "models")

    fun list(context: Context): List<File> =
        dir(context).listFiles { f -> f.isFile && f.name.endsWith(".gguf") && !f.name.startsWith("mmproj") }
            ?.sortedBy { it.name }.orEmpty()

    /** [preferred] 이름이 있으면 그것, 없으면 [DEFAULT_ORDER] 순으로 처음 있는 것. 하나도 없으면 null. */
    fun pick(context: Context, preferred: String?): File? {
        val all = list(context)
        preferred?.let { p -> all.firstOrNull { it.name == p }?.let { return it } }
        for (prefix in DEFAULT_ORDER) all.firstOrNull { it.name.startsWith(prefix) }?.let { return it }
        return all.firstOrNull()
    }

    /** Sprint 0 임시 순서 — 첫 실기기 비교(qa/device-logs/20261018-zfold7-first-run.md)에서 Gemma 4 E2B가 빠르고 한국어가 자연스러웠다. ADR-002에서 확정 */
    private val DEFAULT_ORDER = listOf("gemma-4-E2B", "Qwen3-4B", "Qwen3-1.7B")
}
