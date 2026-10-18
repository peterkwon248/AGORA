plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "app.agora"
    compileSdk = 37

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

    buildFeatures { compose = true }

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
