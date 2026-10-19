// 기기 안 AI 어댑터 (ADR-002): llama.cpp(GGUF)를 NDK·JNI로 붙인다. 릴리스 앱에 들어가는 유일한 생성 경로.
// llama.cpp 소스는 third_party/llama.cpp (git submodule, 커밋 고정). 모델 파일은 저장소에 넣지 않는다.
plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "app.agora.inference.llamacpp"
    compileSdk = 37
    ndkVersion = "29.0.14206865"

    defaultConfig {
        minSdk = 28
        // Sprint 0: 실기기(arm64)만. 에뮬레이터용 x86_64는 필요해질 때 추가한다.
        ndk { abiFilters += listOf("arm64-v8a") }
        externalNativeBuild {
            cmake {
                arguments += listOf(
                    "-DCMAKE_BUILD_TYPE=Release",
                    // arm64는 llama.cpp를 여러 .so로 나눠 만든다(CMakeLists.txt) — C++ 표준 라이브러리는 하나를 같이 쓴다
                    "-DANDROID_STL=c++_shared",
                    "-DLLAMA_BUILD_COMMON=ON",
                    "-DLLAMA_BUILD_TESTS=OFF",
                    "-DLLAMA_BUILD_TOOLS=OFF",
                    "-DLLAMA_BUILD_EXAMPLES=OFF",
                    "-DLLAMA_BUILD_SERVER=OFF",
                    "-DLLAMA_BUILD_APP=OFF",
                    "-DLLAMA_OPENSSL=OFF",
                    "-DGGML_NATIVE=OFF",
                    "-DGGML_OPENMP=OFF",
                    "-DGGML_LLAMAFILE=OFF",
                    // CPU 명령어는 고정하지 않는다 — 칩에 맞는 판을 실행 중에 고른다(CMakeLists.txt)
                )
            }
        }
    }

    // 디버그는 가상 휴대폰(x86_64)용도 — 휴대폰 없이 노트북 에뮬레이터에서 맞는지 확인한다
    buildTypes {
        getByName("debug") { ndk { abiFilters += listOf("x86_64") } }
    }

    externalNativeBuild {
        cmake {
            path("src/main/cpp/CMakeLists.txt")
            version = "3.31.6"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    api(project(":core:inference-api"))
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.kotlin.test)
}
