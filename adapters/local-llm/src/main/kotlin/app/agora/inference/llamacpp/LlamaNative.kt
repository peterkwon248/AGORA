package app.agora.inference.llamacpp

/** agora_llama.cpp 와 짝인 JNI 함수들. 직접 쓰지 말고 [LlamaCppProvider]를 거친다. */
internal object LlamaNative {
    const val STATUS_COMPLETED = 0
    const val STATUS_MAX_TOKENS = 1
    const val STATUS_CANCELLED = 2
    const val STATUS_PROMPT_TOO_LONG = -1
    const val STATUS_DECODE_FAILED = -2
    const val STATUS_TEMPLATE_FAILED = -3

    const val ROLE_SYSTEM = 0
    const val ROLE_USER = 1
    const val ROLE_ASSISTANT = 2

    init {
        System.loadLibrary("agora_llama")
        nativeInit()
    }

    /** 생성 조각을 받는다. false를 돌려주면 생성이 멈춘다. 조각은 완성된 UTF-8 글자로만 온다. */
    fun interface TokenSink {
        fun onToken(utf8: ByteArray): Boolean
    }

    external fun nativeInit()

    /** 실패하면 0. */
    external fun nativeLoad(path: String, nCtx: Int, nThreads: Int): Long

    external fun nativeDescribe(handle: Long): String

    /** stats(4칸): 입력 토큰, 출력 토큰, 입력 처리 µs, 첫 토큰까지 µs */
    external fun nativeGenerate(
        handle: Long,
        roles: IntArray,
        contents: Array<String>,
        maxTokens: Int,
        temperature: Float,
        topK: Int,
        topP: Float,
        minP: Float,
        repeatPenalty: Float,
        seed: Int,
        sink: TokenSink,
        stats: LongArray,
    ): Int

    external fun nativeFree(handle: Long)
}
