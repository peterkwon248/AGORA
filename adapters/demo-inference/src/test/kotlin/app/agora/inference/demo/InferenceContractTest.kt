package app.agora.inference.demo

import app.agora.inference.FailureCode
import app.agora.inference.GenerateEvent
import app.agora.inference.GenerateRequest
import app.agora.inference.GenerationScope
import app.agora.inference.GenerationTask
import app.agora.inference.ProviderType
import app.agora.inference.ScopeType
import app.agora.inference.UnavailableInferenceProvider
import app.agora.inference.collectOutcome
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

class InferenceContractTest {
    private fun req(id: String, speaker: String? = "nietzsche") = GenerateRequest(
        generationId = id,
        scope = GenerationScope(ScopeType.ROOM, "room-1"),
        speakerId = speaker,
        task = GenerationTask.CHAT,
        locale = "ko",
        personaVersion = null,
        contextRefs = emptyList(),
        messages = emptyList(),
        maxOutputTokens = 128,
        deadlineMs = 10_000,
    )

    @Test
    fun `완료된 생성만 저장할 텍스트를 준다`() = runTest {
        val p = DemoInferenceProvider(mapOf("nietzsche" to listOf("짧게 말하겠소.")))
        val out = p.generate(req("g1")).collectOutcome()
        assertEquals("짧게 말하겠소.", out.text)
        assertEquals(out.text, out.streamedText)
    }

    @Test
    fun `취소되면 부분 문장이 있어도 저장할 텍스트는 없다`() = runTest {
        val p = DemoInferenceProvider(mapOf("nietzsche" to listOf("아주 긴 문장이 이어집니다. 끝까지 가지 않습니다.")), tokenDelayMs = 10, chunkChars = 2)
        val job = async { p.generate(req("g2")).collectOutcome() }
        delay(25)
        p.cancel("g2")
        val out = job.await()
        assertIs<GenerateEvent.Cancelled>(out.terminal)
        assertNull(out.text)
        assertTrue(out.streamedText.isNotEmpty(), "취소 전 조각은 흘러왔어야 시험이 의미 있다")
    }

    @Test
    fun `데모 제공자는 스스로 DEMO라고 밝힌다`() {
        assertEquals(ProviderType.DEMO, DemoInferenceProvider(emptyMap()).capabilities().providerType)
    }

    @Test
    fun `모델이 없으면 데모 문장 대신 MODEL_NOT_INSTALLED로 실패한다`() = runTest {
        val out = UnavailableInferenceProvider().generate(req("g3")).collectOutcome()
        val failed = assertIs<GenerateEvent.Failed>(out.terminal)
        assertEquals(FailureCode.MODEL_NOT_INSTALLED, failed.code)
        assertNull(out.text)
    }
}
