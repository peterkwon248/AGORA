plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "app.agora"
    compileSdk = 37
    // 기기 안 AI 라이브러리(.so)의 디버그 정보를 APK에 넣기 전에 떼어 내려면 같은 NDK를 알아야 한다
    ndkVersion = "29.0.14206865"

    defaultConfig {
        applicationId = "app.agora"
        // 임시값. 로컬 LLM 런타임 요구사항·기기 실측 후 ADR-001에서 확정한다.
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "0.0.1-sprint0"
        // 기기 안 AI 라이브러리가 arm64만 있다(Sprint 0 실기기 측정용)
        ndk { abiFilters += listOf("arm64-v8a") }
    }

    // 디버그는 가상 휴대폰(x86_64)에서도 기기 안 AI를 돌린다 — 휴대폰 없이 확인용
    buildTypes {
        getByName("debug") { ndk { abiFilters += listOf("x86_64") } }
    }

    buildFeatures { compose = true }

    // 기기 안 AI가 칩에 맞는 CPU 판(.so)을 실행 중에 파일 경로로 읽는다 — APK 안에 묶인 채로는 못 읽으므로 설치 때 풀어 둔다
    packaging { jniLibs { useLegacyPackaging = true } }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // 철학자 팩을 assets/philosophers/<id>/pack.yaml 로 묶는다 — 저장소의 원본 하나만 쓴다
    sourceSets["main"].assets.directories += rootProject.file("resources").path
}

dependencies {
    implementation(project(":core:orchestration"))
    // 기기 안 AI (llama.cpp). 모델 파일은 휴대폰 앱 저장소에 따로 둔다
    implementation(project(":adapters:local-llm"))
    // 주의: :adapters:demo-inference 는 여기에 넣지 않는다 (지시서 9.3)
    // 개발용 PC 연결은 디버그 빌드에만
    debugImplementation(project(":adapters:ollama-dev"))
    // 평가 문장을 휴대폰에서 돌리는 디버그 도구(adb로 실행)
    debugImplementation(project(":tools:eval-script"))

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)
}
