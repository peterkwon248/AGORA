// AGORA 기기 안 AI — llama.cpp JNI 다리 (ADR-002).
// Kotlin 쪽 LlamaNative 와 짝이다. 한 번에 한 생성만 돈다(호출자가 직렬화한다).
//
// 원칙
// - 사용자·대화 문장(템플릿의 input 부분)은 특수 토큰으로 해석하지 않는다(설계서 23.4: 프롬프트 주입 방지).
// - 조각은 UTF-8 바이트로 넘긴다. 한글·이모지가 토큰 경계에서 잘려도 완성된 글자만 내보낸다.
// - 콜백이 false를 돌려주면 즉시 멈춘다(취소).

#include <android/log.h>
#include <jni.h>

#include <algorithm>
#include <string>
#include <vector>

#include "chat.h"
#include "common.h"
#include "llama.h"
#include "sampling.h"

#define TAG "AGORA-llama"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

namespace {

// 생성 결과 코드 — LlamaNative.kt 와 같은 값
constexpr int STATUS_COMPLETED = 0;      // 끝 토큰(EOG)
constexpr int STATUS_MAX_TOKENS = 1;     // 출력 한도에 닿음
constexpr int STATUS_CANCELLED = 2;
constexpr int STATUS_PROMPT_TOO_LONG = -1;
constexpr int STATUS_DECODE_FAILED = -2;
constexpr int STATUS_TEMPLATE_FAILED = -3;

struct Session {
    llama_model * model = nullptr;
    llama_context * ctx = nullptr;
    common_chat_templates_ptr templates;
    int n_ctx = 0;
};

void log_to_android(ggml_log_level level, const char * text, void *) {
    int prio = level == GGML_LOG_LEVEL_ERROR ? ANDROID_LOG_ERROR
             : level == GGML_LOG_LEVEL_WARN ? ANDROID_LOG_WARN
             : ANDROID_LOG_DEBUG;
    __android_log_write(prio, TAG, text);
}

std::string to_std(JNIEnv * env, jstring s) {
    const char * c = env->GetStringUTFChars(s, nullptr);
    std::string out(c);
    env->ReleaseStringUTFChars(s, c);
    return out;
}

// buf 앞부분 중 완성된 UTF-8 글자까지의 길이. 뒤에 잘린 글자는 다음 조각과 합친다.
size_t complete_utf8_prefix(const std::string & buf) {
    size_t i = 0, last_ok = 0;
    const auto * b = reinterpret_cast<const unsigned char *>(buf.data());
    while (i < buf.size()) {
        unsigned char c = b[i];
        size_t n = c < 0x80 ? 1 : (c >> 5) == 0x6 ? 2 : (c >> 4) == 0xE ? 3 : (c >> 3) == 0x1E ? 4 : 1;
        if (i + n > buf.size()) break;
        i += n;
        last_ok = i;
    }
    return last_ok;
}

}  // namespace

extern "C" JNIEXPORT void JNICALL
Java_app_agora_inference_llamacpp_LlamaNative_nativeInit(JNIEnv *, jobject) {
    llama_log_set(log_to_android, nullptr);
    llama_backend_init();
    LOGI("backend ready: %s", llama_print_system_info());
}

extern "C" JNIEXPORT jlong JNICALL
Java_app_agora_inference_llamacpp_LlamaNative_nativeLoad(JNIEnv * env, jobject, jstring jpath, jint n_ctx, jint n_threads) {
    const std::string path = to_std(env, jpath);
    auto * s = new Session();

    llama_model_params mp = llama_model_default_params();
    // 파일 매핑(mmap) 대신 메모리에 통째로 읽는다. 휴대폰은 여유 메모리가 적어 매핑된 쪽이 먼저 밀려나고,
    // 그러면 매 토큰마다 저장소에서 다시 읽어 느려진다(실측 2026-10-18 Z Fold7: 입력 873토큰에 82초).
    mp.load_mode = LLAMA_LOAD_MODE_NONE;
    s->model = llama_model_load_from_file(path.c_str(), mp);
    if (!s->model) {
        LOGE("model load failed: %s", path.c_str());
        delete s;
        return 0;
    }

    llama_context_params cp = llama_context_default_params();
    cp.n_ctx = n_ctx;
    cp.n_batch = 512;
    cp.n_ubatch = 512;
    cp.n_threads = n_threads;
    cp.n_threads_batch = n_threads;
    s->ctx = llama_init_from_model(s->model, cp);
    if (!s->ctx) {
        LOGE("context init failed (n_ctx=%d)", n_ctx);
        llama_model_free(s->model);
        delete s;
        return 0;
    }
    s->n_ctx = n_ctx;
    s->templates = common_chat_templates_init(s->model, "");

    char desc[128];
    llama_model_desc(s->model, desc, sizeof(desc));
    LOGI("loaded %s | n_ctx=%d threads=%d", desc, n_ctx, n_threads);
    return reinterpret_cast<jlong>(s);
}

extern "C" JNIEXPORT jstring JNICALL
Java_app_agora_inference_llamacpp_LlamaNative_nativeDescribe(JNIEnv * env, jobject, jlong handle) {
    auto * s = reinterpret_cast<Session *>(handle);
    char desc[128];
    llama_model_desc(s->model, desc, sizeof(desc));
    return env->NewStringUTF(desc);
}

/**
 * roles: 0=system 1=user 2=assistant. stats(LongArray 4칸)에 [입력 토큰, 출력 토큰, 입력 처리 µs, 첫 토큰까지 µs]를 채운다.
 * sink.onToken(byte[]) 이 false면 멈춘다.
 */
extern "C" JNIEXPORT jint JNICALL
Java_app_agora_inference_llamacpp_LlamaNative_nativeGenerate(
        JNIEnv * env, jobject, jlong handle,
        jintArray jroles, jobjectArray jcontents,
        jint max_tokens, jfloat temperature, jint seed,
        jobject sink, jlongArray jstats) {
    auto * s = reinterpret_cast<Session *>(handle);
    const llama_vocab * vocab = llama_model_get_vocab(s->model);

    jclass sink_cls = env->GetObjectClass(sink);
    jmethodID on_token = env->GetMethodID(sink_cls, "onToken", "([B)Z");

    // 1) 대화 → 모델 고유 채팅 템플릿(jinja)
    common_chat_templates_inputs inputs;
    const jsize n_msgs = env->GetArrayLength(jcontents);
    jint * roles = env->GetIntArrayElements(jroles, nullptr);
    for (jsize i = 0; i < n_msgs; i++) {
        common_chat_msg m;
        m.role = roles[i] == 0 ? "system" : roles[i] == 1 ? "user" : "assistant";
        auto js = (jstring) env->GetObjectArrayElement(jcontents, i);
        m.content = to_std(env, js);
        env->DeleteLocalRef(js);
        inputs.messages.push_back(std::move(m));
    }
    env->ReleaseIntArrayElements(jroles, roles, JNI_ABORT);
    inputs.use_jinja = true;
    inputs.add_generation_prompt = true;
    inputs.enable_thinking = false;  // Qwen3 '생각' 단계를 끈다 — 답만 받는다

    common_chat_params params;
    try {
        params = common_chat_templates_apply(s->templates.get(), inputs);
    } catch (const std::exception & e) {
        LOGE("chat template failed: %s", e.what());
        return STATUS_TEMPLATE_FAILED;
    }

    // 2) 토큰화 — 템플릿 부분만 특수 토큰을 해석한다
    std::vector<llama_token> prompt;
    for (size_t i = 0; i < params.prompt.parts.size(); i++) {
        const auto & part = params.prompt.parts[i];
        auto toks = common_tokenize(vocab, part.text, /* add_special */ i == 0, /* parse_special */ !part.is_input);
        prompt.insert(prompt.end(), toks.begin(), toks.end());
    }
    if ((int) prompt.size() + max_tokens >= s->n_ctx) {
        LOGW("prompt too long: %d + %d >= %d", (int) prompt.size(), max_tokens, s->n_ctx);
        return STATUS_PROMPT_TOO_LONG;
    }

    // 3) 입력 처리 — 매번 새로 시작한다(화자가 바뀌면 앞부분이 달라서 캐시 재사용 이득이 작다. 측정 후 다시 본다)
    llama_memory_clear(llama_get_memory(s->ctx), true);
    const int64_t t0 = ggml_time_us();
    common_batch batch(s->ctx);
    for (size_t i = 0; i < prompt.size(); i += 512) {
        batch.clear();
        const size_t end = std::min(prompt.size(), i + 512);
        for (size_t j = i; j < end; j++) batch.add(prompt[j], (llama_pos) j, 0, j == prompt.size() - 1);
        if (llama_process(s->ctx, LLAMA_PROCESS_TYPE_DECODE, batch.get()) != 0) {
            LOGE("prompt decode failed at %zu", i);
            return STATUS_DECODE_FAILED;
        }
    }
    const int64_t t_prompt = ggml_time_us() - t0;

    // 4) 생성
    common_params_sampling sp;
    sp.temp = temperature;
    if (seed >= 0) sp.seed = (uint32_t) seed;
    common_sampler * smpl = common_sampler_init(s->model, sp);

    int status = STATUS_MAX_TOKENS;
    int n_out = 0;
    int64_t t_first = 0;
    std::string pending;
    llama_pos pos = (llama_pos) prompt.size();
    for (; n_out < max_tokens; n_out++) {
        const llama_token tok = common_sampler_sample(smpl, s->ctx, -1);
        common_sampler_accept(smpl, tok, true);
        if (llama_vocab_is_eog(vocab, tok)) { status = STATUS_COMPLETED; break; }
        if (n_out == 0) t_first = ggml_time_us() - t0;

        pending += common_token_to_piece(s->ctx, tok, /* special */ false);
        const size_t ok = complete_utf8_prefix(pending);
        if (ok > 0) {
            jbyteArray bytes = env->NewByteArray((jsize) ok);
            env->SetByteArrayRegion(bytes, 0, (jsize) ok, reinterpret_cast<const jbyte *>(pending.data()));
            const jboolean go_on = env->CallBooleanMethod(sink, on_token, bytes);
            env->DeleteLocalRef(bytes);
            pending.erase(0, ok);
            if (env->ExceptionCheck() || !go_on) { status = STATUS_CANCELLED; n_out++; break; }
        }

        batch.clear();
        batch.add(tok, pos++, 0, true);
        if (llama_process(s->ctx, LLAMA_PROCESS_TYPE_DECODE, batch.get()) != 0) {
            LOGE("decode failed at token %d", n_out);
            status = STATUS_DECODE_FAILED;
            break;
        }
    }
    common_sampler_free(smpl);

    jlong stats[4] = { (jlong) prompt.size(), (jlong) n_out, (jlong) t_prompt, (jlong) t_first };
    env->SetLongArrayRegion(jstats, 0, 4, stats);
    LOGI("generate status=%d in=%d out=%d prompt=%.0fms first=%.0fms total=%.0fms",
         status, (int) prompt.size(), n_out, t_prompt / 1000.0, t_first / 1000.0, (ggml_time_us() - t0) / 1000.0);
    return status;
}

extern "C" JNIEXPORT void JNICALL
Java_app_agora_inference_llamacpp_LlamaNative_nativeFree(JNIEnv *, jobject, jlong handle) {
    auto * s = reinterpret_cast<Session *>(handle);
    if (!s) return;
    s->templates.reset();
    if (s->ctx) llama_free(s->ctx);
    if (s->model) llama_model_free(s->model);
    delete s;
}
